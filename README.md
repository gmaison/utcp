# Universal Text Compression Protocol (UTCP)

A Node.js implementation of the Universal Text Compression Protocol for compressing and decompressing text files.

## What's Special About UTCP?

1. **Domain-Specific Compression** - Optimized compression for different file types (code, markup, etc.)
2. **Structure Recognition** - Identifies and compresses repeated patterns and structures
3. **Self-Documenting Format** - Includes format descriptions and decompression instructions
4. **Intelligent Fallback** - Automatically uses original content when compression would be ineffective
5. **Metadata Preservation** - Retains file information like checksums and line counts
6. **LLM-Friendly Structure** - Dictionaries and references are useful context for language models

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

// Compress a file
const outputPath = utcp.compressFile('/path/to/file.txt', {
  minOccurrences: 3,
  preserveVerbatim: true
});

console.log(`Compressed file saved to: ${outputPath}`);
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

// Compress a string
const content = 'Your text content here...';
const result = utcp.compressString(content, 'virtual.txt');

console.log(`Compressed content: ${result.compressedContent}`);
console.log(`Compression ratio: ${result.compressionRatio}`);

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