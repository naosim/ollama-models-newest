export interface OllamaModel {
  name: string;
  url: string;
  description: string;
  capabilities: string[];
  sizes: string[];
  pulls: string;
  tagsCount: string;
  updatedAt: Date;
  updatedAtText: string;
  relativeUpdated: string;
}

export interface FeedConfig {
  siteUrl: string;
  feedUrl: string;
  title: string;
  description: string;
  sourceUrl: string;
}
