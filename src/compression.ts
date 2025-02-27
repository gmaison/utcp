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

// Minimum length for dictionary terms when optimizing for tokens
const MIN_TERM_LENGTH = 5;

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

// 6. Check if compression is effective for TOKEN reduction - if not, use original content
// For LLM token efficiency, we need to make sure the compression is worth it, but let's be lenient
if (compressionRatio < 1.0) {
    // Use the original format wrapper since it helps decompression to work properly
    this.compressedContent = `<UTCP-v1-original>
<FORMAT-DESCRIPTION>
This is an uncompressed UTCP file (original content). No decompression needed, simply extract content between <CONTENT> tags.
</FORMAT-DESCRIPTION>
<META:type="${this.metadata.type}">
<META:checksum="${this.metadata.checksum}">
<META:size="${this.metadata.size}">
<META:lines="${this.metadata.lines}">
<META:date="${this.metadata.date}">
<CONTENT>
${this.content}
</CONTENT>
</UTCP-v1-original>`;
    
    // Return original content in a standardized wrapper
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

// First pass - identify complete function patterns for better LLM token compression
const functionRegex = /(function\s+\w+\s*\([^)]*\)\s*{[^{}]*(?:{[^{}]*}[^{}]*)*})/gs;
const functionCounts = new Map<string, number>();
let functionMatch;
while ((functionMatch = functionRegex.exec(this.content)) !== null) {
    const functionBody = functionMatch[1];
    if (functionBody.length < 20) continue; // Skip very short functions
    const count = functionCounts.get(functionBody) || 0;
    functionCounts.set(functionBody, count + 1);
}

// Second pass - identify variable names and custom identifiers
const identifierRegex = /\b(?!(?:function|class|const|let|var)\b)([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
const identifierCounts = new Map<string, number>();
let match;
while ((match = identifierRegex.exec(this.content)) !== null) {
    const identifier = match[1];
    if (identifier.length < MIN_TERM_LENGTH) continue; // Focus on longer identifiers for better token efficiency
    const count = identifierCounts.get(identifier) || 0;
    identifierCounts.set(identifier, count + 1);
}

// Third pass - standard words
const wordRegex = /\b(\w+)\b/g;
const wordCounts = new Map<string, number>();
let wordMatch;
while ((wordMatch = wordRegex.exec(this.content)) !== null) {
    const word = wordMatch[1];
    if (word.length < MIN_TERM_LENGTH) continue; // Focus on longer words
    if (identifierCounts.has(word)) continue; // Skip identified variables
    const count = wordCounts.get(word) || 0;
    wordCounts.set(word, count + 1);
}

// Combine and sort all patterns by frequency and length
// Add function patterns first as they compress best for LLMs
const allPatterns = [
    ...Array.from(functionCounts.entries()),
    ...Array.from(identifierCounts.entries()),
    ...Array.from(wordCounts.entries())
]
    .filter(([word, count]) => count >= this.minOccurrences)
    .sort((a, b) => {
    // For token efficiency, prioritize by (length * frequency) - this optimizes token saving
    const tokenSavingA = a[0].length * a[1];
    const tokenSavingB = b[0].length * b[1];
    return tokenSavingB - tokenSavingA;
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
    // For LLM token optimization, identify any repeated string of significant length
    const findRepeatedStrings = () => {
      // We'll look for any repeated sequence of at least 40 characters
      const MIN_STRING_LENGTH = 40;
      const substrings: Record<string, number> = {};
      
      // Build substrings of meaningful length
      for (let i = 0; i < this.content.length - MIN_STRING_LENGTH; i++) {
        // Check every 10 characters to speed up processing
        if (i % 10 !== 0) continue;
        
        for (let len = MIN_STRING_LENGTH; len < 200 && i + len <= this.content.length; len += 10) {
          const substr = this.content.substring(i, i + len);
          substrings[substr] = (substrings[substr] || 0) + 1;
        }
      }
      
      // Filter to only repeated substrings
      return Object.entries(substrings)
        .filter(([str, count]) => count > 1)
        .sort((a, b) => (b[1] * b[0].length) - (a[1] * a[0].length))  // Sort by token saving potential
        .slice(0, 20);  // Limit to most impactful substrings
    };
    
    // Get repeated code blocks/strings
    const repeatedStrings = findRepeatedStrings();
    
    // Create reference blocks for all meaningful repeated strings
    let refIndex = 1;
    for (const [structure, count] of repeatedStrings) {
      const refId = `R${refIndex}`;
      this.references[refId] = structure;
      refIndex++;
    }
    
    // Also look for repeated function blocks using basic regex
    const functionRegex = /function\s+\w+\s*\([^{]*\)\s*\{[^}]*\}/g;
    const functionMatches = [...this.content.matchAll(functionRegex)];
    
    const functionCounts = new Map<string, number>();
    for (const match of functionMatches) {
      const functionCode = match[0];
      if (functionCode.length < 40) continue;
      functionCounts.set(functionCode, (functionCounts.get(functionCode) || 0) + 1);
    }
    
    // Create reference blocks for repeated functions
    for (const [funcCode, count] of functionCounts.entries()) {
      if (count >= 2) {
        const refId = `R${refIndex}`;
        this.references[refId] = funcCode;
        refIndex++;
      }
    }
  }

  /**
   * Apply compression rules to content
   */
  private applyCompressionRules(content: string): string {
    // Safety check for empty content
    if (!content || content.trim().length === 0) {
      console.warn("WARNING: Empty content provided for compression");
      return content;
    }

    let processedContent = content;
    
    try {
      // 1. Replace dictionary terms with their codes
      for (const domain in this.dictionaries) {
        const dictionary = this.dictionaries[domain];
        for (const code in dictionary) {
          const term = dictionary[code];
          try {
            const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
            processedContent = processedContent.replace(regex, code);
          } catch (e) {
            console.warn(`WARNING: Error replacing term "${term}": ${e}`);
          }
        }
      }
      
      // 2. Replace repeated structures with references
      for (const refId in this.references) {
        const structure = this.references[refId];
        try {
          const escapedStructure = structure.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedStructure, 'g');
          processedContent = processedContent.replace(regex, `$REF:${refId}`);
        } catch (e) {
          console.warn(`WARNING: Error replacing structure with reference: ${e}`);
        }
      }
      
      // 3. Apply structure shorthand for indentation
      try {
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
      } catch (e) {
        console.warn(`WARNING: Error processing indentation: ${e}`);
      }
      
      // 4. Mark verbatim sections if required by options
      if (this.options.preserveVerbatim) {
        try {
          const verbatimRegex = /```([^`]+)```/g;
          processedContent = processedContent.replace(verbatimRegex, '<VERB>$1</VERB>');
        } catch (e) {
          console.warn(`WARNING: Error processing verbatim sections: ${e}`);
        }
      }
      
      // Final verification to make sure we didn't end up with "..."
      if (processedContent.trim() === "..." || processedContent.trim().length === 0) {
        console.warn("WARNING: Compression resulted in '...' content, using original content");
        return content;
      }
      
      return processedContent;
    } catch (e) {
      console.warn(`ERROR during compression: ${e}`);
      // If any error occurs, return the original content
      return content;
    }
  }

  /**
   * Generate the full compressed output
   */
  private generateCompressedOutput(processedContent: string): string {
    let output = '';
    
    // 1. Add header with format description for LLMs (detailed enough for an LLM to decompress)
    output += '<UTCP-v1>\n';
    output += '<FORMAT-DESCRIPTION>\n';
    output += 'Universal Text Compression Protocol (UTCP) file - LLM Decompression Instructions:\n';
    output += '1. Extract content between <CONTENT>...</CONTENT> tags\n';
    output += '2. Replace all reference markers $REF:X with the content in corresponding <REF:X>...</REF:X> blocks\n';
    output += '3. Process indentation markers: replace ">> text" with increased indent + text, "<< text" with decreased indent + text\n';
    output += '4. Replace dictionary codes with their definitions from <DICT:*> sections (e.g., $G1 with its value from global dictionary)\n';
    output += '  - Global dictionary codes start with $G (e.g., $G1, $G2)\n';
    output += '  - Domain dictionaries use domain-specific prefixes (e.g., $C1 for code)\n';
    output += '  - IMPORTANT: When replacing codes, ensure you match the exact code (e.g., "$G1" not partial matches)\n';
    output += '5. Remove <VERB>...</VERB> tags but keep their content verbatim\n';
    output += '6. Dictionaries and references have already been processed in this file - no further action needed if reading this text\n';
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
    
    // 5. Add compressed content - IMPORTANT: Validate that processedContent is not empty or just "..."
    if (!processedContent || processedContent.trim() === "..." || processedContent.trim().length === 0) {
      // If content is empty or just "...", use the original content instead
      console.warn("WARNING: Processed content is invalid, using original content instead");
      output += '<CONTENT>\n';
      output += this.content + '\n';
      output += '</CONTENT>\n\n';
    } else {
      // Normal case - use the processed content
      output += '<CONTENT>\n';
      output += processedContent + '\n';
      output += '</CONTENT>\n\n';
    }
    
    // 6. Add verification footer
    const contentToCheck = !processedContent || processedContent.trim() === "..." ? this.content : processedContent;
    const compressedChecksum = calculateChecksum(contentToCheck);
    output += `<EOF:checksum="${compressedChecksum}">\n`;
    output += '</UTCP-v1>';
    
    return output;
  }
}