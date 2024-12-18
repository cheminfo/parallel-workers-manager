import Worker from 'web-worker';

import { createManagedWorkerString } from './createManagedWorker';

/**
 * @typedef {object} ParallelWorkersManagerOptions
 * @property {number} [maxWorkers] - The maximum number of idleWorkers to spawn.
 * @property {number} [timeout] - The maximum time in milliseconds a worker is allowed to run before being killed.
 * @property {boolean} [terminateOnError] - Whether to terminate the worker pool if a worker throws an error.
 * @property {import('cheminfo-types').Logger} [logger] - A logger instance.
 */

/**
 * A class to manage a pool of workers.
 */
export class ParallelWorkersManager {
  /**
   * Create a new ParallelWorkersManager instance.
   * @param {Function|string} func
   * @param {ParallelWorkersManagerOptions} options
   */
  constructor(func, options = {}) {
    if (typeof func !== 'string' && typeof func !== 'function') {
      throw new TypeError('func argument must be a function');
    }
    if (typeof options !== 'object' || options === null) {
      throw new TypeError('options argument must be an object');
    }

    this.logger = options.logger;
    this.timeout = options.timeout || 0;
    this.terminateOnError = !!options.terminateOnError;
    this.code = createManagedWorkerString(func.toString());

    this.maxNbWorkers =
      options.maxWorkers || navigator.hardwareConcurrency || 1;

    this.idleWorkers = new Map();
    this.runningWorkers = new Map();
    this.waiting = [];
  }

  /**
   * We create all the idle workers at the beginning and keep them alive.
   */
  #init() {
    const nbToCreate = this.maxNbWorkers - this.nbWorkers;
    for (let i = 0; i < nbToCreate; i++) {
      let worker = new Worker(this.code);
      worker.addEventListener('message', this.#onmessage.bind(this, worker));
      worker.addEventListener('error', this.#onerror.bind(this, worker));
      this.idleWorkers.set(worker, null);
    }
  }

  #onerror(worker, error) {
    this.logger?.error(`Received error: ${error}`);
    let { reject } = this.runningWorkers.get(worker);
    if (reject) {
      reject(error.message);
    }
    this.idleWorkers.set(worker, null);
    this.runningWorkers.delete(worker);
    if (this.terminateOnError) {
      this.terminate();
    } else {
      this.#exec();
    }
  }

  #onmessage(worker, event) {
    this.logger?.info(`Received message: ${JSON.stringify(event.data)}`);
    let { resolve } = this.runningWorkers.get(worker);
    if (resolve) {
      resolve(event.data);
    }
    this.idleWorkers.set(worker, null);
    this.runningWorkers.delete(worker);
    this.#exec();
  }

  /**
   * Get the numbera of running workers.
   * @returns {number}
   */
  get nbRunningWorkers() {
    return this.runningWorkers.size;
  }

  /**
   * Get the number of idle workers.
   * @returns {number}
   */
  get nbIdleWorkers() {
    return this.idleWorkers.size;
  }

  /**
   * Get the total number of workers.
   * @returns {number}
   */
  get nbWorkers() {
    return this.nbIdleWorkers + this.nbRunningWorkers;
  }

  #exec() {
    this.#init();
    for (let worker of this.idleWorkers.keys()) {
      if (this.waiting.length === 0) break;
      let { args, transferable, resolve, reject } = this.waiting.shift();
      worker.postMessage(args, transferable);

      if (this.timeout > 0) {
        setTimeout(() => {
          if (this.runningWorkers.has(worker)) {
            this.logger?.warn(`Worker timed out after ${this.timeout} ms`);
            worker.terminate();
            this.runningWorkers.delete(worker);
            reject('Worker timed out');
            this.#exec();
          }
        }, this.timeout);
      }

      this.idleWorkers.delete(worker);
      this.runningWorkers.set(worker, { resolve, reject });
    }
  }

  /**
   * Terminate all the workers if they are running or idle.
   */
  terminate() {
    this.waiting = [];
    for (let worker of this.runningWorkers.keys()) {
      worker.terminate();
      this.runningWorkers.delete(worker);
    }
    for (let worker of this.idleWorkers.keys()) {
      worker.terminate();
      this.idleWorkers.delete(worker);
    }
  }

  post(args, transferable) {
    if (args === undefined) args = [];
    if (transferable === undefined) transferable = [];
    if (!Array.isArray(args)) {
      args = [args];
    }
    if (!Array.isArray(transferable)) {
      transferable = [transferable];
    }

    return new Promise((resolve, reject) => {
      this.waiting.push({ args, transferable, resolve, reject });
      this.#exec();
    });
  }
}
