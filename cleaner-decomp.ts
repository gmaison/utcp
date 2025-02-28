import { readFileSync, writeFileSync } from 'fs';

// Read the compressed file
const compressedPath = '/Users/guillaumemaison/projects/utcp/test/knowledge.md.utcp';
const compressedContent = readFileSync(compressedPath, 'utf8');

// Extract content between CONTENT tags
const contentMatch = compressedContent.match(/<CONTENT>([\s\S]*?)<\/CONTENT>/);
if (!contentMatch) {
  console.error('No content found in the compressed file');
  process.exit(1);
}

// Get the content
let content = contentMatch[1];
console.log(`Content length: ${content.length} characters`);
console.log('First 200 characters:');
console.log(content.substring(0, 200));

// Extract dictionaries
const globalDictMatch = compressedContent.match(/<DICT:global>([\s\S]*?)<\/DICT:global>/);
const markupDictMatch = compressedContent.match(/<DICT:markup>([\s\S]*?)<\/DICT:markup>/);

// Process dictionaries
interface Dictionary {
  [key: string]: string;
}

interface Dictionaries {
  global: Dictionary;
  markup: Dictionary;
}

const dictionaries: Dictionaries = { global: {}, markup: {} };

if (globalDictMatch) {
  const dictLines = globalDictMatch[1].trim().split('\n');
  for (const line of dictLines) {
    const [code, term] = line.split('=');
    if (code && term) {
      dictionaries.global[code.trim()] = term.trim();
    }
  }
}

if (markupDictMatch) {
  const dictLines = markupDictMatch[1].trim().split('\n');
  for (const line of dictLines) {
    const [code, term] = line.split('=');
    if (code && term) {
      dictionaries.markup[code.trim()] = term.trim();
    }
  }
}

console.log(`Global dictionary entries: ${Object.keys(dictionaries.global).length}`);
console.log(`Markup dictionary entries: ${Object.keys(dictionaries.markup).length}`);

// Replace dictionary codes with their terms
console.log('Replacing dictionary codes...');
const domains = Object.keys(dictionaries) as Array<keyof Dictionaries>;
for (const domain of domains) {
  const dictionary = dictionaries[domain];
  for (const code in dictionary) {
    const term = dictionary[code];
    // Use simple string replacement, escaping $ in regex
    const escapedCode = code.replace(/\$/g, '\\$');
    const regex = new RegExp(escapedCode, 'g');
    content = content.replace(regex, term);
  }
}

// Verify replacement
console.log('Looking for remaining dictionary codes...');
const remainingCodes = content.match(/\$G\d+/g);
if (remainingCodes) {
  console.log(`Found ${remainingCodes.length} remaining codes: ${remainingCodes.slice(0, 10).join(', ')}...`);
} else {
  console.log('No remaining codes found');
}

// Extract references if any
const refMatches = compressedContent.match(/<REF:([^>]+)>([\s\S]*?)<\/REF:\1>/g);
const references: Dictionary = {};

if (refMatches) {
  for (const match of refMatches) {
    const idMatch = match.match(/<REF:([^>]+)>/);
    const contentMatch = match.match(/<REF:[^>]+>([\s\S]*?)<\/REF:/);
    if (idMatch && contentMatch) {
      const refId = idMatch[1];
      const refContent = contentMatch[1].trim();
      references[refId] = refContent;
    }
  }
}

console.log(`References found: ${Object.keys(references).length}`);

// Replace reference markers
for (const refId in references) {
  const refContent = references[refId];
  const refRegex = new RegExp(`\\$REF:${refId}`, 'g');
  content = content.replace(refRegex, refContent);
}

// Save the decompressed content
const outputPath = '/Users/guillaumemaison/projects/utcp/test/knowledge.clean.md';
writeFileSync(outputPath, content);
console.log(`Decompressed content saved to: ${outputPath}`);
console.log(`Final content length: ${content.length} characters`);