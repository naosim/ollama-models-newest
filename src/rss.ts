import { Feed } from 'feed';
import { OllamaModel, FeedConfig } from './types.js';

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Resolve feed configuration from environment or fallback
 */
export function resolveConfig(): FeedConfig {
  const repoEnv = process.env.GITHUB_REPOSITORY; // e.g. "owner/ollama-models-newest"
  let siteUrl = process.env.SITE_URL;

  if (!siteUrl && repoEnv) {
    const [owner, repo] = repoEnv.split('/');
    siteUrl = `https://${owner}.github.io/${repo}/`;
  }

  if (!siteUrl) {
    siteUrl = 'http://localhost:3000/';
  }

  if (!siteUrl.endsWith('/')) {
    siteUrl += '/';
  }

  const feedUrl = new URL('feed.rss', siteUrl).toString();

  return {
    siteUrl,
    feedUrl,
    title: 'Ollama Newest Models',
    description: 'Latest models published or updated on Ollama Library (sorted by newest)',
    sourceUrl: 'https://ollama.com/library?sort=newest',
  };
}

/**
 * Generate RSS 2.0 XML from models list
 */
export function generateRssFeed(
  models: OllamaModel[],
  config: FeedConfig,
  maxItems = 50
): string {
  const feed = new Feed({
    title: config.title,
    description: config.description,
    id: config.siteUrl,
    link: config.siteUrl,
    language: 'en',
    favicon: 'https://ollama.com/public/icon-32x32.png',
    copyright: `Generated from Ollama Library (https://ollama.com) - ${new Date().getFullYear()}`,
    updated: models[0]?.updatedAt || new Date(),
    generator: 'Ollama Models RSS Generator',
    feedLinks: {
      rss: config.feedUrl,
    },
    author: {
      name: 'Ollama',
      link: 'https://ollama.com',
    },
  });

  const targetModels = models.slice(0, maxItems);

  for (const model of targetModels) {
    // Plain text description for snippet views & text-based RSS readers (Slack, Feedly snippets, etc.)
    const plainLines: string[] = [];
    if (model.description) {
      plainLines.push(model.description);
    }
    const metaParts: string[] = [];
    if (model.sizes.length > 0) metaParts.push(`Sizes: ${model.sizes.join(', ')}`);
    if (model.capabilities.length > 0) metaParts.push(`Capabilities: ${model.capabilities.join(', ')}`);
    if (model.pulls) metaParts.push(`Pulls: ${model.pulls}`);
    if (model.tagsCount) metaParts.push(`Tags: ${model.tagsCount}`);
    if (model.updatedAtText) {
      metaParts.push(`Updated: ${model.updatedAtText}${model.relativeUpdated ? ` (${model.relativeUpdated})` : ''}`);
    }
    if (metaParts.length > 0) {
      plainLines.push('');
      plainLines.push(metaParts.join(' | '));
    }
    const plainDescription = plainLines.join('\n');

    // Rich HTML for full-content readers
    const metaItems: string[] = [];
    if (model.sizes.length > 0) {
      metaItems.push(`<li><strong>Sizes:</strong> ${escapeHtml(model.sizes.join(', '))}</li>`);
    }
    if (model.capabilities.length > 0) {
      metaItems.push(`<li><strong>Capabilities:</strong> ${escapeHtml(model.capabilities.join(', '))}</li>`);
    }
    if (model.pulls) {
      metaItems.push(`<li><strong>Pulls:</strong> ${escapeHtml(model.pulls)}</li>`);
    }
    if (model.tagsCount) {
      metaItems.push(`<li><strong>Tags:</strong> ${escapeHtml(model.tagsCount)}</li>`);
    }
    if (model.updatedAtText) {
      const rel = model.relativeUpdated ? ` (${escapeHtml(model.relativeUpdated)})` : '';
      metaItems.push(`<li><strong>Updated:</strong> ${escapeHtml(model.updatedAtText)}${rel}</li>`);
    }

    const htmlContent = `
<p>${escapeHtml(model.description || 'No description provided.')}</p>
${metaItems.length > 0 ? `<ul>${metaItems.join('')}</ul>` : ''}
<p><a href="${escapeHtml(model.url)}" target="_blank" rel="noopener noreferrer">View ${escapeHtml(model.name)} on Ollama Library</a></p>
`.trim();

    feed.addItem({
      title: model.name,
      id: model.url,
      link: model.url,
      description: plainDescription,
      content: htmlContent,
      date: model.updatedAt,
      published: model.updatedAt,
    });
  }

  return feed.rss2();
}
