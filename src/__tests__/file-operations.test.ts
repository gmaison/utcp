import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { 
  readFile, 
  writeFile, 
  fileExists, 
  calculateChecksum,
  countLines,
  generateMetadata,
  getSuggestedOutputFilename,
  getDomainFromFileType
} from '../utils';

describe('File Operations', () => {
  // Create a temporary directory for test files
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'utcp-tests-'));
  
  afterAll(() => {
    // Clean up temporary files after all tests
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (err) {
      console.error(`Error cleaning up temp directory: ${err}`);
    }
  });

  test('readFile should read file content correctly', () => {
    // Create a test file
    const testFilePath = path.join(tmpDir, 'read-test.txt');
    const testContent = 'This is test content for reading';
    fs.writeFileSync(testFilePath, testContent, 'utf-8');
    
    // Test readFile
    const content = readFile(testFilePath);
    expect(content).toEqual(testContent);
  });

  test('writeFile should write content to a file', () => {
    // Prepare test
    const testFilePath = path.join(tmpDir, 'write-test.txt');
    const testContent = 'This is test content for writing';
    
    // Test writeFile
    writeFile(testFilePath, testContent);
    
    // Verify file was written correctly
    const content = fs.readFileSync(testFilePath, 'utf-8');
    expect(content).toEqual(testContent);
  });

  test('fileExists should correctly detect file existence', () => {
    // Create a test file
    const existingFilePath = path.join(tmpDir, 'exists-test.txt');
    fs.writeFileSync(existingFilePath, 'test', 'utf-8');
    
    // Test non-existent file
    const nonExistentFilePath = path.join(tmpDir, 'doesnt-exist.txt');
    
    // Test fileExists
    expect(fileExists(existingFilePath)).toBe(true);
    expect(fileExists(nonExistentFilePath)).toBe(false);
  });

  test('calculateChecksum should generate consistent checksums', () => {
    const content1 = 'Test content for checksum';
    const content2 = 'Different content';
    
    // Same content should produce the same checksum
    expect(calculateChecksum(content1)).toEqual(calculateChecksum(content1));
    
    // Different content should produce different checksums
    expect(calculateChecksum(content1)).not.toEqual(calculateChecksum(content2));
  });

  test('countLines should count lines correctly', () => {
    const singleLine = 'Single line content';
    const multiLine = 'Line 1\nLine 2\nLine 3';
    
    expect(countLines(singleLine)).toEqual(1);
    expect(countLines(multiLine)).toEqual(3);
  });

  test('generateMetadata should create correct metadata', () => {
    const testFilePath = path.join(tmpDir, 'test.js');
    const testContent = 'function test() {\n  return true;\n}';
    
    const metadata = generateMetadata(testFilePath, testContent);
    
    expect(metadata.type).toEqual('js');
    expect(metadata.size).toEqual(Buffer.from(testContent).length);
    expect(metadata.lines).toEqual(3);
    expect(metadata.checksum).toEqual(calculateChecksum(testContent));
    // The date should be a valid ISO string
    expect(() => new Date(metadata.date)).not.toThrow();
  });

  test('getSuggestedOutputFilename should handle different input paths', () => {
    // With .utcp extension
    expect(getSuggestedOutputFilename('/path/to/file.txt.utcp')).toEqual('/path/to/file.txt');
    
    // Without .utcp extension
    expect(getSuggestedOutputFilename('/path/to/file.txt')).toEqual('/path/to/file.txt.decompressed');
  });

  test('getDomainFromFileType should correctly identify file domains', () => {
    // Code files
    expect(getDomainFromFileType('js')).toEqual('code');
    expect(getDomainFromFileType('ts')).toEqual('code');
    expect(getDomainFromFileType('py')).toEqual('code');
    
    // Markup files
    expect(getDomainFromFileType('html')).toEqual('markup');
    expect(getDomainFromFileType('md')).toEqual('markup');
    expect(getDomainFromFileType('json')).toEqual('markup');
    
    // Unknown file types
    expect(getDomainFromFileType('unknown')).toBeNull();
  });
});