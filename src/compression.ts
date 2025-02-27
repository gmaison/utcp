import * as path from 'path';
import {
CompressionOptions,
CompressionResult,
Dictionaries,
Dictionary,
FileMetadata,
References
} from './types';
import {
calculateChecksum,
countLines,
generateMetadata,
getDomainFromFileType,
writeFile,
} from './utils';

// Minimum file size to use full compression (500 bytes)
const MIN_FILE_SIZE = 500;

export class UTCPCompressor {
  private content: string;
  private filePath: string;
  private options: CompressionOptions;
  private metadata: FileMetadata;
  private dictionaries: Dictionaries = { global: {} };
  private references: References = {};
  private compressedContent: string = '';
  private minOccurrences: number;

  constructor(
    filePath: string,
    content: string,
    options: CompressionOptions = {}
  ) {
    this.filePath = filePath;
    this.content = content;
    this.options = options;
    this.minOccurrences = options.minOccurrences || 2;
    this.metadata = generateMetadata(filePath, content);
  }

  /**
   * Compress the content using UTCP
   */
public compress(): CompressionResult {
// Calculate input size
const originalSize = Buffer.from(this.content).length;

// For small files, use simplified compression
if (originalSize < MIN_FILE_SIZE) {
    // Skip dictionary building and use simple metadata
    this.compressedContent = `<UTCP-v1-light>\n<META:size="${originalSize}">\n${this.content}\n</UTCP-v1-light>`;
    const compressedSize = Buffer.from(this.compressedContent).length;
    return {
    compressedContent: this.compressedContent,
    metadata: {
        type: path.extname(this.filePath),
        checksum: calculateChecksum(this.content),
        size: originalSize,
        lines: countLines(this.content),
        date: new Date().toISOString()
    },
    dictionaries: { global: {} },
    references: {},
    compressionRatio: originalSize / compressedSize
    };
}

// 1. Build dictionaries
this.buildGlobalDictionary();
this.buildDomainDictionaries();

// 2. Find and create structure references
this.createStructureReferences();

// 3. Apply compression rules
let processedContent = this.applyCompressionRules(this.content);

// 4. Generate the full compressed output
this.compressedContent = this.generateCompressedOutput(processedContent);

// 5. Calculate compression ratio
const compressedSize = Buffer.from(this.compressedContent).length;
const compressionRatio = originalSize / compressedSize;

// 6. Check if compression is effective - if not, use original content
if (compressionRatio < 1) {
    // Compression made the file larger, use original content with light wrapper
    this.compressedContent = `<UTCP-v1-original>\n<FORMAT-DESCRIPTION>\nThis file was not effectively compressed by UTCP because the compression ratio was less than 1.\nThe original content is preserved without compression to maintain optimal size.\nThe metadata section contains information about the file.\n</FORMAT-DESCRIPTION>\n<META:size="${originalSize}">\n<META:type="${this.metadata.type}">\n<META:checksum="${this.metadata.checksum}">\n<META:lines="${this.metadata.lines}">\n<META:date="${this.metadata.date}">\n<CONTENT>\n${this.content}\n</CONTENT>\n</UTCP-v1-original>`;
    
    // Recalculate size and ratio
    const newCompressedSize = Buffer.from(this.compressedContent).length;
    const newRatio = originalSize / newCompressedSize;
    
    return {
      compressedContent: this.compressedContent,
      metadata: this.metadata,
      dictionaries: { global: {} },
      references: {},
      compressionRatio: newRatio,
    };
}
    
return {
    compressedContent: this.compressedContent,
    metadata: this.metadata,
    dictionaries: this.dictionaries,
    references: this.references,
    compressionRatio,
};
  }

  /**
   * Save the compressed content to a file
   */
  public save(): string {
    const outputPath = `${this.filePath}.utcp`;
    writeFile(outputPath, this.compressedContent);
    return outputPath;
  }

  /**
   * Build global dictionary of common terms
   */
private buildGlobalDictionary(): void {
// We'll build dictionaries for any non-trivial content
// The threshold check is now only in compress() method

// First pass - identify variable names and custom identifiers
const identifierRegex = /\b(?!(?:function|class|const|let|var)\b)([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
const identifierCounts = new Map<string, number>();
let match;
while ((match = identifierRegex.exec(this.content)) !== null) {
    const identifier = match[1];
    if (identifier.length < 2) continue; // Allow shorter identifiers
    const count = identifierCounts.get(identifier) || 0;
    identifierCounts.set(identifier, count + 1);
}

// Second pass - standard words
const wordRegex = /\b(\w+)\b/g;
const wordCounts = new Map<string, number>();
let wordMatch;
while ((wordMatch = wordRegex.exec(this.content)) !== null) {
    const word = wordMatch[1];
    if (word.length < 3) continue; // Skip very short words
    if (identifierCounts.has(word)) continue; // Skip identified variables
    const count = wordCounts.get(word) || 0;
    wordCounts.set(word, count + 1);
}

// Combine and sort all patterns by frequency and length
const allPatterns = [
    ...Array.from(identifierCounts.entries()),
    ...Array.from(wordCounts.entries())
]
    .filter(([word, count]) => count >= this.minOccurrences)
    .sort((a, b) => {
    const freqDiff = b[1] - a[1];
    if (freqDiff !== 0) return freqDiff;
    return b[0].length - a[0].length; // Prefer longer patterns
    })
    .map(([word]) => word);

// Create global dictionary with prioritized patterns
let dictIndex = 1;
for (const pattern of allPatterns) {
    const code = `$G${dictIndex}`;
    this.dictionaries.global[code] = pattern;
    dictIndex++;
}
}

  /**
   * Build domain-specific dictionaries
   */
  private buildDomainDictionaries(): void {
    const domain = getDomainFromFileType(this.metadata.type);
    if (!domain) return;
    
    // Define domain-specific common terms
    const domainTerms: Record<string, string[]> = {
    code: [
        'function', 'class', 'interface', 'const', 'let', 'var', 'return',
        'import', 'export', 'extends', 'implements', 'public', 'private',
        'protected', 'static', 'async', 'await', 'try', 'catch', 'throw',
        'break', 'continue', 'do', 'else', 'for', 'if', 'in', 'new',
        'this', 'void', 'while', 'with', 'case', 'switch', 'typeof',
        'get', 'set', 'null', 'true', 'false', 'instanceof', 'package',
        'yield', 'constructor', 'super', 'debugger', 'default', 'finally'
    ],   
    markup: [
        'header', 'paragraph', 'div', 'span', 'section', 'article', 'nav',
        'footer', 'header', 'main', 'aside', 'table', 'title', 'body', 'head',
        'script', 'style', 'link', 'meta', 'form', 'input', 'button', 'label',
        'select', 'option', 'textarea', 'canvas', 'audio', 'video', 'source',
        'track', 'menu', 'menuitem', 'dialog', 'summary', 'details'
    ],
    style: [
        'color', 'background', 'padding', 'margin', 'border', 'font', 'text',
        'align', 'display', 'position', 'width', 'height', 'top', 'left', 
        'bottom', 'right', 'float', 'clear', 'opacity', 'overflow', 'clip',
        'visibility', 'transform', 'transition', 'animation', 'grid', 'flex'
    ]
    };
    
    if (domain in domainTerms) {
      this.dictionaries[domain] = {};
      
      // Count occurrences of domain terms
      const terms = domainTerms[domain];
      const termCounts = new Map<string, number>();
      
      for (const term of terms) {
        const regex = new RegExp(`\\b${term}\\b`, 'g');
        const matches = this.content.match(regex);
        if (matches && matches.length >= this.minOccurrences) {
          termCounts.set(term, matches.length);
        }
      }
      
      // Create domain dictionary
      let dictIndex = 1;
      for (const [term, _] of Array.from(termCounts.entries()).sort((a, b) => b[1] - a[1])) {
        const code = `$${domain.charAt(0).toUpperCase()}${dictIndex}`;
        this.dictionaries[domain][code] = term;
        dictIndex++;
      }
    }
  }

  /**
   * Find and create structure references
   */
  private createStructureReferences(): void {
    // Find JSON structures with improved regex to handle nested structures
    // This regex uses a basic depth counter approach for matching braces
    const findJsonObjects = (content: string): string[] => {
      const results: string[] = [];
      let pos = 0;
      
      while (pos < content.length) {
        // Find an opening brace that looks like it starts a JSON object
        const openBracePos = content.indexOf('{', pos);
        if (openBracePos === -1) break;
        
        // Make sure it's followed by a quote or whitespace+quote as JSON should
        let nextCharPos = openBracePos + 1;
        while (nextCharPos < content.length && /\s/.test(content[nextCharPos])) {
          nextCharPos++;
        }
        
        if (nextCharPos >= content.length || content[nextCharPos] !== '"') {
          pos = openBracePos + 1;
          continue;
        }
        
        // Count braces to find the matching closing brace
        let depth = 1;
        let endPos = openBracePos + 1;
        
        while (depth > 0 && endPos < content.length) {
          if (content[endPos] === '{' && content[endPos-1] !== '\\') {
            depth++;
          } else if (content[endPos] === '}' && content[endPos-1] !== '\\') {
            depth--;
          }
          endPos++;
        }
        
        if (depth === 0) {
          // Successfully found a complete JSON object
          const jsonObj = content.substring(openBracePos, endPos);
          if (jsonObj.length >= 20) { // Skip very short JSON
            results.push(jsonObj);
          }
        }
        
        pos = endPos;
      }
      
      return results;
    };
    
    const jsonMatches = findJsonObjects(this.content);
    
    // Find repeated JSON structures
    const jsonCounts = new Map<string, number>();
    for (const json of jsonMatches) {
      const count = jsonCounts.get(json) || 0;
      jsonCounts.set(json, count + 1);
    }
    
    // Create reference blocks for repeated structures
    let refIndex = 1;
    for (const [structure, count] of jsonCounts.entries()) {
      if (count >= 2) {
        const refId = `R${refIndex}`;
        this.references[refId] = structure;
        refIndex++;
      }
    }
    
    // Find repeated code blocks and structural patterns
    const patternTypes = [
    {
        // Function blocks
        regex: /(?:function\s+\w+|\w+\s*=\s*(?:function|\([^)]*\)\s*=>))\s*\([^)]*\)\s*{[^{}]*(?:{[^{}]*}[^{}]*)*}/gs,
        minLength: 30
    },
    {
        // Class methods
        regex: /(?:public|private|protected|static)?\s*\w+\s*\([^)]*\)\s*{[^{}]*(?:{[^{}]*}[^{}]*)*}/gs,
        minLength: 25 
    },
    {
        // Variable declarations with complex initializers
        regex: /(?:const|let|var)\s+\w+\s*=\s*(?:{[^{}]*}|\[[^\]]*\]|\([^)]*\))/gs,
        minLength: 20
    },
    {
        // Repeated conditionals or loops
        regex: /(?:if|while|for)\s*\([^)]+\)\s*{[^{}]*(?:{[^{}]*}[^{}]*)*}/gs,
        minLength: 25
    }
    ];

    const codeBlockCounts = new Map<string, number>();
    for (const pattern of patternTypes) {
    const matches = [...this.content.matchAll(pattern.regex)];
    for (const match of matches) {
        const code = match[0];
        if (code.length < pattern.minLength) continue;
        const count = codeBlockCounts.get(code) || 0;
        codeBlockCounts.set(code, count + 1);
    }
    }
    
    // Create reference blocks for repeated code patterns
    for (const [structure, count] of codeBlockCounts.entries()) {
      if (count >= 2) {
        const refId = `R${refIndex}`;
        this.references[refId] = structure;
        refIndex++;
      }
    }
  }

  /**
   * Apply compression rules to content
   */
  private applyCompressionRules(content: string): string {
    let processedContent = content;
    
    // 1. Replace dictionary terms with their codes
    for (const domain in this.dictionaries) {
      const dictionary = this.dictionaries[domain];
      for (const code in dictionary) {
        const term = dictionary[code];
        const regex = new RegExp(`\\b${term}\\b`, 'g');
        processedContent = processedContent.replace(regex, code);
      }
    }
    
    // 2. Replace repeated structures with references
    for (const refId in this.references) {
      const structure = this.references[refId];
      const escapedStructure = structure.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedStructure, 'g');
      processedContent = processedContent.replace(regex, `$REF:${refId}`);
    }
    
    // 3. Apply structure shorthand for indentation
    // This is a simplified version - real implementation would be more complex
    const indentPattern = /^(\s+)(.+)$/gm;
    let lastIndent = 0;
    
    processedContent = processedContent.replace(indentPattern, (match, indent, content) => {
      const indentLevel = indent.length;
      let result = '';
      
      if (indentLevel > lastIndent) {
        // Indent increase
        result = '>> ' + content;
      } else if (indentLevel < lastIndent) {
        // Indent decrease
        result = '<< ' + content;
      } else {
        // Same indent
        result = indent + content;
      }
      
      lastIndent = indentLevel;
      return result;
    });
    
    // 4. Mark verbatim sections if required by options
    if (this.options.preserveVerbatim) {
      // This is a placeholder - real implementation would identify
      // sections that should be preserved verbatim
      const verbatimRegex = /```([^`]+)```/g;
      processedContent = processedContent.replace(verbatimRegex, '<VERB>$1</VERB>');
    }
    
    return processedContent;
  }

  /**
   * Generate the full compressed output
   */
  private generateCompressedOutput(processedContent: string): string {
    let output = '';
    
    // 1. Add header with format description for LLMs
    output += '<UTCP-v1>\n';
    output += '<FORMAT-DESCRIPTION>\n';
    output += 'This file is compressed using the Universal Text Compression Protocol (UTCP).\n';
    output += 'UTCP is optimized for text files, especially code and structured text.\n';
    output += 'Format organization:\n';
    output += '1. Metadata section: Contains file information (type, size, etc.)\n';
    output += '2. Dictionary sections: Define code replacements for common terms\n';
    output += '   - Global dictionary applies to all content\n';
    output += '   - Domain dictionaries are specific to file types\n';
    output += '3. Reference sections: Define replacements for repeated structures\n';
    output += '4. Compressed content: The main content with applied replacements\n';
    output += '5. Footer: Contains verification checksums\n';
    output += 'Decompression instructions:\n';
    output += '- Replace all dictionary codes with their terms\n';
    output += '- Replace all reference markers ($REF:X) with the referenced content\n';
    output += '- Process indentation markers (>> and <<) to recreate proper indentation\n';
    output += '</FORMAT-DESCRIPTION>\n\n';
    
    // 2. Add metadata
    output += `<META:type="${this.metadata.type}">\n`;
    output += `<META:checksum="${this.metadata.checksum}">\n`;
    output += `<META:size="${this.metadata.size}">\n`;
    output += `<META:lines="${this.metadata.lines}">\n`;
    output += `<META:date="${this.metadata.date}">\n\n`;
    
    // 3. Add dictionaries
    if (Object.keys(this.dictionaries.global).length > 0) {
      output += '<DICT:global>\n';
      for (const code in this.dictionaries.global) {
        output += `${code}=${this.dictionaries.global[code]}\n`;
      }
      output += '</DICT:global>\n\n';
    }
    
    // Add domain-specific dictionaries
    for (const domain in this.dictionaries) {
      if (domain === 'global') continue;
      
      const dictionary = this.dictionaries[domain];
      if (Object.keys(dictionary).length > 0) {
        output += `<DICT:${domain}>\n`;
        for (const code in dictionary) {
          output += `${code}=${dictionary[code]}\n`;
        }
        output += `</DICT:${domain}>\n\n`;
      }
    }
    
    // 4. Add references
    for (const refId in this.references) {
      output += `<REF:${refId}>\n`;
      output += this.references[refId] + '\n';
      output += `</REF:${refId}>\n\n`;
    }
    
    // 5. Add compressed content
    output += '<CONTENT>\n';
    output += processedContent + '\n';
    output += '</CONTENT>\n\n';
    
    // 6. Add verification footer
    const compressedChecksum = calculateChecksum(processedContent);
    output += `<EOF:checksum="${compressedChecksum}">\n`;
    output += '</UTCP-v1>';
    
    return output;
  }
}