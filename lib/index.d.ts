import { UTCPCompressor } from './compression';
import { UTCPDecompressor } from './decompression';
import { CompressionOptions, CompressionResult, DecompressionOptions, DecompressionResult } from './types';
/**
 * Compress a file using UTCP
 */
export declare function compressFile(filePath: string, options?: CompressionOptions): string;
/**
 * Decompress a UTCP file
 */
export declare function decompressFile(filePath: string, options?: DecompressionOptions): string;
/**
 * Compress a string using UTCP
 */
export declare function compressString(content: string, virtualFilename?: string, options?: CompressionOptions): CompressionResult;
/**
 * Decompress a UTCP string
 */
export declare function decompressString(content: string, virtualFilename?: string, options?: DecompressionOptions): DecompressionResult;
export { UTCPCompressor, UTCPDecompressor };
export * from './types';
