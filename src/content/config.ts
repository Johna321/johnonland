import { defineCollection, z } from 'astro:content';

// Flexible schema that handles Obsidian-style frontmatter
const contentSchema = z.object({
  title: z.string().optional(),
  date: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().optional().default(false),
  hide_metadata: z.boolean().optional().default(false),
  hide_title: z.boolean().optional().default(false),
  aliases: z.array(z.string()).optional(),
}).passthrough(); // Allow additional frontmatter fields

const notes = defineCollection({
  type: 'content',
  schema: contentSchema,
});

const writings = defineCollection({
  type: 'content',
  schema: contentSchema,
});

const projects = defineCollection({
  type: 'content',
  schema: contentSchema,
});

export const collections = { notes, writings, projects };
