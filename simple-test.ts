import { UTCPDecompressor } from './lib/decompression';
import * as fs from 'fs';

// Create a very simple sample file
const content = `function test() {
  return "Hello World";
}`;

// Save it to a file
fs.writeFileSync('simple.js', content);

// Compress it in the simplest format
const compressed = `<UTCP-v1-light>
<META:size="${content.length}">
${content}
</UTCP-v1-light>`;

// Save to compressed file
fs.writeFileSync('simple.js.utcp', compressed);

// Now try to decompress it manually
console.log("Testing decompression manually...");
const compressedContent = fs.readFileSync('simple.js.utcp', 'utf8');

// Create decompressor
const decompressor = new UTCPDecompressor('simple.js.utcp', compressedContent, {
  outputFilename: 'simple.decompressed.js'
});

// Run decompression
const result = decompressor.decompress();
console.log("Decompressed content:");
console.log(result.originalContent);
console.log(`Length: ${result.originalContent.length} characters`);

// Save file using UTCPDecompressor.save()
try {
  console.log("Saving decompressed content using decompressor.save()...");
  const outputPath = decompressor.save();
  console.log(`File saved to: ${outputPath}`);
  
  // Check saved file
  const savedContent = fs.readFileSync(outputPath, 'utf8');
  console.log(`Saved file length: ${savedContent.length} characters`);
  console.log("Saved content:");
  console.log(savedContent);
  
  if (savedContent.length < 10) {
    console.log("WARNING: Saved file is too short!");
    
    // Try to save manually to bypass any issues
    console.log("Saving manually using fs.writeFileSync...");
    fs.writeFileSync('simple.manual.js', result.originalContent);
    console.log("Manual save complete. Check simple.manual.js");
  }
} catch (error) {
  console.error("Error during save:", error);
}