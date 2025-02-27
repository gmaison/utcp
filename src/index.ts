import * as fs from 'fs';
import * as path from 'path';
import { UTCPCompressor } from './compression';
import { UTCPDecompressor } from './decompression';
import { 
  CompressionOptions, 
  CompressionResult, 
  DecompressionOptions,
  DecompressionResult
} from './types';
import { readFile, writeFile } from './utils';

/**
 * Compress a file using UTCP
 */
export function compressFile(
  filePath: string,
  options: CompressionOptions = {}
): string {
  // Read the input file
  const content = readFile(filePath);
  
  // Create compressor and compress
  const compressor = new UTCPCompressor(filePath, content, options);
  compressor.compress();
  
  // Save the compressed file
  return compressor.save();
}

/**
 * Decompress a UTCP file
 */
export function decompressFile(
  filePath: string,
  options: DecompressionOptions = {}
): string {
  // Read the input file
  const content = readFile(filePath);
  
  // Create decompressor and decompress
  const decompressor = new UTCPDecompressor(filePath, content, options);
  decompressor.decompress();
  
  // Save the decompressed file
  return decompressor.save();
}

/**
 * Compress a string using UTCP
 */
export function compressString(
  content: string,
  virtualFilename: string = 'content.txt',
  options: CompressionOptions = {}
): CompressionResult {
  const compressor = new UTCPCompressor(virtualFilename, content, options);
  return compressor.compress();
}

/**
 * Decompress a UTCP string
 */
export function decompressString(
  content: string,
  virtualFilename: string = 'content.txt.utcp',
  options: DecompressionOptions = {}
): DecompressionResult {
  const decompressor = new UTCPDecompressor(virtualFilename, content, options);
  return decompressor.decompress();
}

// Export classes for advanced usage
export { UTCPCompressor, UTCPDecompressor };

// Export types
export * from './types';