# parallel-workers-manager

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

Some tasks can easily be split

## Installation

`$ npm i parallel-workers-manager`

## Usage

```js
import { ParallelWorkersManager } from 'parallel-workers-manager';

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
```

## [API Documentation](https://cheminfo.github.io/parallel-workers-manager/)

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/parallel-workers-manager.svg
[npm-url]: https://www.npmjs.com/package/parallel-workers-manager
[ci-image]: https://github.com/cheminfo/parallel-workers-manager/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/cheminfo/parallel-workers-manager/actions?query=workflow%3A%22Node.js+CI%22
[codecov-image]: https://img.shields.io/codecov/c/github/cheminfo/parallel-workers-manager.svg
[codecov-url]: https://codecov.io/gh/cheminfo/parallel-workers-manager
[download-image]: https://img.shields.io/npm/dm/parallel-workers-manager.svg
[download-url]: https://www.npmjs.com/package/parallel-workers-manager
