# Universal Text Compression Protocol (UTCP)

## Compression Instructions

When asked to compress a text file using UTCP, follow these steps:

0. **Output Filename Formatting**:
   - The compressed file MUST be named `{original_filename}.utcp`
   - For example, if compressing `knowledge.md`, the output should be `knowledge.md.utcp`
   - Always preserve the original file extension in the output name

1. **Generate Metadata Header**:
   ```
   <UTCP-v1>
   <META:type="{file_type}">
   <META:checksum="{original_file_md5}">
   <META:size="{original_byte_count}">
   <META:lines="{original_line_count}">
   <META:date="{timestamp}">
   ```

2. **Build Global Dictionary**:
   - Identify common terms appearing ≥3 times
   - Assign short codes (`$G1`, `$G2`, etc.)
   - Document in header:
   ```
   <DICT:global>
   $G1=function
   $G2=return
   $G3=document
   </DICT:global>
   ```

3. **Build Domain-Specific Dictionaries**:
   - Create separate dictionaries for different content domains
   ```
   <DICT:code>
   $C1=class
   $C2=interface
   </DICT:code>
   
   <DICT:markup>
   $M1=header
   $M2=paragraph
   </DICT:markup>
   ```

4. **Create Structure References**:
   - For repeated structures, define once with ID
   ```
   <REF:R1>
   { "status": "success", "code": 200 }
   </REF:R1>
   ```

5. **Apply Compression Rules**:
   - Replace dictionary terms with their codes
   - Replace repeated structures with references (`$REF:R1`)
   - Use structure shorthand:
     - `>>` = indent increase
     - `<<` = indent decrease
     - `$L3` = repeat line pattern 3 times
   - Mark verbatim sections: `<VERB>exact content</VERB>`

6. **Preserve Critical Syntax**:
   - Maintain all programming language keywords
   - Keep all variable/function names
   - Preserve delimiters and operators
   - Retain whitespace that affects code execution

7. **Process The Entire File**:
   - IMPORTANT: Always process the ENTIRE file content, not just portions of it
   - Never skip or omit sections of the original file
   - Ensure that when decompressed, the file should match the original file in content

8. **End File with Verification**:
   ```
   <EOF:checksum="{compressed_checksum}">
   </UTCP-v1>
   ```

## Decompression Instructions

When asked to decompress a UTCP file, follow these steps:

0. **Input and Output File Naming**:
   - Input file should have the format `{original_filename}.utcp`
   - Ask the user whether to:
     a) Use the original filename (by removing the `.utcp` extension)
     b) Use a new filename you suggest (e.g., `{original_filename}.decompressed` or `{original_filename}.uncompressed`)
     c) Use a completely different filename of their choice
   - Default suggestion should be the original filename (option a)
   - For example, if decompressing `knowledge.md.utcp`, suggest options:
     a) `knowledge.md` (original)
     b) `knowledge.md.decompressed` or `knowledge.uncompressed.md`
     c) Custom name (ask user to specify)

1. **Validate Header**:
   - Verify UTCP version
   - Check compressed file integrity via checksum
   - Verify size and line count in metadata to ensure the entire file was compressed

2. **Process Dictionaries**:
   - Load all dictionary sections into memory
   - Create expansion maps for each domain

3. **Process References**:
   - Store all reference blocks for later expansion

4. **Decompression Process**:
   - Expand dictionary codes back to full terms
   - Replace reference markers with their full content
   - Restore structure based on markers:
     - Convert `>>` to proper indentation
     - Expand repetition markers
   - Preserve verbatim sections as-is

5. **Ensure Complete File Recovery**:
   - The decompressed file must contain the ENTIRE content of the original file
   - If there's a mismatch between the decompressed file size and the original size in metadata, warn the user
   - If sections appear to be missing, inform the user that the compression may have been incomplete

6. **Verification**:
   - Calculate checksum of decompressed content
   - Verify against original checksum
   - Confirm line count matches metadata

7. **Output Format**:
   - Maintain original file formatting
   - Restore all whitespace semantics
   - Ensure syntax correctness for code

## Example Prompt Responses

### Compression Prompt
"I will compress this file using the Universal Text Compression Protocol (UTCP). This maintains all information in a retrievable format while reducing token count. I'll create:

1. A metadata header with file information
2. Domain-specific dictionaries for common terms
3. Reference blocks for repeated structures
4. Compressed content using dictionary codes and structure markers

The compressed version will be saved as `{filename}.utcp` and will contain all original information in a format that can be deterministically decompressed back to the original without loss."

### Decompression Prompt
"I'll decompress this UTCP file for you. Before proceeding, please let me know your preference for the output filename:

a) Use the original filename: `{original_filename}` (recommended)
b) Use a variation like `{original_filename}.decompressed`
c) Specify a completely different filename

Once you confirm your choice, I'll:
1. Extract and validate the metadata header
2. Process all dictionaries and reference blocks
3. Expand all compressed elements
4. Verify data integrity with the embedded checksums
5. Save the decompressed content to your chosen filename"