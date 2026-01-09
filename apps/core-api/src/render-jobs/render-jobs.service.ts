import { Injectable, NotFoundException } from "@nestjs/common";
import {
  RenderQueue,
  RenderJob,
  DEFAULT_BATCH_CONFIG,
  QUALITY_PRESETS,
  BatchRenderConfig,
} from "@t-ecosystem/core-types";
import { CreateRenderQueueDto } from "./dto/create-render-queue.dto";
import { AddJobDto } from "./dto/add-job.dto";

@Injectable()
export class RenderJobsService {
  private queues: Map<string, RenderQueue> = new Map();
  private isProcessing = false;

  createQueue(createRenderQueueDto: CreateRenderQueueDto): RenderQueue {
    const queue: RenderQueue = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: createRenderQueueDto.name,
      jobs: [],
      config: {
        ...DEFAULT_BATCH_CONFIG,
        ...createRenderQueueDto.config,
      } as BatchRenderConfig,
      status: "idle",
      completedCount: 0,
      failedCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.queues.set(queue.id, queue);
    return queue;
  }

  getAllQueues(): RenderQueue[] {
    return Array.from(this.queues.values());
  }

  getQueue(id: string): RenderQueue {
    const queue = this.queues.get(id);
    if (!queue) {
      throw new NotFoundException(`Queue with ID ${id} not found`);
    }
    return queue;
  }

  deleteQueue(id: string): void {
    const queue = this.queues.get(id);
    if (!queue) {
      throw new NotFoundException(`Queue with ID ${id} not found`);
    }
    if (queue.status === "running") {
      throw new Error("Cannot delete a running queue");
    }
    this.queues.delete(id);
  }

  addJob(queueId: string, addJobDto: AddJobDto): RenderJob {
    const queue = this.getQueue(queueId);
    const dimensions = QUALITY_PRESETS[queue.config.quality];

    const job: RenderJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileName: addJobDto.fileName,
      fileUrl: addJobDto.fileUrl,
      fileType: addJobDto.fileType,
      format: queue.config.format,
      quality: queue.config.quality,
      width: queue.config.width || dimensions.width,
      height: queue.config.height || dimensions.height,
      backgroundColor: queue.config.backgroundColor,
      transparent: queue.config.transparent,
      status: "pending",
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    queue.jobs.push(job);
    return job;
  }

  async startQueue(queueId: string): Promise<RenderQueue> {
    const queue = this.getQueue(queueId);
    if (queue.status === "running") return queue;

    queue.status = "running";
    queue.startedAt = new Date().toISOString();
    this.isProcessing = true;

    // Start processing in background (dont await)
    this.processQueue(queue);

    return queue;
  }

  // Simulation of processing
  private async processQueue(queue: RenderQueue): Promise<void> {
    const pendingJobs = queue.jobs.filter((j) => j.status === "pending");

    for (const job of pendingJobs) {
      if (!this.isProcessing || queue.status !== "running") break;
      await this.processJob(queue, job);
    }

    if (
      queue.jobs.every(
        (j) =>
          j.status === "completed" ||
          j.status === "failed" ||
          j.status === "cancelled",
      )
    ) {
      queue.status = "completed";
      queue.completedAt = new Date().toISOString();
      queue.completedCount = queue.jobs.filter(
        (j) => j.status === "completed",
      ).length;
      queue.failedCount = queue.jobs.filter(
        (j) => j.status === "failed",
      ).length;
      this.isProcessing = false;
    }
  }

  private async processJob(queue: RenderQueue, job: RenderJob): Promise<void> {
    job.status = "processing";
    job.startedAt = new Date().toISOString();
    job.progress = 0;

    try {
      // Simulate render progress
      for (let i = 0; i <= 100; i += 20) {
        if (!this.isProcessing) break;
        await this.delay(500);
        job.progress = i;
      }

      if (this.isProcessing) {
        job.status = "completed";
        job.progress = 100;
        job.completedAt = new Date().toISOString();
        job.outputUrl = `http://localhost:3001/rendered/${job.id}.${job.format}`; // Mock URL
        job.outputSize = 1024 * 1024;
      }
    } catch (error) {
      job.status = "failed";
      job.error = "Render failed";
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
