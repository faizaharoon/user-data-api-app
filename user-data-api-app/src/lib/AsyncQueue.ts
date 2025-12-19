type Task<T> = () => Promise<T>;

interface QueueItem<T> {
  task: Task<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}


/**
 * Asynchronous Task Queue.
 * Limits the number of concurrent tasks (concurrency control).
 */
export class AsyncQueue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private queue: QueueItem<any>[] = [];
  private processing: boolean = false; // Flag (unused currently, but good practice)
  private concurrency: number = 3; // Max number of concurrent tasks
  private activeCount: number = 0; // Current number of running tasks

  constructor(concurrency: number = 3) {
    this.concurrency = concurrency;
  }

  /**
   * Adds a task to the queue.
   * @param task A function that returns a Promise.
   * @returns A Promise that resolves with the task's result.
   */
  public enqueue<T>(task: Task<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processNext();
    });
  }

  /**
   * Processes the next task in the queue if concurrency limit permits.
   */
  private processNext() {
    if (this.activeCount >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    this.activeCount++;

    // Execute task
    item.task()
      .then(result => {
        item.resolve(result);
      })
      .catch(error => {
        item.reject(error);
      })
      .finally(() => {
        this.activeCount--;
        this.processNext(); // Trigger next task
      });
  }
}
