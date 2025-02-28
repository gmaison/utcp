#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const utcp = require('../lib/index');
const readline = require('readline');

// Create CLI interface
program
  .name('utcp')
  .description('Universal Text Compression Protocol CLI')
  .version('1.0.0');

// Compress command
program
  .command('compress')
  .description('Compress a file using UTCP')
  .argument('<file>', 'File to compress')
  .option('-m, --min-occurrences <number>', 'Minimum occurrences for dictionary terms', parseInt, 3)
  .option('-v, --preserve-verbatim', 'Preserve verbatim sections', false)
  .option('-p, --parallel', 'Use parallel processing for large files', false)
  .option('-t, --parallel-threshold <number>', 'Size threshold for parallel processing (bytes)', parseInt, 1048576)
  .option('-s, --split-by-tokens', 'Split large files by token count', false)
  .option('-max, --max-tokens <number>', 'Maximum tokens per file when splitting', parseInt, 40000)
  .option('-c, --chars-per-token <number>', 'Characters per token for estimation', parseInt, 4)
  .action(async (file, options) => {
    try {
      // Resolve absolute path
      const filePath = path.resolve(file);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(chalk.red(`Error: File not found: ${filePath}`));
        process.exit(1);
      }
      
      const fileSize = fs.statSync(filePath).size;
      console.log(chalk.blue(`Compressing file: ${filePath} (${fileSize} bytes)`));
      
      if (options.parallel && fileSize >= options.parallelThreshold) {
        console.log(chalk.blue(`Using parallel processing (threshold: ${options.parallelThreshold} bytes)`));
      }
      
      if (options.splitByTokens) {
        const maxTokens = parseInt(options.maxTokens, 10) || 40000;
        const charsPerToken = parseInt(options.charsPerToken, 10) || 4;
        console.log(chalk.blue(`Token-based splitting enabled (max ${maxTokens} tokens per file, ${charsPerToken} chars/token)`));
        const estimatedTokens = Math.ceil(fileSize / charsPerToken);
        console.log(chalk.blue(`Estimated tokens in file: ${estimatedTokens}`));
      }
      
      // Compress the file
      const outputPath = await utcp.compressFile(filePath, {
        minOccurrences: options.minOccurrences,
        preserveVerbatim: options.preserveVerbatim,
        useParallel: options.parallel,
        parallelThreshold: options.parallelThreshold,
        splitByTokens: options.splitByTokens,
        maxTokensPerFile: parseInt(options.maxTokens, 10) || 40000,
        charsPerToken: parseInt(options.charsPerToken, 10) || 4
      });
      
      console.log(chalk.green(`Compression successful!`));
      
      // Handle output paths (can be array if split by tokens)
      if (Array.isArray(outputPath)) {
        console.log(chalk.green(`Output split into ${outputPath.length} files:`));
        console.log(chalk.green(`Index file: ${outputPath[0]}`));
        console.log(chalk.green(`${outputPath.length - 1} part files created`));
        
        // Calculate total size of all output files
        let totalOutputSize = 0;
        for (const file of outputPath) {
          totalOutputSize += fs.statSync(file).size;
        }
        
        // Calculate compression ratio
        const inputStats = fs.statSync(filePath);
        const ratio = (inputStats.size / totalOutputSize).toFixed(2);
        
        console.log(chalk.yellow(`Original size: ${inputStats.size} bytes`));
        console.log(chalk.yellow(`Total compressed size: ${totalOutputSize} bytes (across ${outputPath.length} files)`));
        console.log(chalk.yellow(`Compression ratio: ${ratio}x`));
      } else {
        // Single file output
        console.log(chalk.green(`Output file: ${outputPath}`));
        
        // Calculate compression ratio
        const inputStats = fs.statSync(filePath);
        const outputStats = fs.statSync(outputPath);
        const ratio = (inputStats.size / outputStats.size).toFixed(2);
        
        console.log(chalk.yellow(`Original size: ${inputStats.size} bytes`));
        console.log(chalk.yellow(`Compressed size: ${outputStats.size} bytes`));
        console.log(chalk.yellow(`Compression ratio: ${ratio}x`));
      }
    } catch (error) {
      console.error(chalk.red(`Compression failed: ${error.message}`));
      process.exit(1);
    }
  });

// Decompress command
program
  .command('decompress')
  .description('Decompress a UTCP file')
  .argument('<file>', 'UTCP file to decompress')
  .option('-o, --output <filename>', 'Output filename')
  .action(async (file, options) => {
    try {
      // Resolve absolute path
      const filePath = path.resolve(file);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(chalk.red(`Error: File not found: ${filePath}`));
        process.exit(1);
      }
      
      console.log(chalk.blue(`Decompressing file: ${filePath}`));
      
      let outputFilename = options.output;
      
      // If no output filename specified, ask user for preference
      if (!outputFilename) {
        // Determine suggested output filename
        const suggestedFilename = file.endsWith('.utcp') 
          ? file.slice(0, -5) 
          : `${file}.decompressed`;
          
        // Create readline interface
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        // Ask user for output filename preference
        console.log(chalk.yellow('Please choose an output filename:'));
        console.log(chalk.yellow(`a) Original filename: ${suggestedFilename} (recommended)`));
        console.log(chalk.yellow(`b) Decompressed variant: ${file}.decompressed`));
        console.log(chalk.yellow('c) Custom filename'));
        
        // Get user choice
        const choice = await new Promise(resolve => {
          rl.question(chalk.blue('Enter your choice (a/b/c): '), answer => {
            resolve(answer.trim().toLowerCase());
            rl.close();
          });
        });
        
        // Process user choice
        if (choice === 'a') {
          outputFilename = suggestedFilename;
        } else if (choice === 'b') {
          outputFilename = `${file}.decompressed`;
        } else if (choice === 'c') {
          // Get custom filename
          const customFilename = await new Promise(resolve => {
            const rl2 = readline.createInterface({
              input: process.stdin,
              output: process.stdout
            });
            rl2.question(chalk.blue('Enter custom filename: '), answer => {
              resolve(answer.trim());
              rl2.close();
            });
          });
          
          outputFilename = customFilename;
        } else {
          // Default to suggested filename
          outputFilename = suggestedFilename;
        }
      }
      
      // Decompress the file
      const decompressedFile = utcp.decompressFile(filePath, {
        outputFilename,
      });
      
      console.log(chalk.green(`Decompression successful!`));
      console.log(chalk.green(`Output file: ${decompressedFile}`));
    } catch (error) {
      console.error(chalk.red(`Decompression failed: ${error.message}`));
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);