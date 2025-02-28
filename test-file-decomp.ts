import { compressFile, decompressFile } from './lib';
import * as fs from 'fs';

// Create a test file with example content
const testContent = `
function calculateValue(data) {
  if (data.length > 10) {
    return data.length * 2;
  } else {
    return data.length;
  }
}

function calculateValue(items) {
  if (items.length > 10) {
    return items.length * 2;
  } else {
    return items.length;
  }
}

const processData = (data) => {
  if (data.length > 10) {
    console.log("Data is longer than expected");
    return data.length * 2;
  } else {
    console.log("Data length is acceptable");
    return data.length;
  }
};
`;

// Create test file
const testFilePath = '/Users/guillaumemaison/projects/utcp/test-file.js';
fs.writeFileSync(testFilePath, testContent);
console.log(`Created test file: ${testFilePath}`);

// Compress the file
console.log("\n=== Compressing file ===");
const compressedFilePath = compressFile(testFilePath);
console.log(`Compressed file created: ${compressedFilePath}`);

// Read the compressed content
const compressedContent = fs.readFileSync(compressedFilePath, 'utf-8');
console.log("\nCompressed content first 200 chars:");
console.log(compressedContent.substring(0, 200));

// Decompress the file
console.log("\n=== Decompressing file ===");
const decompressedFilePath = decompressFile(compressedFilePath, { outputFilename: `${testFilePath}.decompressed` });
console.log(`Decompressed file created: ${decompressedFilePath}`);

// Read the decompressed content
const decompressedContent = fs.readFileSync(decompressedFilePath, 'utf-8');

// Compare original and decompressed
console.log("\n=== Comparing files ===");
console.log(`Original file size: ${testContent.length} bytes`);
console.log(`Decompressed file size: ${decompressedContent.length} bytes`);

if (testContent.trim() === decompressedContent.trim()) {
  console.log("\n✅ Decompression successful! Files match.");
} else {
  console.log("\n❌ Decompression error! Files do not match.");
  console.log("\nDecompressed content first 200 chars:");
  console.log(decompressedContent.substring(0, 200));
  
  // Check if content contains ellipses
  if (decompressedContent.includes('...')) {
    console.log("\nFound '...' in decompressed content!");
    console.log("Number of occurrences:", decompressedContent.split('...').length - 1);
  }
}