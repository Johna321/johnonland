import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

type ContentEntry = CollectionEntry<'notes'> | CollectionEntry<'writings'> | CollectionEntry<'projects'>;

export interface BacklinkInfo {
  title: string;
  slug: string;
  collection: string;
}

// Extract wikilinks from markdown content
function extractWikilinks(content: string): string[] {
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  const links: string[] = [];
  let match;

  while ((match = wikiLinkRegex.exec(content)) !== null) {
    // Normalize: remove leading slashes, convert to lowercase
    const link = match[1].trim().toLowerCase().replace(/^\/+/, '');
    links.push(link);
  }

  return links;
}

// Normalize a slug for comparison
function normalizeSlug(slug: string): string {
  return slug.toLowerCase().replace(/^\/+|\/+$/g, '').replace(/\s+/g, '-');
}

// Build a map of all backlinks across all collections
export async function buildBacklinksMap(): Promise<Map<string, BacklinkInfo[]>> {
  const backlinksMap = new Map<string, BacklinkInfo[]>();

  // Get all content from all collections
  const [notes, writings, projects] = await Promise.all([
    getCollection('notes'),
    getCollection('writings'),
    getCollection('projects'),
  ]);

  const allContent: { entry: ContentEntry; collection: string }[] = [
    ...notes.map(e => ({ entry: e, collection: 'notes' })),
    ...writings.map(e => ({ entry: e, collection: 'writings' })),
    ...projects.map(e => ({ entry: e, collection: 'projects' })),
  ];

  // Build a lookup map for slug → entry info
  const slugToInfo = new Map<string, { title: string; slug: string; collection: string }>();

  for (const { entry, collection } of allContent) {
    const normalizedSlug = normalizeSlug(entry.slug);
    const title = entry.data.title || entry.slug.split('/').pop()?.replace(/-/g, ' ') || 'Untitled';

    // Map both the full slug and just the filename
    slugToInfo.set(normalizedSlug, { title, slug: entry.slug, collection });

    // Also map just the filename for short links
    const filename = normalizedSlug.split('/').pop();
    if (filename && filename !== normalizedSlug) {
      slugToInfo.set(filename, { title, slug: entry.slug, collection });
    }
  }

  // Scan all content for wikilinks and build backlinks
  for (const { entry, collection } of allContent) {
    const links = extractWikilinks(entry.body);
    const sourceTitle = entry.data.title || entry.slug.split('/').pop()?.replace(/-/g, ' ') || 'Untitled';
    const sourceInfo: BacklinkInfo = {
      title: sourceTitle,
      slug: entry.slug,
      collection,
    };

    for (const link of links) {
      const normalizedLink = normalizeSlug(link);

      // Find the target page
      const targetInfo = slugToInfo.get(normalizedLink);
      if (targetInfo) {
        const targetKey = `${targetInfo.collection}/${targetInfo.slug}`;

        if (!backlinksMap.has(targetKey)) {
          backlinksMap.set(targetKey, []);
        }

        // Avoid duplicates
        const existing = backlinksMap.get(targetKey)!;
        if (!existing.some(b => b.slug === sourceInfo.slug && b.collection === sourceInfo.collection)) {
          existing.push(sourceInfo);
        }
      }
    }
  }

  return backlinksMap;
}

// Get backlinks for a specific page
export async function getBacklinksFor(collection: string, slug: string): Promise<BacklinkInfo[]> {
  const backlinksMap = await buildBacklinksMap();
  const key = `${collection}/${slug}`;
  return backlinksMap.get(key) || [];
}
