#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get arguments
const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: node fix-utcp.js <compressed-file> [output-file]');
  process.exit(1);
}

const outputFile = process.argv[3] || inputFile.replace('.utcp', '') + '.fixed';

console.log(`Input file: ${inputFile}`);
console.log(`Output file: ${outputFile}`);

// Read the compressed file
const compressedContent = fs.readFileSync(inputFile, 'utf8');

// Extract all parts
const contentMatch = compressedContent.match(/<CONTENT>([\s\S]*?)<\/CONTENT>/);
if (!contentMatch) {
  console.error('No content found in the compressed file');
  process.exit(1);
}

let content = contentMatch[1];
console.log(`Content section found (${content.length} bytes)`);

// Check if the content is just "..."
if (content.trim() === '...') {
  console.error('Content is just "...", attempting recovery');
  
  // Try to recover the original content
  // Read the content without compression
  const baseFileName = inputFile.replace('.utcp', '');
  if (fs.existsSync(baseFileName)) {
    console.log(`Original file found: ${baseFileName}`);
    const originalContent = fs.readFileSync(baseFileName, 'utf8');
    
    // Write to output
    fs.writeFileSync(outputFile, originalContent, 'utf8');
    console.log(`Original content written to ${outputFile} (${originalContent.length} bytes)`);
    process.exit(0);
  } else {
    console.error(`Original file not found: ${baseFileName}`);
    process.exit(1);
  }
}

// Process dictionaries
console.log('Processing dictionaries');
const globalDictMatch = compressedContent.match(/<DICT:global>([\s\S]*?)<\/DICT:global>/);
const dictionaries = { global: {} };

if (globalDictMatch) {
  const dictLines = globalDictMatch[1].trim().split('\n');
  for (const line of dictLines) {
    const [code, term] = line.split('=');
    if (code && term) {
      dictionaries.global[code.trim()] = term.trim();
    }
  }
}

console.log(`Dictionary entries: ${Object.keys(dictionaries.global).length}`);

// Replace dictionary codes
for (const code in dictionaries.global) {
  const term = dictionaries.global[code];
  // Replace all instances using basic string replacement
  while (content.includes(code)) {
    content = content.replace(code, term);
  }
}

// Process references
console.log('Processing references');
const refMatches = [];
const refRegex = /<REF:([^>]+)>([\s\S]*?)<\/REF:\1>/g;
let match;
while ((match = refRegex.exec(compressedContent)) !== null) {
  refMatches.push({
    id: match[1],
    content: match[2].trim()
  });
}

console.log(`Reference entries: ${refMatches.length}`);

// Replace references
for (const ref of refMatches) {
  const marker = `$REF:${ref.id}`;
  while (content.includes(marker)) {
    content = content.replace(marker, ref.content);
  }
}

// Write to output file
fs.writeFileSync(outputFile, content, 'utf8');
console.log(`Decompressed content written to ${outputFile} (${content.length} bytes)`);

// Check if there are still unresolved codes
const remainingCodes = content.match(/\$G\d+/g) || [];
if (remainingCodes.length > 0) {
  console.log(`WARNING: ${remainingCodes.length} unresolved dictionary codes remain`);
  console.log(`First 10: ${remainingCodes.slice(0, 10).join(', ')}`);
}