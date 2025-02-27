"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UTCPDecompressor = exports.UTCPCompressor = void 0;
exports.compressFile = compressFile;
exports.decompressFile = decompressFile;
exports.compressString = compressString;
exports.decompressString = decompressString;
const compression_1 = require("./compression");
Object.defineProperty(exports, "UTCPCompressor", { enumerable: true, get: function () { return compression_1.UTCPCompressor; } });
const decompression_1 = require("./decompression");
Object.defineProperty(exports, "UTCPDecompressor", { enumerable: true, get: function () { return decompression_1.UTCPDecompressor; } });
const utils_1 = require("./utils");
/**
 * Compress a file using UTCP
 */
function compressFile(filePath, options = {}) {
    // Read the input file
    const content = (0, utils_1.readFile)(filePath);
    // Create compressor and compress
    const compressor = new compression_1.UTCPCompressor(filePath, content, options);
    compressor.compress();
    // Save the compressed file
    return compressor.save();
}
/**
 * Decompress a UTCP file
 */
function decompressFile(filePath, options = {}) {
    // Read the input file
    const content = (0, utils_1.readFile)(filePath);
    // Create decompressor and decompress
    const decompressor = new decompression_1.UTCPDecompressor(filePath, content, options);
    decompressor.decompress();
    // Save the decompressed file
    return decompressor.save();
}
/**
 * Compress a string using UTCP
 */
function compressString(content, virtualFilename = 'content.txt', options = {}) {
    const compressor = new compression_1.UTCPCompressor(virtualFilename, content, options);
    return compressor.compress();
}
/**
 * Decompress a UTCP string
 */
function decompressString(content, virtualFilename = 'content.txt.utcp', options = {}) {
    const decompressor = new decompression_1.UTCPDecompressor(virtualFilename, content, options);
    return decompressor.decompress();
}
// Export types
__exportStar(require("./types"), exports);
