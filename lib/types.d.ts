export interface FileMetadata {
    type: string;
    checksum: string;
    size: number;
    lines: number;
    date: string;
}
export interface Dictionary {
    [code: string]: string;
}
export interface Dictionaries {
    global: Dictionary;
    [domain: string]: Dictionary;
}
export interface Reference {
    [id: string]: string;
}
export interface References {
    [id: string]: string;
}
export interface CompressionOptions {
    minOccurrences?: number;
    preserveVerbatim?: boolean;
    useParallel?: boolean;
    parallelThreshold?: number;
    splitByTokens?: boolean;
    maxTokensPerFile?: number;
    charsPerToken?: number;
}
export interface DecompressionOptions {
    outputFilename?: string;
}
export interface CompressionResult {
    compressedContent: string;
    metadata: FileMetadata;
    dictionaries: Dictionaries;
    references: References;
    compressionRatio: number;
    splitFiles?: string[];
}
export interface DecompressionResult {
    originalContent: string;
    metadata: FileMetadata;
    verified: boolean;
    outputPath: string;
}
