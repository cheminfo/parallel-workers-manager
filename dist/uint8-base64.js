/**
 * uint8-base64 - Encode and decode base64 to and from Uint8Array
 * @version v0.1.1
 * @link https://github.com/cheminfo/uint8-base64#readme
 * @license MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.UintBase64 = factory());
})(this, (function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var lib = {};

	var decode$1 = {};

	Object.defineProperty(decode$1, "__esModule", {
	  value: true
	});
	decode$1.decode = decode;
	const base64codes$1 = Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255, 255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]);
	/**
	 * Convert a Uint8Array containing a base64 encoded bytes to a Uint8Array containing decoded values
	 * @param input
	 * @returns a Uint8Array containing the decoded bytes
	 */
	function decode(input) {
	  if (!ArrayBuffer.isView(input)) {
	    input = new Uint8Array(input);
	  }
	  if (input.length % 4 !== 0) {
	    throw new Error('Unable to parse base64 string.');
	  }
	  const output = new Uint8Array(3 * (input.length / 4));
	  if (input.length === 0) return output;
	  const missingOctets = input.at(-2) === 61 ? 2 : input.at(-1) === 61 ? 1 : 0;
	  for (let i = 0, j = 0; i < input.length; i += 4, j += 3) {
	    const buffer = base64codes$1[input[i]] << 18 | base64codes$1[input[i + 1]] << 12 | base64codes$1[input[i + 2]] << 6 | base64codes$1[input[i + 3]];
	    output[j] = buffer >> 16;
	    output[j + 1] = buffer >> 8 & 0xff;
	    output[j + 2] = buffer & 0xff;
	  }
	  return output.subarray(0, output.length - missingOctets);
	}

	var encode$1 = {};

	Object.defineProperty(encode$1, "__esModule", {
	  value: true
	});
	encode$1.encode = encode;
	const base64codes = Uint8Array.from([65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47]);
	/**
	 * Convert a Uint8Array containing bytes to a Uint8Array containing the base64 encoded values
	 * @param input
	 * @returns a Uint8Array containing the encoded bytes
	 */
	function encode(input) {
	  const output = new Uint8Array(Math.ceil(input.length / 3) * 4);
	  let i, j;
	  for (i = 2, j = 0; i < input.length; i += 3, j += 4) {
	    output[j] = base64codes[input[i - 2] >> 2];
	    output[j + 1] = base64codes[(input[i - 2] & 0x03) << 4 | input[i - 1] >> 4];
	    output[j + 2] = base64codes[(input[i - 1] & 0x0f) << 2 | input[i] >> 6];
	    output[j + 3] = base64codes[input[i] & 0x3f];
	  }
	  if (i === input.length + 1) {
	    // 1 octet yet to write
	    output[j] = base64codes[input[i - 2] >> 2];
	    output[j + 1] = base64codes[(input[i - 2] & 0x03) << 4];
	    output[j + 2] = 61;
	    output[j + 3] = 61;
	  }
	  if (i === input.length) {
	    // 2 octets yet to write
	    output[j] = base64codes[input[i - 2] >> 2];
	    output[j + 1] = base64codes[(input[i - 2] & 0x03) << 4 | input[i - 1] >> 4];
	    output[j + 2] = base64codes[(input[i - 1] & 0x0f) << 2];
	    output[j + 3] = 61;
	  }
	  return output;
	}

	(function (exports) {

	  var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = {
	        enumerable: true,
	        get: function () {
	          return m[k];
	        }
	      };
	    }
	    Object.defineProperty(o, k2, desc);
	  } : function (o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	  });
	  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function (m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	  };
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  __exportStar(decode$1, exports);
	  __exportStar(encode$1, exports);
	})(lib);
	var index = /*@__PURE__*/getDefaultExportFromCjs(lib);

	return index;

}));
//# sourceMappingURL=uint8-base64.js.map
