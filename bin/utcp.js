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
  .action((file, options) => {
    try {
      // Resolve absolute path
      const filePath = path.resolve(file);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(chalk.red(`Error: File not found: ${filePath}`));
        process.exit(1);
      }
      
      console.log(chalk.blue(`Compressing file: ${filePath}`));
      
      // Compress the file
      const outputPath = utcp.compressFile(filePath, {
        minOccurrences: options.minOccurrences,
        preserveVerbatim: options.preserveVerbatim,
      });
      
      console.log(chalk.green(`Compression successful!`));
      console.log(chalk.green(`Output file: ${outputPath}`));
      
      // Calculate compression ratio
      const inputStats = fs.statSync(filePath);
      const outputStats = fs.statSync(outputPath);
      const ratio = (inputStats.size / outputStats.size).toFixed(2);
      
      console.log(chalk.yellow(`Original size: ${inputStats.size} bytes`));
      console.log(chalk.yellow(`Compressed size: ${outputStats.size} bytes`));
      console.log(chalk.yellow(`Compression ratio: ${ratio}x`));
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