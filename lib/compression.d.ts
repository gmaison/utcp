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
     * Compress the content using UTCP
     */
    compress(): CompressionResult;
    /**
     * Save the compressed content to a file
     */
    save(): string;
    /**
     * Build global dictionary of common terms
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
