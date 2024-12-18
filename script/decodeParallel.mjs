import { readFile } from 'node:fs/promises';

import { decode } from 'uint8-base64';

import { ParallelWorkersManager } from '../lib/index.js';

import { getMatrixSum } from './getMatrixSum.mjs';
import { inflate } from './inflate.mjs';

const encoder = new TextEncoder();

const manager = new ParallelWorkersManager(inflate.toString());

const lines = (await readFile(new URL('huge.binary', import.meta.url), 'utf8'))
  .split('\n')
  .filter(Boolean)
  .map((line) => decode(encoder.encode(line)));

console.time('parse');

const promises = [];
for (let line of lines) {
  promises.push(manager.post(line, line.buffer));
}
const matrix = await Promise.all(promises);

console.timeEnd('parse');

console.log(matrix.length);
console.log(getMatrixSum(matrix));
