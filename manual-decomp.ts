import { UTCPCompressor, UTCPDecompressor } from './lib';
import * as fs from 'fs';
import * as path from 'path';

// Path to the knowledge.md file
const filePath = path.resolve(__dirname, 'test/knowledge.md');
console.log(`Processing file: ${filePath}`);

// Read the original content
const originalContent = fs.readFileSync(filePath, 'utf8');
console.log(`Original content length: ${originalContent.length} characters`);

// Create a compressor
const compressor = new UTCPCompressor(filePath, originalContent, {});

// Compress the content
console.log('Compressing content...');
const result = compressor.compress();
console.log(`Compression ratio: ${result.compressionRatio}`);

// Check if dictionaries were created
console.log(`Dictionary entries: ${Object.keys(result.dictionaries.global).length}`);

// Save compressed content to a temp file
const compressedFile = path.resolve(__dirname, 'test/knowledge.manual.utcp');
fs.writeFileSync(compressedFile, result.compressedContent);
console.log(`Compressed content saved to: ${compressedFile}`);

// Now decompress
console.log('\nDecompressing content...');
const decompressor = new UTCPDecompressor(compressedFile, result.compressedContent, {});
const decompResult = decompressor.decompress();

// Check the decompressed content
console.log(`Decompressed content length: ${decompResult.originalContent.length} characters`);

// Compare original and decompressed content
const contentMatch = originalContent === decompResult.originalContent;
console.log(`Content match: ${contentMatch ? 'Yes' : 'No'}`);

// Save the decompressed content
const decompressedFile = path.resolve(__dirname, 'test/knowledge.manual.md');
fs.writeFileSync(decompressedFile, decompResult.originalContent);
console.log(`Decompressed content saved to: ${decompressedFile}`);

// Compare the files
console.log('\nFile comparison:');
console.log(`Original: ${originalContent.length} bytes`);
console.log(`Decompressed: ${decompResult.originalContent.length} bytes`);