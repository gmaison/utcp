# Universal Text Compression Protocol (UTCP)

A Node.js implementation of the Universal Text Compression Protocol for compressing and decompressing text files.

## What's Special About UTCP?

1. **Domain-Specific Compression** - Optimized compression for different file types (code, markup, etc.)
2. **Structure Recognition** - Identifies and compresses repeated patterns and structures
3. **Self-Documenting Format** - Includes format descriptions and decompression instructions
4. **Intelligent Fallback** - Automatically uses original content when compression would be ineffective
5. **Metadata Preservation** - Retains file information like checksums and line counts
6. **LLM-Friendly Structure** - Dictionaries and references are useful context for language models
7. **Parallel Processing** - Leverages multi-core processing for large files to improve performance
8. **Token-Based Splitting** - Automatically splits large files into manageable chunks based on token count limits

## Installation

### Global Installation

```bash
npm install -g utcp
```

### Local Installation

```bash
npm install utcp
```

## Usage

### Command Line Interface

UTCP provides a command-line interface for compressing and decompressing files.

#### Compress a File

```bash
utcp compress path/to/file.txt
```

Options:
- `-m, --min-occurrences <number>` - Minimum occurrences for dictionary terms (default: 3)
- `-v, --preserve-verbatim` - Preserve verbatim sections
- `-p, --parallel` - Use parallel processing for large files
- `-t, --parallel-threshold <number>` - Size threshold for parallel processing in bytes (default: 1MB)
- `-s, --split-by-tokens` - Split large files by token count for LLM compatibility
- `--max-tokens <number>` - Maximum tokens per file when splitting (default: 40000)
- `--chars-per-token <number>` - Characters per token ratio for estimation (default: 4)

#### Decompress a File

```bash
utcp decompress path/to/file.txt.utcp
```

Options:
- `-o, --output <filename>` - Output filename

If you don't specify an output filename, the tool will ask for your preference:
- Original filename (removing the .utcp extension)
- A decompressed variant (e.g., filename.decompressed)
- A custom filename

### Programmatic Use

You can also use the UTCP library programmatically in your Node.js applications.

#### Compress a File

```javascript
const utcp = require('utcp');

// Compress a file with advanced options
const outputPath = await utcp.compressFile('/path/to/file.txt', {
  minOccurrences: 3,
  preserveVerbatim: true,
  useParallel: true,
  parallelThreshold: 1024 * 1024, // 1MB
  splitByTokens: true,
  maxTokensPerFile: 40000,
  charsPerToken: 4
});

// If token-based splitting is enabled, outputPath may be an array of file paths
if (Array.isArray(outputPath)) {
  console.log(`Compressed files saved to: ${outputPath.join(', ')}`);
} else {
  console.log(`Compressed file saved to: ${outputPath}`);
}
```

#### Decompress a File

```javascript
const utcp = require('utcp');

// Decompress a file
const outputPath = utcp.decompressFile('/path/to/file.txt.utcp', {
  outputFilename: '/path/to/output.txt'
});

console.log(`Decompressed file saved to: ${outputPath}`);
```

#### String Compression/Decompression

```javascript
const utcp = require('utcp');

// Compress a string with advanced options
const content = 'Your text content here...';
const result = await utcp.compressString(content, 'virtual.txt', {
  useParallel: true,
  splitByTokens: true,
  maxTokensPerFile: 40000
});

console.log(`Compressed content: ${result.compressedContent}`);
console.log(`Compression ratio: ${result.compressionRatio}`);

// Check if split files were created
if (result.splitFiles) {
  console.log(`Content was split into ${result.splitFiles.length} files due to token limits`);
}

// Decompress a string
const compressedContent = result.compressedContent;
const decompressedResult = utcp.decompressString(compressedContent, 'virtual.txt.utcp');

console.log(`Decompressed content: ${decompressedResult.originalContent}`);
console.log(`Verified: ${decompressedResult.verified}`);
```

## The UTCP Format

The Universal Text Compression Protocol uses several techniques to compress text:

1. **Metadata Header**: Contains information about the original file.
2. **Global Dictionary**: Assigns short codes to common terms.
3. **Domain-Specific Dictionaries**: Special dictionaries for code, markup, etc.
4. **Structure References**: Identifies repeated structures and references them by ID.
5. **Structural Compression**: Uses shorthand for indentation and repetition.
6. **Verification**: Includes checksums to verify integrity.
7. **Format Description**: Self-documenting instructions for decompression.
8. **Intelligent Fallback**: Preserves original content when compression is ineffective.
9. **Parallel Processing**: Uses multiple CPU cores to accelerate compression of large files.
10. **File Splitting**: Automatically divides large compressed content into multiple files based on token limits.

### Split File Format

When a file is split due to token limits, UTCP creates:

1. **Index File**: Contains metadata about all parts and their relationships (filename.utcp)
2. **Part Files**: Contains chunks of the compressed content (filename.part1.utcp, filename.part2.utcp, etc.)

The decompression process automatically detects split files and recombines them before decompression.

A typical UTCP file looks like:

```
<UTCP-v1>
<FORMAT-DESCRIPTION>
This file is compressed using the Universal Text Compression Protocol (UTCP).
UTCP is optimized for text files, especially code and structured text.
Format organization:
1. Metadata section: Contains file information (type, size, etc.)
2. Dictionary sections: Define code replacements for common terms
   - Global dictionary applies to all content
   - Domain dictionaries are specific to file types
3. Reference sections: Define replacements for repeated structures
4. Compressed content: The main content with applied replacements
5. Footer: Contains verification checksums
</FORMAT-DESCRIPTION>

<META:type="js">
<META:checksum="a1b2c3d4e5f6...">
<META:size="12345">
<META:lines="100">
<META:date="2025-01-01T12:00:00Z">

<DICT:global>
$G1=function
$G2=return
</DICT:global>

<DICT:code>
$C1=class
$C2=interface
</DICT:code>

<REF:R1>
{ "status": "success", "code": 200 }
</REF:R1>

<CONTENT>
// Compressed content here...
</CONTENT>

<EOF:checksum="f6e5d4c3b2a1...">
</UTCP-v1>
```

## License

ISC