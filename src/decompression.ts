import * as path from 'path';
import {
  DecompressionOptions,
  DecompressionResult,
  Dictionaries,
  FileMetadata,
  References
} from './types';
import {
  calculateChecksum,
  getSuggestedOutputFilename,
  writeFile,
  countLines,
} from './utils';

export class UTCPDecompressor {
  private content: string;
  private filePath: string;
  private options: DecompressionOptions;
  private metadata: FileMetadata | null = null;
  private dictionaries: Dictionaries = { global: {} };
  private references: References = {};
  private decompressedContent: string = '';
  private compressedChecksum: string = '';

  constructor(
    filePath: string,
    content: string,
    options: DecompressionOptions = {}
  ) {
    this.filePath = filePath;
    this.content = content;
    this.options = options;
  }

  /**
   * Decompress the UTCP content
   */
  public decompress(): DecompressionResult {
    // 1. Parse UTCP format
    this.parseUTCPFormat();
    
    if (!this.metadata) {
      throw new Error('Invalid UTCP format: missing metadata');
    }
    
    // For light and original formats, decompressed content is already set in parseUTCPFormat
    if (!this.decompressedContent) {
      // 2. Extract the compressed content
      const compressedContent = this.extractCompressedContent();
      
      // 3. Apply decompression rules
      this.decompressedContent = this.applyDecompressionRules(compressedContent);
    }
    
    // 4. Verify the result
    const isVerified = this.verifyDecompression();
    
    // 5. Determine output path
    const outputPath = this.determineOutputPath();
    
    return {
      originalContent: this.decompressedContent,
      metadata: this.metadata,
      verified: isVerified,
      outputPath,
    };
  }

  /**
   * Save the decompressed content to a file
   */
  public save(): string {
    const outputPath = this.determineOutputPath();
    writeFile(outputPath, this.decompressedContent);
    return outputPath;
  }

  /**
   * Parse the UTCP format
   */
  private parseUTCPFormat(): void {
    // Check UTCP version and format
    if (this.content.startsWith('<UTCP-v1>')) {
      // Standard compression format
      // Parse metadata
      this.parseMetadata();
      
      // Parse dictionaries
      this.parseDictionaries();
      
      // Parse references
      this.parseReferences();
      
      // Parse EOF checksum
      this.parseEOFChecksum();
    } else if (this.content.startsWith('<UTCP-v1-light>')) {
      // Light compression format for small files
      const sizeMatch = this.content.match(/<META:size="([^"]+)">/);
      if (!sizeMatch) {
        throw new Error('Invalid UTCP light format: missing size metadata');
      }
      
      // Extract content between metadata and closing tag
      const content = this.content.replace(/<UTCP-v1-light>[\s\S]*?<META:size="[^"]+">/, '')
                         .replace(/\n<\/UTCP-v1-light>$/, '');
      
      // Setup metadata
      this.metadata = {
        type: path.extname(this.filePath.replace(/\.utcp$/, '')),
        checksum: calculateChecksum(content),
        size: parseInt(sizeMatch[1], 10),
        lines: countLines(content),
        date: new Date().toISOString(),
      };
      
      // Setup decompressed content directly
      this.decompressedContent = content;
    } else if (this.content.startsWith('<UTCP-v1-original>')) {
      // Original content format (when compression was ineffective) - legacy format
      const typeMatch = this.content.match(/<META:type="([^"]+)">/);
      const checksumMatch = this.content.match(/<META:checksum="([^"]+)">/);
      const sizeMatch = this.content.match(/<META:size="([^"]+)">/);
      const linesMatch = this.content.match(/<META:lines="([^"]+)">/);
      const dateMatch = this.content.match(/<META:date="([^"]+)">/);
      
      if (!typeMatch || !checksumMatch || !sizeMatch || !linesMatch || !dateMatch) {
        throw new Error('Invalid UTCP original format: incomplete metadata');
      }
      
      // Try to extract content from CONTENT tags first
      let contentMatch = this.content.match(/<CONTENT>\s*([\s\S]*?)\s*<\/CONTENT>/);
      
      // If no CONTENT tags, fall back to the old format
      if (!contentMatch) {
        const contentRegex = /<META:date="[^"]+">[\r\n]+([\s\S]*?)[\r\n]+<\/UTCP-v1-original>/;
        contentMatch = this.content.match(contentRegex);
      }
      
      if (!contentMatch) {
        throw new Error('Invalid UTCP original format: cannot extract content');
      }
      
      // Setup metadata
      this.metadata = {
        type: typeMatch[1],
        checksum: checksumMatch[1],
        size: parseInt(sizeMatch[1], 10),
        lines: parseInt(linesMatch[1], 10),
        date: dateMatch[1],
      };
      
      // Setup decompressed content directly
      this.decompressedContent = contentMatch[1];
    } else if (this.content.startsWith('<UTCP>')) {
      // Minimal wrapper format for LLM token efficiency
      // Extract content between UTCP tags
      const contentMatch = this.content.match(/<UTCP>\s*([\s\S]*?)\s*<\/UTCP>/);
      
      if (!contentMatch) {
        throw new Error('Invalid UTCP minimal format: cannot extract content');
      }
      
      // Setup basic metadata
      this.metadata = {
        type: path.extname(this.filePath).replace(/^\./, ''),
        checksum: calculateChecksum(contentMatch[1]),
        size: Buffer.from(contentMatch[1]).length,
        lines: contentMatch[1].split('\n').length,
        date: new Date().toISOString(),
      };
      
      // Setup decompressed content directly
      this.decompressedContent = contentMatch[1];
    } else {
      // This could be raw content (maximum token efficiency mode)
      // If it doesn't match any known UTCP format, assume it's uncompressed content
      
      // Setup basic metadata
      this.metadata = {
        type: path.extname(this.filePath).replace(/^\./, ''),
        checksum: calculateChecksum(this.content),
        size: Buffer.from(this.content).length,
        lines: this.content.split('\n').length,
        date: new Date().toISOString(),
      };
      
      // Setup decompressed content directly
      this.decompressedContent = this.content;
      return; // Skip further format checks
    }
  }

  /**
   * Parse metadata section
   */
  private parseMetadata(): void {
    const typeMatch = this.content.match(/<META:type="([^"]+)">/);
    const checksumMatch = this.content.match(/<META:checksum="([^"]+)">/);
    const sizeMatch = this.content.match(/<META:size="([^"]+)">/);
    const linesMatch = this.content.match(/<META:lines="([^"]+)">/);
    const dateMatch = this.content.match(/<META:date="([^"]+)">/);
    
    if (!typeMatch || !checksumMatch || !sizeMatch || !linesMatch || !dateMatch) {
      throw new Error('Invalid UTCP format: incomplete metadata');
    }
    
    this.metadata = {
      type: typeMatch[1],
      checksum: checksumMatch[1],
      size: parseInt(sizeMatch[1], 10),
      lines: parseInt(linesMatch[1], 10),
      date: dateMatch[1],
    };
  }

  /**
   * Parse dictionary sections
   */
  private parseDictionaries(): void {
    // Parse global dictionary
    const globalDictMatch = this.content.match(/<DICT:global>([\s\S]*?)<\/DICT:global>/);
    if (globalDictMatch) {
      const dictContent = globalDictMatch[1].trim();
      const lines = dictContent.split('\n');
      
      for (const line of lines) {
        const [code, term] = line.split('=');
        if (code && term) {
          this.dictionaries.global[code.trim()] = term.trim();
        }
      }
    }
    
    // Parse domain-specific dictionaries
    const domainDictRegex = /<DICT:([^>]+)>([\s\S]*?)<\/DICT:\1>/g;
    let domainMatch;
    
    while ((domainMatch = domainDictRegex.exec(this.content)) !== null) {
      const domain = domainMatch[1];
      const dictContent = domainMatch[2].trim();
      
      if (domain !== 'global') {
        this.dictionaries[domain] = {};
        const lines = dictContent.split('\n');
        
        for (const line of lines) {
          const [code, term] = line.split('=');
          if (code && term) {
            this.dictionaries[domain][code.trim()] = term.trim();
          }
        }
      }
    }
  }

  /**
   * Parse reference blocks
   */
  private parseReferences(): void {
    const refRegex = /<REF:([^>]+)>([\s\S]*?)<\/REF:\1>/g;
    let refMatch;
    
    while ((refMatch = refRegex.exec(this.content)) !== null) {
      const refId = refMatch[1];
      const refContent = refMatch[2].trim();
      this.references[refId] = refContent;
    }
  }

  /**
   * Parse EOF checksum
   */
  private parseEOFChecksum(): void {
    const checksumMatch = this.content.match(/<EOF:checksum="([^"]+)">/);
    if (checksumMatch) {
      this.compressedChecksum = checksumMatch[1];
    }
  }

  /**
   * Extract the compressed content (between metadata/dictionaries/references and EOF)
   */
  private extractCompressedContent(): string {
    try {
      // First check if there are explicit content tags - this is most reliable
      const contentTagMatch = this.content.match(/<CONTENT>\s*([\s\S]*?)\s*<\/CONTENT>/);
      if (contentTagMatch) {
        const extractedContent = contentTagMatch[1].trim();
        
        // Validate extracted content is not just "..."
        if (extractedContent === "..." || extractedContent.length === 0) {
          console.warn("WARNING: Extracted content is '...' or empty, looking for original file");
          
          // If the file has a .utcp extension, try to see if the original file exists
          if (this.filePath.endsWith('.utcp')) {
            const originalPath = this.filePath.slice(0, -5); // Remove .utcp
            try {
              const fs = require('fs');
              if (fs.existsSync(originalPath)) {
                console.warn(`Original file found at ${originalPath}, using its content`);
                return fs.readFileSync(originalPath, 'utf8');
              }
            } catch (e) {
              console.warn(`Error checking for original file: ${e}`);
            }
          }
        }
        
        return extractedContent;
      }
      
      // If no content tags, use the standard format extraction
      let content = this.content;
      
      // Remove format description if present
      content = content.replace(/<FORMAT-DESCRIPTION>[\s\S]*?<\/FORMAT-DESCRIPTION>\s*/, '');
      
      // Remove header, metadata
      content = content.replace(/<UTCP-v1>[\s\S]*?<META:date="[^"]+">/, '');
      
      // Remove all dictionaries
      content = content.replace(/<DICT:[^>]+>[\s\S]*?<\/DICT:[^>]+>/g, '');
      
      // Remove all references
      content = content.replace(/<REF:[^>]+>[\s\S]*?<\/REF:[^>]+>/g, '');
      
      // Remove EOF and closing tag and return all remaining content
      content = content.replace(/<EOF:checksum="[^"]+">[\s\S]*?<\/UTCP-v1>/, '');
      
      const result = content.trim();
      
      // Final validation
      if (result === "..." || result.length === 0) {
        throw new Error("Extracted content is invalid");
      }
      
      return result;
    } catch (e) {
      console.warn(`ERROR extracting compressed content: ${e}`);
      // Try to find original file as fallback
      if (this.filePath.endsWith('.utcp')) {
        const originalPath = this.filePath.slice(0, -5);
        try {
          const fs = require('fs');
          if (fs.existsSync(originalPath)) {
            console.warn(`Original file found at ${originalPath}, using its content as fallback`);
            return fs.readFileSync(originalPath, 'utf8');
          }
        } catch (fallbackError) {
          console.warn(`Error using fallback: ${fallbackError}`);
        }
      }
      
      // If all else fails, return original content
      return this.content;
    }
  }

  /**
   * Apply decompression rules
   */
  private applyDecompressionRules(content: string): string {
    let processedContent = content;
    
    // 1. Replace reference markers with their content
    for (const refId in this.references) {
      const refRegex = new RegExp(`\\$REF:${refId}`, 'g');
      processedContent = processedContent.replace(refRegex, this.references[refId]);
    }
    
    // 2. Replace structure shorthand for indentation
    let indentLevel = 0;
    let lines = processedContent.split('\n');
    let result = [];
    
    for (const line of lines) {
      if (line.startsWith('>> ')) {
        // Indent increase
        indentLevel++;
        const indent = ' '.repeat(indentLevel * 2);
        result.push(indent + line.substring(3));
      } else if (line.startsWith('<< ')) {
        // Indent decrease
        indentLevel--;
        if (indentLevel < 0) indentLevel = 0;
        const indent = ' '.repeat(indentLevel * 2);
        result.push(indent + line.substring(3));
      } else {
        result.push(line);
      }
    }
    
    processedContent = result.join('\n');
    
    // 3. Handle verbatim sections
    processedContent = processedContent.replace(/<VERB>([\s\S]*?)<\/VERB>/g, '$1');
    
    // 4. Replace dictionary codes with their terms
    // First, sort dictionary keys by length (longest first) to prevent partial replacements
    for (const domain in this.dictionaries) {
      const dictionary = this.dictionaries[domain];
      const sortedCodes = Object.keys(dictionary).sort((a, b) => b.length - a.length);
      
      for (const code of sortedCodes) {
        const term = dictionary[code];
        // Direct string replacement for dictionary codes - escape the $ for regex
        const escapedCode = code.replace(/\$/g, '\\$');
        
        // Simple string replacement - since dictionary codes are unique like $G1, $G2, etc.
        processedContent = processedContent.replace(new RegExp(escapedCode, 'g'), term);
      }
    }
    
    return processedContent;
  }

/**
* Verify the decompressed content
*/
private verifyDecompression(): boolean {
if (!this.metadata) return false;

// Calculate checksum of decompressed content
const decompressedChecksum = calculateChecksum(this.decompressedContent);

// Calculate size and line count
const size = Buffer.from(this.decompressedContent).length;
const lines = this.decompressedContent.split('\n').length;

// Verify metrics against metadata
const sizeMatches = size === this.metadata.size;
const linesMatch = lines === this.metadata.lines; 
const checksumMatches = this.metadata.checksum === decompressedChecksum;

// If format is original or light, we expect exact match
if (this.content.startsWith('<UTCP-v1-original>') || 
    this.content.startsWith('<UTCP-v1-light>')) {
  return sizeMatches && linesMatch && checksumMatches;
}

// For standard format, properly verify the checksum
return checksumMatches && sizeMatches && linesMatch;
}

  /**
   * Determine the output path for the decompressed file
   */
  private determineOutputPath(): string {
    if (this.options.outputFilename) {
      return this.options.outputFilename;
    }
    
    return getSuggestedOutputFilename(this.filePath);
  }
}