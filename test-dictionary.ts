import { UTCPCompressor, UTCPDecompressor } from './lib';
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

// Write test content to a file
fs.writeFileSync('test-input.js', testContent);

// Compress the file
console.log("=== Compressing file ===");
const compressor = new UTCPCompressor('test-input.js', testContent, {});
const result = compressor.compress();
fs.writeFileSync('test-compressed.utcp', result.compressedContent);
console.log("Compression ratio:", result.compressionRatio);

// Decompress the file
console.log("\n=== Decompressing file ===");
const compressedContent = fs.readFileSync('test-compressed.utcp', 'utf8');
const decompressor = new UTCPDecompressor('test-compressed.utcp', compressedContent, {});
const decompResult = decompressor.decompress();

// Log results
console.log("Original content:");
console.log("===============");
console.log(testContent);
console.log("\nDecompressed content:");
console.log("===============");
console.log(decompResult.originalContent);

// Check if the original and decompressed content match
console.log("\nSuccessful decompression:", 
  testContent.trim() === decompResult.originalContent.trim() ? "Yes" : "No");

// If they don't match, show differences
if (testContent.trim() !== decompResult.originalContent.trim()) {
  console.log("\nOriginal length:", testContent.length);
  console.log("Decompressed length:", decompResult.originalContent.length);
  
  // Check for ... pattern
  if (decompResult.originalContent.includes('...')) {
    console.log("\nDECOMPRESSION ERROR: Found '...' pattern in output");
    
    // Try to parse the format manually
    console.log("\nManual inspection of compressed content:");
    
    // Check if there are DICT sections
    const dictMatches = compressedContent.match(/<DICT:[^>]+>[\s\S]*?<\/DICT:[^>]+>/g) || [];
    console.log("Dictionary sections found:", dictMatches.length);
    
    // Check for references
    const refMatches = compressedContent.match(/<REF:[^>]+>[\s\S]*?<\/REF:[^>]+>/g) || [];
    console.log("Reference sections found:", refMatches.length);
    
    // Check for content
    const contentMatch = compressedContent.match(/<CONTENT>([\s\S]*?)<\/CONTENT>/);
    console.log("Content section found:", contentMatch ? "Yes" : "No");
    
    if (contentMatch) {
      console.log("Content section length:", contentMatch[1].length);
      console.log("First 100 chars of content:", contentMatch[1].substring(0, 100));
    }
  }
}