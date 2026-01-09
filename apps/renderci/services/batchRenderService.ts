/**
 * Batch Render Service for Renderci
 * Manages render queue and job processing
 */

import {
  RenderJob,
  RenderQueue,
  BatchRenderConfig,
  RenderStatus,
  DEFAULT_BATCH_CONFIG,
  QUALITY_PRESETS
} from '../types/batch-render';

type QueueEventHandler = (queue: RenderQueue) => void;
type JobEventHandler = (job: RenderJob) => void;

class BatchRenderService {
  private queues: Map<string, RenderQueue> = new Map();
  private currentQueue: string | null = null;
  private isProcessing = false;
  private onQueueUpdate: QueueEventHandler | null = null;
  private onJobUpdate: JobEventHandler | null = null;

  // === Queue Management ===

  createQueue(name: string, config?: Partial<BatchRenderConfig>): RenderQueue {
    const queue: RenderQueue = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      jobs: [],
      config: { ...DEFAULT_BATCH_CONFIG, ...config },
      status: 'idle',
      completedCount: 0,
      failedCount: 0,
      createdAt: new Date(),
    };

    this.queues.set(queue.id, queue);
    return queue;
  }

  getQueue(queueId: string): RenderQueue | undefined {
    return this.queues.get(queueId);
  }

  getAllQueues(): RenderQueue[] {
    return Array.from(this.queues.values());
  }

  deleteQueue(queueId: string): boolean {
    const queue = this.queues.get(queueId);
    if (queue && queue.status !== 'running') {
      this.queues.delete(queueId);
      return true;
    }
    return false;
  }

  // === Job Management ===

  addJob(queueId: string, file: { name: string; url: string; type: '2d' | '3d' | 'cad' }): RenderJob | null {
    const queue = this.queues.get(queueId);
    if (!queue) return null;

    const dimensions = QUALITY_PRESETS[queue.config.quality];

    const job: RenderJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      fileUrl: file.url,
      fileType: file.type,
      model: queue.config.model, // Pass model selection
      format: queue.config.format,
      quality: queue.config.quality,
      width: queue.config.width || dimensions.width,
      height: queue.config.height || dimensions.height,
      backgroundColor: queue.config.backgroundColor,
      transparent: queue.config.transparent,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };

    queue.jobs.push(job);
    this.notifyQueueUpdate(queue);
    return job;
  }

  addMultipleJobs(queueId: string, files: { name: string; url: string; type: '2d' | '3d' | 'cad' }[]): RenderJob[] {
    return files.map(file => this.addJob(queueId, file)).filter((job): job is RenderJob => job !== null);
  }

  removeJob(queueId: string, jobId: string): boolean {
    const queue = this.queues.get(queueId);
    if (!queue) return false;

    const jobIndex = queue.jobs.findIndex(j => j.id === jobId);
    if (jobIndex >= 0 && queue.jobs[jobIndex].status !== 'processing') {
      queue.jobs.splice(jobIndex, 1);
      this.notifyQueueUpdate(queue);
      return true;
    }
    return false;
  }

  // === Queue Control ===

  async startQueue(queueId: string): Promise<void> {
    const queue = this.queues.get(queueId);
    if (!queue || queue.status === 'running') return;

    queue.status = 'running';
    queue.startedAt = new Date();
    this.currentQueue = queueId;
    this.isProcessing = true;
    this.notifyQueueUpdate(queue);

    await this.processQueue(queue);
  }

  pauseQueue(queueId: string): void {
    const queue = this.queues.get(queueId);
    if (!queue || queue.status !== 'running') return;

    queue.status = 'paused';
    this.isProcessing = false;
    this.notifyQueueUpdate(queue);
  }

  resumeQueue(queueId: string): void {
    const queue = this.queues.get(queueId);
    if (!queue || queue.status !== 'paused') return;

    this.startQueue(queueId);
  }

  cancelQueue(queueId: string): void {
    const queue = this.queues.get(queueId);
    if (!queue) return;

    queue.status = 'idle';
    this.isProcessing = false;
    
    // Cancel pending jobs
    queue.jobs.forEach(job => {
      if (job.status === 'pending' || job.status === 'processing') {
        job.status = 'cancelled';
      }
    });

    this.notifyQueueUpdate(queue);
  }

  // === Processing ===

  private async processQueue(queue: RenderQueue): Promise<void> {
    const pendingJobs = queue.jobs.filter(j => j.status === 'pending');
    
    for (const job of pendingJobs) {
      if (!this.isProcessing || queue.status !== 'running') break;

      await this.processJob(queue, job);
    }

    // Check if all done
    if (queue.jobs.every(j => j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled')) {
      queue.status = 'completed';
      queue.completedAt = new Date();
      queue.completedCount = queue.jobs.filter(j => j.status === 'completed').length;
      queue.failedCount = queue.jobs.filter(j => j.status === 'failed').length;
      this.isProcessing = false;
    }

    this.notifyQueueUpdate(queue);
  }

  private async processJob(queue: RenderQueue, job: RenderJob): Promise<void> {
    job.status = 'processing';
    job.startedAt = new Date();
    job.progress = 0;
    this.notifyJobUpdate(job);

    try {
      // Delegate to selected backend
      const result = await this.backend.processJob(job, (progress) => {
          if (this.isProcessing && queue.status === 'running') {
              job.progress = progress;
              this.notifyJobUpdate(job);
          }
      });

      if (result.success) {
        job.status = 'completed';
        job.progress = 100;
        job.completedAt = new Date();
        job.outputUrl = result.outputUrl;
        job.outputSize = result.outputSize;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Render failed';
    }

    this.notifyJobUpdate(job);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === Backends ===
  
  private backend: RenderBackend = new SimulationBackend();

  setBackend(type: 'simulation' | 'nano-banana', config?: any) {
      if (type === 'nano-banana') {
          this.backend = new NanoBananaBackend(config?.url || 'http://localhost:5000');
      } else {
          this.backend = new SimulationBackend();
      }
  }

  // === Events ===

  onQueueChange(handler: QueueEventHandler): void {
    this.onQueueUpdate = handler;
  }

  onJobChange(handler: JobEventHandler): void {
    this.onJobUpdate = handler;
  }

  private notifyQueueUpdate(queue: RenderQueue): void {
    this.onQueueUpdate?.(queue);
  }

  private notifyJobUpdate(job: RenderJob): void {
    this.onJobUpdate?.(job);
  }

  // === Stats ===

  getQueueStats(queueId: string) {
    const queue = this.queues.get(queueId);
    if (!queue) return null;

    return {
      total: queue.jobs.length,
      pending: queue.jobs.filter(j => j.status === 'pending').length,
      processing: queue.jobs.filter(j => j.status === 'processing').length,
      completed: queue.jobs.filter(j => j.status === 'completed').length,
      failed: queue.jobs.filter(j => j.status === 'failed').length,
      cancelled: queue.jobs.filter(j => j.status === 'cancelled').length,
      progress: queue.jobs.length > 0 
        ? Math.round(queue.jobs.reduce((sum, j) => sum + j.progress, 0) / queue.jobs.length)
        : 0,
    };
  }
}

  // === Events ===

  onQueueChange(handler: QueueEventHandler): void {
    this.onQueueUpdate = handler;
  }

  onJobChange(handler: JobEventHandler): void {
    this.onJobUpdate = handler;
  }

  private notifyQueueUpdate(queue: RenderQueue): void {
    this.onQueueUpdate?.(queue);
  }

  private notifyJobUpdate(job: RenderJob): void {
    this.onJobUpdate?.(job);
  }

  // === Stats ===

  getQueueStats(queueId: string) {
    const queue = this.queues.get(queueId);
    if (!queue) return null;

    return {
      total: queue.jobs.length,
      pending: queue.jobs.filter(j => j.status === 'pending').length,
      processing: queue.jobs.filter(j => j.status === 'processing').length,
      completed: queue.jobs.filter(j => j.status === 'completed').length,
      failed: queue.jobs.filter(j => j.status === 'failed').length,
      cancelled: queue.jobs.filter(j => j.status === 'cancelled').length,
      progress: queue.jobs.length > 0 
        ? Math.round(queue.jobs.reduce((sum, j) => sum + j.progress, 0) / queue.jobs.length)
        : 0,
    };
  }
}

// === Backend Strategy Interfaces ===

export interface RenderBackend {
    processJob(job: RenderJob, onProgress: (progress: number) => void): Promise<RenderResult>;
}

export interface RenderResult {
    success: boolean;
    outputUrl?: string;
    outputSize?: number;
    error?: string;
}

// 1. Simulation Backend (Default)
class SimulationBackend implements RenderBackend {
    async processJob(job: RenderJob, onProgress: (progress: number) => void): Promise<RenderResult> {
        // Simulate render progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
            onProgress(i);
        }
        return {
            success: true,
            outputUrl: `rendered_${job.id}.${job.format}`,
            outputSize: Math.floor(Math.random() * 5000000) + 500000
        };
    }
}

// 2. Nano Banana Backend (Remote API)
class NanoBananaBackend implements RenderBackend {
    private apiUrl: string;

    constructor(url: string) {
        this.apiUrl = url;
    }

    async processJob(job: RenderJob, onProgress: (progress: number) => void): Promise<RenderResult> {
        try {
            // 1. Submit Job
            const submitRes = await fetch(`${this.apiUrl}/api/render`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileUrl: job.fileUrl,
                    model: job.model, // Pass model parameter
                    format: job.format,
                    quality: job.quality,
                    width: job.width,
                    height: job.height
                })
            });

            if (!submitRes.ok) throw new Error("Failed to submit to Nano Banana");
            const { taskId } = await submitRes.json();

            // 2. Poll for Completion
            let isComplete = false;
            let result: any = {};

            while (!isComplete) {
                await new Promise(r => setTimeout(r, 2000)); // Poll every 2s
                
                const statusRes = await fetch(`${this.apiUrl}/api/status/${taskId}`);
                if (!statusRes.ok) continue;

                const status = await statusRes.json();
                onProgress(status.progress || 0);

                if (status.state === 'completed') {
                    isComplete = true;
                    result = status;
                } else if (status.state === 'failed') {
                    throw new Error(status.error || "Remote render failed");
                }
            }

            return {
                success: true,
                outputUrl: result.outputUrl,
                outputSize: result.outputSize
            };

        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

  onQueueChange(handler: QueueEventHandler): void {
    this.onQueueUpdate = handler;
  }

  onJobChange(handler: JobEventHandler): void {
    this.onJobUpdate = handler;
  }

  private notifyQueueUpdate(queue: RenderQueue): void {
    this.onQueueUpdate?.(queue);
  }

  private notifyJobUpdate(job: RenderJob): void {
    this.onJobUpdate?.(job);
  }

  // === Stats ===

  getQueueStats(queueId: string) {
    const queue = this.queues.get(queueId);
    if (!queue) return null;

    return {
      total: queue.jobs.length,
      pending: queue.jobs.filter(j => j.status === 'pending').length,
      processing: queue.jobs.filter(j => j.status === 'processing').length,
      completed: queue.jobs.filter(j => j.status === 'completed').length,
      failed: queue.jobs.filter(j => j.status === 'failed').length,
      cancelled: queue.jobs.filter(j => j.status === 'cancelled').length,
      progress: queue.jobs.length > 0 
        ? Math.round(queue.jobs.reduce((sum, j) => sum + j.progress, 0) / queue.jobs.length)
        : 0,
    };
  }
}

// Export singleton
export const batchRenderService = new BatchRenderService();
