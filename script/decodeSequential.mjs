import { readFile } from 'node:fs/promises';

import { decode } from 'uint8-base64';

import { getMatrixSum } from './getMatrixSum.mjs';
import { inflate } from './inflate.mjs';

const encoder = new TextEncoder();

const lines = (await readFile(new URL('huge.binary', import.meta.url), 'utf8'))
  .split('\n')
  .filter(Boolean)
  .map((line) => decode(encoder.encode(line)));

console.time('parse');
const matrix = [];
for (let line of lines) {
  matrix.push(await inflate(line));
}

console.timeEnd('parse');

console.log(matrix.length);
console.log(getMatrixSum(matrix));
