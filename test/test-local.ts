import fs from 'node:fs';
import path from 'node:path';
import { parseOllamaModels } from '../src/scraper.js';

const samplePath = path.resolve('ollama_library_sample.html');
if (!fs.existsSync(samplePath)) {
  console.error(`Sample file not found at: ${samplePath}`);
  process.exit(1);
}

const html = fs.readFileSync(samplePath, 'utf-8');
const models = parseOllamaModels(html);

console.log(`Parsed ${models.length} models successfully!`);
console.log('Sample model [0]:', JSON.stringify(models[0], null, 2));
console.log('Sample model [1]:', JSON.stringify(models[1], null, 2));
if (models.length > 2) {
  console.log('Sample model [last]:', JSON.stringify(models[models.length - 1], null, 2));
}
