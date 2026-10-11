import fs from 'node:fs';
import path from 'node:path';
import { fetchOllamaLibraryHtml, parseOllamaModels, OLLAMA_NEWEST_URL } from './scraper.js';
import { generateRssFeed, resolveConfig } from './rss.js';
import { generatePreviewHtml } from './html.js';

async function main() {
  console.log('🚀 Starting Ollama Newest Models RSS Generator...');

  const config = resolveConfig();
  console.log(`📌 Target Site URL: ${config.siteUrl}`);
  console.log(`📌 Feed URL: ${config.feedUrl}`);

  let html: string;
  const useSample = process.env.USE_LOCAL_SAMPLE === 'true' || process.argv.includes('--sample');

  if (useSample) {
    const samplePath = path.resolve('ollama_library_sample.html');
    console.log(`📂 Using local sample HTML: ${samplePath}`);
    html = fs.readFileSync(samplePath, 'utf-8');
  } else {
    try {
      console.log(`🌐 Fetching latest models from: ${OLLAMA_NEWEST_URL}`);
      html = await fetchOllamaLibraryHtml();
    } catch (err) {
      console.error('⚠️ Failed to fetch from Ollama live URL:', err);
      const fallbackSample = path.resolve('ollama_library_sample.html');
      if (fs.existsSync(fallbackSample)) {
        console.warn(`🔄 Falling back to local sample HTML: ${fallbackSample}`);
        html = fs.readFileSync(fallbackSample, 'utf-8');
      } else {
        throw err;
      }
    }
  }

  // Parse models
  const models = parseOllamaModels(html);
  console.log(`✨ Successfully parsed ${models.length} models.`);

  if (models.length === 0) {
    console.warn('⚠️ Warning: No models were found. Please check selector logic or HTML structure.');
  }

  // Generate RSS 2.0
  const rssXml = generateRssFeed(models, config, 50);

  // Generate HTML preview page
  const previewHtml = generatePreviewHtml(models, config, new Date());

  // Ensure output directory exists
  const outDir = path.resolve('dist');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Write outputs
  const feedRssPath = path.join(outDir, 'feed.rss');
  fs.writeFileSync(feedRssPath, rssXml, 'utf-8');
  console.log(`✅ Generated RSS feed: ${feedRssPath} (${Buffer.byteLength(rssXml)} bytes)`);

  // Also write feed.xml and rss.xml for maximum client compatibility
  fs.writeFileSync(path.join(outDir, 'feed.xml'), rssXml, 'utf-8');
  fs.writeFileSync(path.join(outDir, 'rss.xml'), rssXml, 'utf-8');

  // Write index.html
  const indexPath = path.join(outDir, 'index.html');
  fs.writeFileSync(indexPath, previewHtml, 'utf-8');
  console.log(`✅ Generated preview HTML: ${indexPath} (${Buffer.byteLength(previewHtml)} bytes)`);

  console.log('🎉 Generation completed successfully!');
}

main().catch((err) => {
  console.error('❌ Error during generation:', err);
  process.exit(1);
});
