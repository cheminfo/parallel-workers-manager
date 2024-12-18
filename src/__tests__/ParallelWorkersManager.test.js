import delay from 'delay';
import { expect, test } from 'vitest';

import { ParallelWorkersManager } from '../ParallelWorkersManager';

test('simple case', async () => {
  const manager = new ParallelWorkersManager(
    () => {
      return 'Hello World';
    },
    {
      maxWorkers: 1,
    },
  );

  const result = await manager.post();
  expect(result).toBe('Hello World');

  const result2 = await manager.post();
  expect(result2).toBe('Hello World');
  manager.terminate();
  expect(manager.nbIdleWorkers).toBe(0);
  expect(manager.nbRunningWorkers).toBe(0);
  const result3 = await manager.post();
  expect(result3).toBe('Hello World');
});

test('return value', async () => {
  const manager = new ParallelWorkersManager(
    (value) => {
      return value;
    },
    {
      maxWorkers: 1,
    },
  );

  const result = await manager.post('abc');
  expect(result).toBe('abc');
});

test('2 values with 1 worker', async () => {
  const manager = new ParallelWorkersManager(
    (value) => {
      return value;
    },
    {
      maxWorkers: 1,
    },
  );

  const promises = [manager.post('abc'), manager.post('def')];
  const results = await Promise.all(promises);
  expect(results).toEqual(['abc', 'def']);
});

test('kill worker', async () => {
  const manager = new ParallelWorkersManager(infiniteLoop, {
    maxWorkers: 1,
  });

  expect(manager.idleWorkers.size).toBe(0);
  expect(manager.runningWorkers.size).toBe(0);
  expect(manager.nbWorkers).toBe(0);

  manager.post('abc');
  await delay(100);

  expect(manager.idleWorkers.size).toBe(0);
  expect(manager.runningWorkers.size).toBe(1);

  manager.terminate();

  expect(manager.idleWorkers.size).toBe(0);
  expect(manager.runningWorkers.size).toBe(0);
  expect(manager.nbWorkers).toBe(0);

  manager.post('abc');
  await delay(100);

  expect(manager.idleWorkers.size).toBe(0);
  expect(manager.runningWorkers.size).toBe(1);

  manager.terminate();
});

test('check number of workers', async () => {
  const manager = new ParallelWorkersManager(infiniteLoop, {
    maxWorkers: 2,
  });

  expect(manager.idleWorkers.size).toBe(0);
  expect(manager.runningWorkers.size).toBe(0);
  expect(manager.nbWorkers).toBe(0);

  manager.post('abc');
  await delay(100);

  expect(manager.idleWorkers.size).toBe(1);
  expect(manager.runningWorkers.size).toBe(1);

  manager.post('abc');
  await delay(100);

  expect(manager.idleWorkers.size).toBe(0);
  expect(manager.runningWorkers.size).toBe(2);

  manager.post('abc');
  await delay(100);

  expect(manager.idleWorkers.size).toBe(0);
  expect(manager.runningWorkers.size).toBe(2);

  manager.terminate();
});

test('kill worker if too long', async () => {
  const manager = new ParallelWorkersManager(infiniteLoop, {
    maxWorkers: 1,
    timeout: 100,
  });

  await expect(manager.post('abc')).rejects.toThrow('Worker timed out');
});

test('check processes are done in parallel', async () => {
  const manager = new ParallelWorkersManager(
    async (value) => {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
      return value;
    },
    {
      maxWorkers: 2,
    },
  );

  const start = Date.now();
  const results = await Promise.all([manager.post('abc'), manager.post('def')]);
  expect(Date.now() - start).toBeLessThan(190);
  expect(results).toEqual(['abc', 'def']);
});

test('check processes are not in parallel if maxWorkers=1', async () => {
  const manager = new ParallelWorkersManager(
    async (value) => {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
      return value;
    },
    {
      maxWorkers: 1,
    },
  );

  const start = Date.now();
  const results = await Promise.all([manager.post('abc'), manager.post('def')]);
  expect(Date.now() - start).toBeGreaterThan(200);
  expect(results).toEqual(['abc', 'def']);
});

function infiniteLoop() {
  // eslint-disable-next-line no-empty
  while (true) {}
}
