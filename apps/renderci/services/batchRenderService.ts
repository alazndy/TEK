
/**
 * Batch Render Service for Renderci
 * Manages render queue and job processing via Core API
 */

import {
  RenderJob,
  RenderQueue,
  BatchRenderConfig,
  DEFAULT_BATCH_CONFIG,
} from '@t-ecosystem/core-types';
import { apiClient } from '../lib/api-client';

type QueueEventHandler = (queue: RenderQueue) => void;
type JobEventHandler = (job: RenderJob) => void;

class BatchRenderService {
  private onQueueUpdate: QueueEventHandler | null = null;
  private onJobUpdate: JobEventHandler | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;

  // === Queue Management ===

  async createQueue(name: string, config?: Partial<BatchRenderConfig>): Promise<RenderQueue> {
    const res = await apiClient.post<RenderQueue>('/render-jobs/queues', { name, config });
    return res.data;
  }

  async getQueue(queueId: string): Promise<RenderQueue> {
    const res = await apiClient.get<RenderQueue>(`/render-jobs/queues/${queueId}`);
    return res.data;
  }

  async getAllQueues(): Promise<RenderQueue[]> {
    const res = await apiClient.get<RenderQueue[]>('/render-jobs/queues');
    return res.data;
  }

  async deleteQueue(queueId: string): Promise<boolean> {
    try {
        await apiClient.delete(`/render-jobs/queues/${queueId}`);
        return true;
    } catch (e) {
        return false;
    }
  }

  // === Job Management ===

  async addJob(queueId: string, file: { name: string; url: string; type: '2d' | '3d' | 'cad' }): Promise<RenderJob> {
    const res = await apiClient.post<RenderJob>(`/render-jobs/queues/${queueId}/jobs`, {
        fileName: file.name,
        fileUrl: file.url,
        fileType: file.type
    });
    return res.data;
  }

  async addMultipleJobs(queueId: string, files: { name: string; url: string; type: '2d' | '3d' | 'cad' }[]): Promise<RenderJob[]> {
    // Parallel execution
    const jobs = await Promise.all(
        files.map(file => this.addJob(queueId, file))
    );
    return jobs;
  }

  // === Queue Control ===

  async startQueue(queueId: string): Promise<void> {
    await apiClient.post(`/render-jobs/queues/${queueId}/start`);
    this.startPolling(queueId);
  }

  // === Events & Polling ===
  // Since we are now server-side, we need to poll for updates or use sockets.
  // For now, implementing simple polling when a queue is active.

  onQueueChange(handler: QueueEventHandler): void {
    this.onQueueUpdate = handler;
  }

  private startPolling(queueId: string) {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    
    this.pollingInterval = setInterval(async () => {
        try {
            const queue = await this.getQueue(queueId);
            this.onQueueUpdate?.(queue);

            if (queue.status === 'completed' || queue.status === 'idle') {
                if (this.pollingInterval) clearInterval(this.pollingInterval);
            }
        } catch (e) {
            console.error("Polling error", e);
        }
    }, 1000);
  }
  
  stopPolling() {
      if (this.pollingInterval) clearInterval(this.pollingInterval);
  }
}

// Export singleton
export const batchRenderService = new BatchRenderService();
