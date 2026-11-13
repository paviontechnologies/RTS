/**
 * Pavion RTS - Enterprise Background Job & Worker Queue Service
 * Handles asynchronous background jobs for:
 * - Resume parsing offload
 * - Submittal and Interview email dispatches
 * - 30/60-day compliance credential audit notifications
 * - AI matching computation
 */

export type QueueName =
  | 'resume-parsing'
  | 'email-notifications'
  | 'compliance-alerts'
  | 'candidate-matching';

export interface Job<T = any> {
  id: string;
  queue: QueueName;
  data: T;
  priority: 'low' | 'normal' | 'high' | 'critical';
  attempts: number;
  maxRetries: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  processedAt?: Date;
}

export type JobHandler<T = any> = (job: Job<T>) => Promise<any>;

export class QueueService {
  private static queues = new Map<QueueName, Job[]>();
  private static handlers = new Map<QueueName, JobHandler>();
  private static processing = new Map<QueueName, boolean>();
  private static deadLetterQueue: Job[] = [];

  /**
   * Register a background worker handler for a specific queue
   */
  public static registerWorker<T>(queue: QueueName, handler: JobHandler<T>): void {
    this.handlers.set(queue, handler);
    if (!this.queues.has(queue)) {
      this.queues.set(queue, []);
    }
  }

  /**
   * Dispatch a job to the background queue
   */
  public static async enqueue<T>(
    queue: QueueName,
    data: T,
    options?: { priority?: 'low' | 'normal' | 'high' | 'critical'; maxRetries?: number }
  ): Promise<Job<T>> {
    const job: Job<T> = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      queue,
      data,
      priority: options?.priority || 'normal',
      attempts: 0,
      maxRetries: options?.maxRetries ?? 3,
      status: 'queued',
      createdAt: new Date(),
    };

    if (!this.queues.has(queue)) {
      this.queues.set(queue, []);
    }

    const queueList = this.queues.get(queue)!;
    if (job.priority === 'critical') {
      queueList.unshift(job);
    } else {
      queueList.push(job);
    }

    // Trigger async processing
    this.processNext(queue);

    return job;
  }

  /**
   * Process next item in the queue asynchronously
   */
  private static async processNext(queue: QueueName): Promise<void> {
    if (this.processing.get(queue)) {
      return;
    }

    const queueList = this.queues.get(queue);
    const handler = this.handlers.get(queue);

    if (!queueList || queueList.length === 0 || !handler) {
      return;
    }

    this.processing.set(queue, true);
    const job = queueList.shift()!;
    job.status = 'processing';
    job.attempts++;
    job.processedAt = new Date();

    try {
      await handler(job);
      job.status = 'completed';
    } catch (err: any) {
      job.error = err.message || 'Worker processing error';
      if (job.attempts < job.maxRetries) {
        job.status = 'queued';
        queueList.push(job); // re-queue for retry
      } else {
        job.status = 'failed';
        this.deadLetterQueue.push(job);
      }
    } finally {
      this.processing.set(queue, false);
      if (queueList.length > 0) {
        setImmediate(() => this.processNext(queue));
      }
    }
  }

  /**
   * Get metrics and health status of all queues
   */
  public static getMetrics() {
    const queueStatus: Record<string, { pending: number; isProcessing: boolean }> = {};
    for (const [name, jobs] of this.queues.entries()) {
      queueStatus[name] = {
        pending: jobs.length,
        isProcessing: !!this.processing.get(name),
      };
    }

    return {
      activeQueues: queueStatus,
      registeredWorkers: Array.from(this.handlers.keys()),
      deadLetterCount: this.deadLetterQueue.length,
      timestamp: new Date().toISOString(),
    };
  }
}
