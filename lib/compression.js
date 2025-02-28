"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UTCPCompressor = void 0;
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const utils_1 = require("./utils");
// Minimum file size to use full compression (500 bytes)
const MIN_FILE_SIZE = 500;
// Default threshold for using parallel processing (1MB)
const DEFAULT_PARALLEL_THRESHOLD = 1024 * 1024;
// Default number of chunks for parallel processing
const DEFAULT_CHUNK_COUNT = Math.max(2, os.cpus().length);
// Default token settings for file splitting
const DEFAULT_CHARS_PER_TOKEN = 4;
const DEFAULT_MAX_TOKENS_PER_FILE = 40000;
// Minimum length for dictionary terms when optimizing for tokens
const MIN_TERM_LENGTH = 5;
class UTCPCompressor {
    constructor(filePath, content, options = {}) {
        this.dictionaries = { global: {} };
        this.references = {};
        this.compressedContent = '';
        this.filePath = filePath;
        this.content = content;
        this.options = options;
        this.minOccurrences = options.minOccurrences || 2;
        this.metadata = (0, utils_1.generateMetadata)(filePath, content);
    }
    /**
     * Process a chunk of text in parallel to find patterns
     * @param chunk Text chunk to process
     * @param minLength Minimum pattern length
     * @returns Map of patterns and their frequencies
     */
    static processChunk(chunk, minLength) {
        const patterns = new Map();
        // Process identifiers
        const identifierRegex = /\b(?!(?:function|class|const|let|var)\b)([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
        let match;
        while ((match = identifierRegex.exec(chunk)) !== null) {
            const identifier = match[1];
            if (identifier.length < minLength)
                continue;
            patterns.set(identifier, (patterns.get(identifier) || 0) + 1);
        }
        // Process words
        const wordRegex = /\b(\w+)\b/g;
        let wordMatch;
        while ((wordMatch = wordRegex.exec(chunk)) !== null) {
            const word = wordMatch[1];
            if (word.length < minLength)
                continue;
            if (patterns.has(word))
                continue; // Skip identified variables
            patterns.set(word, (patterns.get(word) || 0) + 1);
        }
        return patterns;
    }
    /**
     * Compress the content using UTCP
     */
    async compress() {
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
                    checksum: (0, utils_1.calculateChecksum)(this.content),
                    size: originalSize,
                    lines: (0, utils_1.countLines)(this.content),
                    date: new Date().toISOString()
                },
                dictionaries: { global: {} },
                references: {},
                compressionRatio: originalSize / compressedSize
            };
        }
        // 1. Build dictionaries - use parallel processing for large files if enabled
        await this.buildGlobalDictionaryParallel();
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
     * If token-based splitting is enabled, will create multiple files for large content
     */
    save() {
        // Get the base output path
        const outputPath = `${this.filePath}.utcp`;
        // If splitting by tokens is not enabled, just save the file normally
        if (!this.options.splitByTokens) {
            (0, utils_1.writeFile)(outputPath, this.compressedContent);
            return outputPath;
        }
        // Token-based file splitting
        const charsPerToken = this.options.charsPerToken || DEFAULT_CHARS_PER_TOKEN;
        const maxTokensPerFile = this.options.maxTokensPerFile || DEFAULT_MAX_TOKENS_PER_FILE;
        const maxCharsPerFile = maxTokensPerFile * charsPerToken;
        // Calculate the estimated token count
        const contentLength = Buffer.from(this.compressedContent).length;
        const estimatedTokens = Math.ceil(contentLength / charsPerToken);
        console.log(`Estimated ${estimatedTokens} tokens, max tokens per file: ${maxTokensPerFile}, max chars per file: ${maxCharsPerFile}`);
        // For proper file splitting, we need to respect the maxTokensPerFile parameter
        const shouldSplit = this.options.splitByTokens && (estimatedTokens > maxTokensPerFile);
        if (!shouldSplit) {
            console.log("No need to split - file is small enough");
            (0, utils_1.writeFile)(outputPath, this.compressedContent);
            return outputPath;
        }
        // Split the content into multiple files
        const fileCount = Math.ceil(estimatedTokens / maxTokensPerFile);
        console.log(`Content exceeds ${maxTokensPerFile} tokens (est. ${estimatedTokens}). Splitting into ${fileCount} files.`);
        // Add a header to each split indicating it's part of a multi-file compression
        const multiFileHeader = `<UTCP-SPLIT-FILE>\n<TOTAL-FILES>${fileCount}</TOTAL-FILES>\n`;
        // Calculate how to split the content
        const splitFiles = [];
        for (let i = 0; i < fileCount; i++) {
            const start = i * maxCharsPerFile;
            const end = Math.min(start + maxCharsPerFile, contentLength);
            const splitContent = this.compressedContent.substring(start, end);
            // Generate filename with simplified part number pattern
            const splitPath = `${this.filePath}.part${i + 1}.utcp`;
            // Create file header with split information
            const fileHeader = `${multiFileHeader}<PART>${i + 1}</PART>\n<TOTAL-PARTS>${fileCount}</TOTAL-PARTS>\n<OFFSET>${start}</OFFSET>\n`;
            // Write the split file with header
            (0, utils_1.writeFile)(splitPath, fileHeader + splitContent);
            splitFiles.push(splitPath);
        }
        // Create an index file listing all parts
        const indexContent = `<UTCP-SPLIT-INDEX>\n<TOTAL-FILES>${fileCount}</TOTAL-FILES>\n` +
            `<ORIGINAL-FILENAME>${path.basename(this.filePath)}</ORIGINAL-FILENAME>\n` +
            `<TOTAL-SIZE>${contentLength}</TOTAL-SIZE>\n` +
            `<ESTIMATED-TOKENS>${estimatedTokens}</ESTIMATED-TOKENS>\n` +
            `<PARTS>\n${splitFiles.map(f => path.basename(f)).join('\n')}\n</PARTS>\n` +
            `</UTCP-SPLIT-INDEX>`;
        (0, utils_1.writeFile)(outputPath, indexContent);
        // Return all paths (index file first)
        return [outputPath, ...splitFiles];
    }
    /**
     * Merge pattern maps from parallel processing
     * @param patternMaps Array of pattern maps to merge
     * @returns Merged map with combined frequencies
     */
    mergePatternMaps(patternMaps) {
        const mergedMap = new Map();
        for (const map of patternMaps) {
            for (const [pattern, count] of map.entries()) {
                mergedMap.set(pattern, (mergedMap.get(pattern) || 0) + count);
            }
        }
        return mergedMap;
    }
    /**
     * Build global dictionary using parallel processing if enabled and content size exceeds threshold
     */
    async buildGlobalDictionaryParallel() {
        const originalSize = Buffer.from(this.content).length;
        const threshold = this.options.parallelThreshold || DEFAULT_PARALLEL_THRESHOLD;
        // Only use parallel processing for large files if enabled
        if (!this.options.useParallel || originalSize < threshold) {
            this.buildGlobalDictionary();
            return;
        }
        try {
            console.log(`Using parallel processing for file of size ${originalSize} bytes`);
            // Determine chunk count based on file size and CPU cores
            const chunkCount = DEFAULT_CHUNK_COUNT;
            const chunkSize = Math.ceil(this.content.length / chunkCount);
            // Split content into chunks
            const chunks = [];
            for (let i = 0; i < chunkCount; i++) {
                const start = i * chunkSize;
                const end = Math.min(start + chunkSize, this.content.length);
                chunks.push(this.content.substring(start, end));
            }
            // Process function patterns sequentially (these might span chunk boundaries)
            const functionRegex = /(function\s+\w+\s*\([^)]*\)\s*{[^{}]*(?:{[^{}]*}[^{}]*)*})/gs;
            const functionCounts = new Map();
            let functionMatch;
            while ((functionMatch = functionRegex.exec(this.content)) !== null) {
                const functionBody = functionMatch[1];
                if (functionBody.length < 20)
                    continue; // Skip very short functions
                functionCounts.set(functionBody, (functionCounts.get(functionBody) || 0) + 1);
            }
            // Process chunks in parallel
            const chunkResults = await Promise.all(chunks.map(chunk => {
                return new Promise((resolve) => {
                    resolve(UTCPCompressor.processChunk(chunk, MIN_TERM_LENGTH));
                });
            }));
            // Merge results from all chunks
            const mergedPatterns = this.mergePatternMaps(chunkResults);
            // Combine with function patterns and create dictionary
            const allPatterns = [
                ...Array.from(functionCounts.entries()),
                ...Array.from(mergedPatterns.entries())
            ]
                .filter(([word, count]) => count >= this.minOccurrences)
                .sort((a, b) => {
                // For token efficiency, prioritize by (length * frequency)
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
        catch (error) {
            console.warn(`Error in parallel processing: ${error}. Falling back to sequential processing.`);
            this.buildGlobalDictionary();
        }
    }
    /**
     * Build global dictionary of common terms (sequential implementation)
     */
    buildGlobalDictionary() {
        // First pass - identify complete function patterns for better LLM token compression
        const functionRegex = /(function\s+\w+\s*\([^)]*\)\s*{[^{}]*(?:{[^{}]*}[^{}]*)*})/gs;
        const functionCounts = new Map();
        let functionMatch;
        while ((functionMatch = functionRegex.exec(this.content)) !== null) {
            const functionBody = functionMatch[1];
            if (functionBody.length < 20)
                continue; // Skip very short functions
            const count = functionCounts.get(functionBody) || 0;
            functionCounts.set(functionBody, count + 1);
        }
        // Second pass - identify variable names and custom identifiers
        const identifierRegex = /\b(?!(?:function|class|const|let|var)\b)([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
        const identifierCounts = new Map();
        let match;
        while ((match = identifierRegex.exec(this.content)) !== null) {
            const identifier = match[1];
            if (identifier.length < MIN_TERM_LENGTH)
                continue; // Focus on longer identifiers for better token efficiency
            const count = identifierCounts.get(identifier) || 0;
            identifierCounts.set(identifier, count + 1);
        }
        // Third pass - standard words
        const wordRegex = /\b(\w+)\b/g;
        const wordCounts = new Map();
        let wordMatch;
        while ((wordMatch = wordRegex.exec(this.content)) !== null) {
            const word = wordMatch[1];
            if (word.length < MIN_TERM_LENGTH)
                continue; // Focus on longer words
            if (identifierCounts.has(word))
                continue; // Skip identified variables
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
    buildDomainDictionaries() {
        const domain = (0, utils_1.getDomainFromFileType)(this.metadata.type);
        if (!domain)
            return;
        // Define domain-specific common terms
        const domainTerms = {
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
            const termCounts = new Map();
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
    createStructureReferences() {
        // For LLM token optimization, identify any repeated string of significant length
        const findRepeatedStrings = () => {
            // We'll look for any repeated sequence of at least 40 characters
            const MIN_STRING_LENGTH = 40;
            const substrings = {};
            // Build substrings of meaningful length
            for (let i = 0; i < this.content.length - MIN_STRING_LENGTH; i++) {
                // Check every 10 characters to speed up processing
                if (i % 10 !== 0)
                    continue;
                for (let len = MIN_STRING_LENGTH; len < 200 && i + len <= this.content.length; len += 10) {
                    const substr = this.content.substring(i, i + len);
                    substrings[substr] = (substrings[substr] || 0) + 1;
                }
            }
            // Filter to only repeated substrings
            return Object.entries(substrings)
                .filter(([str, count]) => count > 1)
                .sort((a, b) => (b[1] * b[0].length) - (a[1] * a[0].length)) // Sort by token saving potential
                .slice(0, 20); // Limit to most impactful substrings
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
        const functionCounts = new Map();
        for (const match of functionMatches) {
            const functionCode = match[0];
            if (functionCode.length < 40)
                continue;
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
    applyCompressionRules(content) {
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
                    }
                    catch (e) {
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
                }
                catch (e) {
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
                    }
                    else if (indentLevel < lastIndent) {
                        // Indent decrease
                        result = '<< ' + content;
                    }
                    else {
                        // Same indent
                        result = indent + content;
                    }
                    lastIndent = indentLevel;
                    return result;
                });
            }
            catch (e) {
                console.warn(`WARNING: Error processing indentation: ${e}`);
            }
            // 4. Mark verbatim sections if required by options
            if (this.options.preserveVerbatim) {
                try {
                    const verbatimRegex = /```([^`]+)```/g;
                    processedContent = processedContent.replace(verbatimRegex, '<VERB>$1</VERB>');
                }
                catch (e) {
                    console.warn(`WARNING: Error processing verbatim sections: ${e}`);
                }
            }
            // Final verification to make sure we didn't end up with "..."
            if (processedContent.trim() === "..." || processedContent.trim().length === 0) {
                console.warn("WARNING: Compression resulted in '...' content, using original content");
                return content;
            }
            return processedContent;
        }
        catch (e) {
            console.warn(`ERROR during compression: ${e}`);
            // If any error occurs, return the original content
            return content;
        }
    }
    /**
     * Generate the full compressed output
     */
    generateCompressedOutput(processedContent) {
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
            if (domain === 'global')
                continue;
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
        }
        else {
            // Normal case - use the processed content
            output += '<CONTENT>\n';
            output += processedContent + '\n';
            output += '</CONTENT>\n\n';
        }
        // 6. Add verification footer
        const contentToCheck = !processedContent || processedContent.trim() === "..." ? this.content : processedContent;
        const compressedChecksum = (0, utils_1.calculateChecksum)(contentToCheck);
        output += `<EOF:checksum="${compressedChecksum}">\n`;
        output += '</UTCP-v1>';
        return output;
    }
}
exports.UTCPCompressor = UTCPCompressor;
