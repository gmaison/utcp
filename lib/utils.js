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
exports.calculateChecksum = calculateChecksum;
exports.getFileExtension = getFileExtension;
exports.countLines = countLines;
exports.generateMetadata = generateMetadata;
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.fileExists = fileExists;
exports.getSuggestedOutputFilename = getSuggestedOutputFilename;
exports.getDomainFromFileType = getDomainFromFileType;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
/**
 * Calculate MD5 checksum of a string
 */
function calculateChecksum(content) {
    return crypto.createHash('md5').update(content).digest('hex');
}
/**
 * Get file extension
 */
function getFileExtension(filePath) {
    return path.extname(filePath).slice(1);
}
/**
 * Count lines in a string
 */
function countLines(content) {
    return content.split('\n').length;
}
/**
 * Generate file metadata
 */
function generateMetadata(filePath, content) {
    const type = getFileExtension(filePath);
    const checksum = calculateChecksum(content);
    const size = Buffer.from(content).length;
    const lines = countLines(content);
    const date = new Date().toISOString();
    return {
        type,
        checksum,
        size,
        lines,
        date,
    };
}
/**
 * Read file content
 */
function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}
/**
 * Write content to file
 */
function writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf-8');
}
/**
 * Check if a file exists
 */
function fileExists(filePath) {
    return fs.existsSync(filePath);
}
/**
 * Get suggested output filename for decompression
 */
function getSuggestedOutputFilename(inputFile) {
    // Check if file ends with .utcp
    if (inputFile.endsWith('.utcp')) {
        return inputFile.slice(0, -5); // Remove .utcp extension
    }
    return `${inputFile}.decompressed`;
}
/**
 * Extract domain from file extension
 */
function getDomainFromFileType(fileType) {
    const codeExtensions = ['js', 'ts', 'java', 'py', 'rb', 'c', 'cpp', 'cs', 'go', 'rs', 'php'];
    const markupExtensions = ['html', 'xml', 'md', 'rst', 'adoc', 'tex', 'yaml', 'json'];
    if (codeExtensions.includes(fileType)) {
        return 'code';
    }
    else if (markupExtensions.includes(fileType)) {
        return 'markup';
    }
    return null;
}
