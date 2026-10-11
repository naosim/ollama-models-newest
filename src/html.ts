import { OllamaModel, FeedConfig } from './types.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate a modern, elegant preview HTML page for GitHub Pages root (index.html)
 */
export function generatePreviewHtml(
  models: OllamaModel[],
  config: FeedConfig,
  lastUpdated: Date = new Date()
): string {
  const formattedGeneratedAt = lastUpdated.toUTCString();

  const modelCardsHtml = models
    .map((m) => {
      const capsHtml = m.capabilities
        .map(
          (c) =>
            `<span class="badge badge-cap">${escapeHtml(c)}</span>`
        )
        .join('');

      const sizesHtml = m.sizes
        .map(
          (s) =>
            `<span class="badge badge-size">${escapeHtml(s)}</span>`
        )
        .join('');

      return `
      <article class="model-card" data-name="${escapeHtml(m.name.toLowerCase())}" data-desc="${escapeHtml(
        m.description.toLowerCase()
      )}" data-tags="${escapeHtml([...m.capabilities, ...m.sizes].join(' ').toLowerCase())}">
        <header class="card-header">
          <div class="title-row">
            <h2 class="model-title">
              <a href="${escapeHtml(m.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(m.name)}</a>
            </h2>
            <a href="${escapeHtml(m.url)}" target="_blank" rel="noopener noreferrer" class="link-icon" title="View on Ollama">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>
          <p class="model-desc">${escapeHtml(m.description || 'No description provided.')}</p>
        </header>

        <div class="badges-row">
          ${capsHtml}
          ${sizesHtml}
        </div>

        <footer class="card-meta">
          <div class="stats-group">
            ${m.pulls ? `<span class="stat-item" title="Pulls"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>${escapeHtml(m.pulls)}</span>` : ''}
            ${m.tagsCount ? `<span class="stat-item" title="Tags"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>${escapeHtml(m.tagsCount)}</span>` : ''}
          </div>
          <div class="date-item" title="${escapeHtml(m.updatedAtText || '')}">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>${escapeHtml(m.relativeUpdated || m.updatedAtText || 'Recently')}</span>
          </div>
        </footer>
      </article>
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(config.title)} - RSS Feed & Live Preview</title>
  <meta name="description" content="RSS 2.0 Feed for the newest Ollama models. Automatically updated twice a day via GitHub Actions.">
  <link rel="alternate" type="application/rss+xml" title="${escapeHtml(config.title)}" href="./feed.rss">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(23, 29, 45, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --card-hover: rgba(30, 41, 59, 0.9);
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.2);
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --badge-cap-bg: rgba(99, 102, 241, 0.15);
      --badge-cap-text: #a5b4fc;
      --badge-size-bg: rgba(14, 165, 233, 0.15);
      --badge-size-text: #7dd3fc;
      --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      background-image: 
        radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.12) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.1) 0px, transparent 50%);
      background-attachment: fixed;
      color: var(--text-main);
      font-family: var(--font-sans);
      min-height: 100vh;
      line-height: 1.5;
      padding: 2.5rem 1.25rem;
    }

    .container {
      max-width: 1024px;
      margin: 0 auto;
    }

    /* Header */
    header.hero {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.25);
      color: var(--accent);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .hero-title {
      font-size: clamp(2rem, 4vw, 2.75rem);
      font-weight: 700;
      letter-spacing: -0.025em;
      background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.75rem;
    }

    .hero-subtitle {
      color: var(--text-muted);
      font-size: 1.05rem;
      max-width: 600px;
      margin: 0 auto 1.75rem;
    }

    /* Actions Panel */
    .rss-banner {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      backdrop-filter: blur(12px);
      border-radius: 1rem;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      margin-bottom: 2rem;
    }

    .rss-url-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.6rem 1rem;
      border-radius: 0.6rem;
      font-family: var(--font-mono);
      font-size: 0.875rem;
      color: #38bdf8;
      overflow-x: auto;
      max-width: 100%;
      flex: 1;
    }

    .btn-group {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-sans);
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.6rem 1.15rem;
      border-radius: 0.6rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      border: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: #ffffff;
      box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.35);
    }

    .btn-primary:hover {
      opacity: 0.95;
      transform: translateY(-1px);
      box-shadow: 0 6px 18px 0 rgba(37, 99, 235, 0.45);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-main);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.14);
      transform: translateY(-1px);
    }

    /* Filter / Search */
    .filter-bar {
      margin-bottom: 1.5rem;
      position: relative;
    }

    .search-input {
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      backdrop-filter: blur(8px);
      border-radius: 0.75rem;
      padding: 0.85rem 1.25rem 0.85rem 2.85rem;
      color: var(--text-main);
      font-family: var(--font-sans);
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
    }

    /* Model Grid */
    .models-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 1.25rem;
    }

    .model-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      backdrop-filter: blur(10px);
      border-radius: 0.85rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .model-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.18);
      box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.4);
    }

    .card-header {
      margin-bottom: 0.75rem;
    }

    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.4rem;
    }

    .model-title {
      font-size: 1.15rem;
      font-weight: 700;
    }

    .model-title a {
      color: #ffffff;
      text-decoration: none;
      transition: color 0.15s;
    }

    .model-title a:hover {
      color: var(--accent);
    }

    .link-icon {
      color: var(--text-muted);
      display: inline-flex;
      transition: color 0.15s;
    }

    .link-icon:hover {
      color: var(--text-main);
    }

    .model-desc {
      color: var(--text-muted);
      font-size: 0.875rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .badges-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin: 0.75rem 0 1rem;
    }

    .badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 0.4rem;
      letter-spacing: 0.02em;
    }

    .badge-cap {
      background: var(--badge-cap-bg);
      color: var(--badge-cap-text);
      border: 1px solid rgba(99, 102, 241, 0.25);
    }

    .badge-size {
      background: var(--badge-size-bg);
      color: var(--badge-size-text);
      border: 1px solid rgba(14, 165, 233, 0.25);
    }

    .card-meta {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.775rem;
      color: var(--text-muted);
    }

    .stats-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .stat-item, .date-item {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    .icon {
      width: 14px;
      height: 14px;
      stroke-width: 2;
    }

    /* Footer */
    footer.site-footer {
      text-align: center;
      margin-top: 3.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      color: var(--text-muted);
      font-size: 0.825rem;
    }

    footer.site-footer a {
      color: var(--text-main);
      text-decoration: none;
    }

    footer.site-footer a:hover {
      text-decoration: underline;
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #0284c7;
      color: white;
      padding: 0.65rem 1.25rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
      font-size: 0.875rem;
      font-weight: 500;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.25s ease;
      pointer-events: none;
      z-index: 100;
    }

    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="hero">
      <div class="hero-pill">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>Updated twice daily (JST 06:00 / 18:00)</span>
      </div>
      <h1 class="hero-title">Ollama Newest Models RSS</h1>
      <p class="hero-subtitle">Subscribe to the latest AI models published or updated on the Ollama Library.</p>
    </header>

    <section class="rss-banner">
      <div class="rss-url-box" id="rssUrlDisplay">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
        <span id="rssUrlText">${escapeHtml(config.feedUrl)}</span>
      </div>
      <div class="btn-group">
        <button id="copyBtn" class="btn btn-primary" onclick="copyFeedUrl()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>Copy Feed URL</span>
        </button>
        <a href="./feed.rss" class="btn btn-secondary" target="_blank">
          <span>Open RSS XML</span>
        </a>
      </div>
    </section>

    <div class="filter-bar">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" id="searchInput" class="search-input" placeholder="Search models by name, description, tags, size..." oninput="filterModels()">
    </div>

    <main class="models-grid" id="modelsGrid">
      ${modelCardsHtml}
    </main>

    <footer class="site-footer">
      <p>Source: <a href="${escapeHtml(config.sourceUrl)}" target="_blank" rel="noopener noreferrer">Ollama Library</a> &bull; Generated: ${formattedGeneratedAt}</p>
    </footer>
  </div>

  <div id="toast" class="toast">Feed URL copied to clipboard!</div>

  <script>
    function copyFeedUrl() {
      const url = new URL('./feed.rss', window.location.href).href;
      navigator.clipboard.writeText(url).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
      });
    }

    function filterModels() {
      const query = document.getElementById('searchInput').value.toLowerCase().trim();
      const cards = document.querySelectorAll('.model-card');
      cards.forEach(card => {
        const name = card.getAttribute('data-name') || '';
        const desc = card.getAttribute('data-desc') || '';
        const tags = card.getAttribute('data-tags') || '';
        if (name.includes(query) || desc.includes(query) || tags.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }

    // Set absolute URL in display box based on current browser location
    window.addEventListener('DOMContentLoaded', () => {
      const display = document.getElementById('rssUrlText');
      if (display) {
        display.textContent = new URL('./feed.rss', window.location.href).href;
      }
    });
  </script>
</body>
</html>
`.trim();
}
