import { DecompressionOptions, DecompressionResult } from './types';
export declare class UTCPDecompressor {
    private content;
    private filePath;
    private options;
    private metadata;
    private dictionaries;
    private references;
    private decompressedContent;
    private compressedChecksum;
    constructor(filePath: string, content: string, options?: DecompressionOptions);
    /**
     * Decompress the UTCP content
     * Also handles split files by checking if this is an index file
     */
    decompress(): DecompressionResult;
    /**
     * Decompress a split file by reading all parts and combining them
     */
    private decompressSplitFile;
    /**
     * Save the decompressed content to a file
     */
    save(): string;
    /**
     * Parse the UTCP format
     */
    private parseUTCPFormat;
    /**
     * Parse metadata section
     */
    private parseMetadata;
    /**
     * Parse dictionary sections
     */
    private parseDictionaries;
    /**
     * Parse reference blocks
     */
    private parseReferences;
    /**
     * Parse EOF checksum
     */
    private parseEOFChecksum;
    /**
     * Extract the compressed content (between metadata/dictionaries/references and EOF)
     */
    private extractCompressedContent;
    /**
     * Apply decompression rules
     */
    private applyDecompressionRules;
    /**
    * Verify the decompressed content
    */
    private verifyDecompression;
    /**
     * Determine the output path for the decompressed file
     */
    private determineOutputPath;
}
