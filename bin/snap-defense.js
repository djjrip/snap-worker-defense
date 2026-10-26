#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { generatePacket } = require('../src/generator');

const args = process.argv.slice(2);
let inputPath = path.join(__dirname, '../examples/sample-log.json');
let outputDir = process.cwd();

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--input' || args[i] === '-i') {
    inputPath = path.resolve(args[i + 1]);
    i++;
  } else if (args[i] === '--out' || args[i] === '-o') {
    outputDir = path.resolve(args[i + 1]);
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
snap-worker-defense — Open-Source SNAP E&T Compliance Packet Generator

Usage:
  snap-defense [options]

Options:
  -i, --input <file>   Path to JSON job contacts data (default: sample-log.json)
  -o, --out <dir>      Output directory for generated PDF and HTML (default: current dir)
  -h, --help           Show help message
    `);
    process.exit(0);
  }
}

if (!fs.existsSync(inputPath)) {
  console.error(`[ERROR] Input data file not found: ${inputPath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(inputPath, 'utf8');
const data = JSON.parse(rawData);

console.log(`Generating SNAP E&T Compliance Packet for ${data.participant.name}...`);
generatePacket(data, outputDir)
  .then(({ htmlPath, pdfPath }) => {
    console.log(`[SUCCESS] HTML generated: ${htmlPath}`);
    console.log(`[SUCCESS] PDF compiled:  ${pdfPath}`);
  })
  .catch((err) => {
    console.error(`[ERROR] Failed to generate packet:`, err);
    process.exit(1);
  });
