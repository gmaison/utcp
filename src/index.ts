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
export async function compressFile(
  filePath: string,
  options: CompressionOptions = {}
): Promise<string | string[]> {
  // Read the input file
  const content = readFile(filePath);
  
  // Create compressor and compress
  const compressor = new UTCPCompressor(filePath, content, options);
  const result = await compressor.compress();
  
  // Save the compressed file (may return multiple paths if split by tokens)
  const savedPaths = compressor.save();
  
  // Store split file paths in the result if token-based splitting was used
  if (Array.isArray(savedPaths) && savedPaths.length > 1) {
    result.splitFiles = savedPaths;
  }
  
  return savedPaths;
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
  const result = decompressor.decompress();
  
  // For debugging
  console.log(`DEBUG: Decompressed content length: ${result.originalContent.length}`);
  console.log(`DEBUG: First 50 chars: ${result.originalContent.substring(0, 50)}`);
  
  // Save the decompressed file
  return decompressor.save();
}

/**
 * Compress a string using UTCP
 */
export async function compressString(
  content: string,
  virtualFilename: string = 'content.txt',
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const compressor = new UTCPCompressor(virtualFilename, content, options);
  return await compressor.compress();
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