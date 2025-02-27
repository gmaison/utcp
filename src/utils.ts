import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { FileMetadata } from './types';

/**
 * Calculate MD5 checksum of a string
 */
export function calculateChecksum(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Get file extension
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath).slice(1);
}

/**
 * Count lines in a string
 */
export function countLines(content: string): number {
  return content.split('\n').length;
}

/**
 * Generate file metadata
 */
export function generateMetadata(
  filePath: string,
  content: string
): FileMetadata {
  const type = getFileExtension(filePath);
  const checksum = calculateChecksum(content);
  const size = Buffer.from(content).length;
  const lines = countLines(content);
  const date = new Date().toISOString();

  return {
    type,
    checksum,
    size,
    lines,
    date,
  };
}

/**
 * Read file content
 */
export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Write content to file
 */
export function writeFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Get suggested output filename for decompression
 */
export function getSuggestedOutputFilename(inputFile: string): string {
  // Check if file ends with .utcp
  if (inputFile.endsWith('.utcp')) {
    return inputFile.slice(0, -5); // Remove .utcp extension
  }
  return `${inputFile}.decompressed`;
}

/**
 * Extract domain from file extension
 */
export function getDomainFromFileType(fileType: string): string | null {
  const codeExtensions = ['js', 'ts', 'java', 'py', 'rb', 'c', 'cpp', 'cs', 'go', 'rs', 'php'];
  const markupExtensions = ['html', 'xml', 'md', 'rst', 'adoc', 'tex', 'yaml', 'json'];
  
  if (codeExtensions.includes(fileType)) {
    return 'code';
  } else if (markupExtensions.includes(fileType)) {
    return 'markup';
  }
  
  return null;
}