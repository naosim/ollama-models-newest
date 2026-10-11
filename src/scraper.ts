import * as cheerio from 'cheerio';
import { OllamaModel } from './types.js';

const OLLAMA_BASE_URL = 'https://ollama.com';
export const OLLAMA_NEWEST_URL = 'https://ollama.com/library?sort=newest';

/**
 * Fetch HTML from Ollama library newest page
 */
export async function fetchOllamaLibraryHtml(url: string = OLLAMA_NEWEST_URL): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Ollama library: ${response.status} ${response.statusText}`);
  }

  return await response.text();
}

/**
 * Parse Ollama models from HTML
 */
export function parseOllamaModels(html: string): OllamaModel[] {
  const $ = cheerio.load(html);
  const models: OllamaModel[] = [];

  // Match list items in the models list (#repo ul[role="list"] > li or any li containing a model link)
  const items = $('#repo ul[role="list"] > li, main ul[role="list"] > li, li:has(a[href^="/library/"])');

  items.each((_, el) => {
    const $item = $(el);
    const $link = $item.find('a[href^="/library/"]').first();
    if ($link.length === 0) return;

    const href = $link.attr('href') || '';
    const fullUrl = href.startsWith('http') ? href : new URL(href, OLLAMA_BASE_URL).toString();

    // Model name
    const rawName =
      $item.find('h2 span.truncate').first().text().trim() ||
      $item.find('div[title]').first().attr('title')?.trim() ||
      href.replace('/library/', '');

    if (!rawName) return;

    // Description (normalize multiple whitespace and newlines)
    const rawDescription = $item.find('p.max-w-lg').first().text();
    const description = rawDescription.replace(/\s+/g, ' ').trim();

    // Badges (capabilities & parameter sizes)
    const capabilities: string[] = [];
    const sizes: string[] = [];

    // All badge spans inside .flex-wrap
    $item.find('.flex.flex-wrap span').each((__, badgeEl) => {
      const text = $(badgeEl).text().trim();
      if (!text) return;

      // Parameter sizes usually look like "40b", "270m", "9b", "0.8b"
      const isSize = /^(\d+(\.\d+)?[bBmMkK])$/.test(text) || $(badgeEl).hasClass('bg-[#ddf4ff]');
      if (isSize) {
        if (!sizes.includes(text)) sizes.push(text);
      } else {
        if (!capabilities.includes(text)) capabilities.push(text);
      }
    });

    // Pulls and Tags stats
    let pulls = '';
    let tagsCount = '';

    // Search stats inside bottom info paragraph
    const statsP = $item.find('p.text-neutral-500, p.text-\\[13px\\]');
    statsP.find('span.flex.items-center').each((__, statEl) => {
      const text = $(statEl).text().replace(/\s+/g, ' ').trim();
      if (/pulls?/i.test(text)) {
        pulls = text;
      } else if (/tags?/i.test(text)) {
        tagsCount = text;
      }
    });

    // Fallback if regex didn't catch separate spans
    if (!pulls) {
      const pullsMatch = statsP.text().match(/([\d.,]+[KkMm]?)\s*Pulls?/i);
      if (pullsMatch) pulls = `${pullsMatch[1]} Pulls`;
    }
    if (!tagsCount) {
      const tagsMatch = statsP.text().match(/(\d+)\s*Tags?/i);
      if (tagsMatch) tagsCount = `${tagsMatch[1]} Tags`;
    }

    // Updated date
    const $updatedSpan = $item.find('span[title]').first();
    const updatedAtText = $updatedSpan.attr('title')?.trim() || '';
    const relativeUpdated = $updatedSpan.find('span:not(.hidden)').last().text().trim() || $updatedSpan.text().trim();

    let updatedAt = new Date();
    if (updatedAtText) {
      const parsed = new Date(updatedAtText);
      if (!isNaN(parsed.getTime())) {
        updatedAt = parsed;
      }
    }

    models.push({
      name: rawName,
      url: fullUrl,
      description,
      capabilities,
      sizes,
      pulls,
      tagsCount,
      updatedAt,
      updatedAtText,
      relativeUpdated,
    });
  });

  return models;
}
