import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

type ContentEntry = CollectionEntry<'notes'> | CollectionEntry<'writings'> | CollectionEntry<'projects'>;

export interface ContentDetails {
  slug: string;
  filePath: string;
  title: string;
  collection: string;
}

// Apps registry - add new apps here
export const apps = [
  {
    slug: 'harmonic-pathfinder',
    title: 'Harmonic Pathfinder',
    description: 'Interactive Tonnetz visualization with MCTS chord progression generation',
  },
] as const;

export type AppEntry = typeof apps[number];

export type ContentIndex = Record<string, ContentDetails>;

export async function generateContentIndex(): Promise<ContentIndex> {
  const [notes, writings, projects] = await Promise.all([
    getCollection('notes', ({ data }) => !data.draft),
    getCollection('writings', ({ data }) => !data.draft),
    getCollection('projects', ({ data }) => !data.draft),
  ]);

  const index: ContentIndex = {};

  const processCollection = (entries: ContentEntry[], collection: string) => {
    for (const entry of entries) {
      const fullSlug = `${collection}/${entry.slug}`;
      const title = entry.data.title || entry.slug.split('/').pop()?.replace(/-/g, ' ') || 'Untitled';

      index[fullSlug] = {
        slug: fullSlug,
        filePath: `content/${collection}/${entry.id}`,
        title,
        collection,
      };
    }
  };

  processCollection(notes, 'notes');
  processCollection(writings, 'writings');
  processCollection(projects, 'projects');

  // Add apps to the index
  for (const app of apps) {
    const fullSlug = `apps/${app.slug}`;
    index[fullSlug] = {
      slug: fullSlug,
      filePath: `apps/${app.slug}`,
      title: app.title,
      collection: 'apps',
    };
  }

  return index;
}
