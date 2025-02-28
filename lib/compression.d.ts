import { CompressionOptions, CompressionResult } from './types';
export declare class UTCPCompressor {
    private content;
    private filePath;
    private options;
    private metadata;
    private dictionaries;
    private references;
    private compressedContent;
    private minOccurrences;
    constructor(filePath: string, content: string, options?: CompressionOptions);
    /**
     * Process a chunk of text in parallel to find patterns
     * @param chunk Text chunk to process
     * @param minLength Minimum pattern length
     * @returns Map of patterns and their frequencies
     */
    private static processChunk;
    /**
     * Compress the content using UTCP
     */
    compress(): Promise<CompressionResult>;
    /**
     * Save the compressed content to a file
     * If token-based splitting is enabled, will create multiple files for large content
     */
    save(): string | string[];
    /**
     * Merge pattern maps from parallel processing
     * @param patternMaps Array of pattern maps to merge
     * @returns Merged map with combined frequencies
     */
    private mergePatternMaps;
    /**
     * Build global dictionary using parallel processing if enabled and content size exceeds threshold
     */
    private buildGlobalDictionaryParallel;
    /**
     * Build global dictionary of common terms (sequential implementation)
     */
    private buildGlobalDictionary;
    /**
     * Build domain-specific dictionaries
     */
    private buildDomainDictionaries;
    /**
     * Find and create structure references
     */
    private createStructureReferences;
    /**
     * Apply compression rules to content
     */
    private applyCompressionRules;
    /**
     * Generate the full compressed output
     */
    private generateCompressedOutput;
}
