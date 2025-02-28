import { UTCPDecompressor } from './lib/decompression';
import * as fs from 'fs';
import * as path from 'path';

// Check command line arguments
if (process.argv.length < 3) {
  console.error('Usage: npx ts-node robust-decomp.ts <compressed-file> [output-file]');
  process.exit(1);
}

// Get input file path
const inputPath = process.argv[2];
const outputPath = process.argv[3] || inputPath + '.robust-decompressed';

console.log(`Input file: ${inputPath}`);
console.log(`Output file: ${outputPath}`);

try {
  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file ${inputPath} does not exist`);
    process.exit(1);
  }

  // Read compressed content
  console.log('Reading compressed content...');
  const compressedContent = fs.readFileSync(inputPath, 'utf8');
  console.log(`Compressed content length: ${compressedContent.length} characters`);
  console.log(`First 100 chars: ${compressedContent.substring(0, 100)}`);

  // Create decompressor
  console.log('Creating decompressor...');
  const decompressor = new UTCPDecompressor(inputPath, compressedContent, {
    outputFilename: outputPath
  });

  // Run decompression
  console.log('Running decompression...');
  const result = decompressor.decompress();
  
  console.log(`Decompressed content length: ${result.originalContent.length} characters`);
  console.log(`First 100 chars: ${result.originalContent.substring(0, 100)}`);

  // Save directly using fs.writeFileSync to bypass any issues
  console.log('Saving file directly...');
  fs.writeFileSync(outputPath, result.originalContent, 'utf8');
  
  // Verify the saved file
  console.log('Verifying saved file...');
  if (fs.existsSync(outputPath)) {
    const savedContent = fs.readFileSync(outputPath, 'utf8');
    console.log(`Saved file length: ${savedContent.length} characters`);
    console.log(`First 100 chars: ${savedContent.substring(0, 100)}`);
    
    if (savedContent.length === result.originalContent.length) {
      console.log('SUCCESS: File saved correctly');
    } else {
      console.error('ERROR: Saved file length does not match decompressed content length');
    }
  } else {
    console.error('ERROR: Could not verify saved file');
  }
} catch (error) {
  console.error('Error during decompression:', error);
}