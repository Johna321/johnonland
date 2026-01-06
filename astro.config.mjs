// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import wikiLinkPlugin from 'remark-wiki-link';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkObsidianEmbeds from './src/lib/remark-obsidian-embeds.mjs';

// Convert wiki-link page name to permalink
function pageResolver(pageName) {
  // Convert "Note Title" or "note title" to "note-title"
  const normalized = pageName
    .toLowerCase()
    .replace(/['']/g, '')  // Remove apostrophes
    .replace(/\s+/g, '-')   // Spaces to hyphens
    .replace(/[^\w-]/g, '') // Remove special chars
    .replace(/-+/g, '-');   // Collapse multiple hyphens

  return [normalized];
}

// https://astro.build/config
export default defineConfig({
  site: 'https://johnon.land',
  integrations: [mdx(), react()],
  build: {
    format: 'directory', // Creates /page/index.html for S3 compatibility
  },
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [
      remarkObsidianEmbeds,
      [wikiLinkPlugin, {
        pageResolver: pageResolver,
        hrefTemplate: (permalink) => `/notes/${permalink}/`,
      }],
      remarkMath,
    ],
    rehypePlugins: [
      rehypeKatex,
    ],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
