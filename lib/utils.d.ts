import { FileMetadata } from './types';
/**
 * Calculate MD5 checksum of a string
 */
export declare function calculateChecksum(content: string): string;
/**
 * Get file extension
 */
export declare function getFileExtension(filePath: string): string;
/**
 * Count lines in a string
 */
export declare function countLines(content: string): number;
/**
 * Generate file metadata
 */
export declare function generateMetadata(filePath: string, content: string): FileMetadata;
/**
 * Read file content
 */
export declare function readFile(filePath: string): string;
/**
 * Write content to file
 */
export declare function writeFile(filePath: string, content: string): void;
/**
 * Check if a file exists
 */
export declare function fileExists(filePath: string): boolean;
/**
 * Get suggested output filename for decompression
 */
export declare function getSuggestedOutputFilename(inputFile: string): string;
/**
 * Extract domain from file extension
 */
export declare function getDomainFromFileType(fileType: string): string | null;
