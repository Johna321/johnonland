// Remark plugin to convert Obsidian embeds to standard markdown
// Handles: ![[image.png]] -> ![](/assets/notes/image.png)
// Handles: [text](./file.pdf) -> [text](/assets/notes/file.pdf)

import { visit } from 'unist-util-visit';

export default function remarkObsidianEmbeds() {
  return (tree) => {
    // Handle text nodes containing ![[...]] embeds
    visit(tree, 'paragraph', (node) => {
      if (!node.children) return;

      const newChildren = [];
      for (const child of node.children) {
        if (child.type === 'text' && child.value.includes('![[')) {
          // Split text by embed patterns
          const parts = child.value.split(/(!?\[\[[^\]]+\]\])/g);
          for (const part of parts) {
            if (!part) continue;

            // Match image embed: ![[filename.ext]]
            const embedMatch = part.match(/^!\[\[([^\]]+)\]\]$/);
            if (embedMatch) {
              const filename = embedMatch[1];
              // Check if it's an image
              if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(filename)) {
                newChildren.push({
                  type: 'image',
                  url: `/assets/notes/${encodeURIComponent(filename)}`,
                  alt: filename,
                });
              } else {
                // Non-image embed, convert to link
                newChildren.push({
                  type: 'link',
                  url: `/assets/notes/${encodeURIComponent(filename)}`,
                  children: [{ type: 'text', value: filename }],
                });
              }
            } else {
              newChildren.push({ type: 'text', value: part });
            }
          }
        } else {
          newChildren.push(child);
        }
      }
      node.children = newChildren;
    });

    // Handle relative links to PDFs and other files
    visit(tree, 'link', (node) => {
      if (node.url && node.url.startsWith('./')) {
        const filename = node.url.slice(2); // Remove ./
        node.url = `/assets/notes/${encodeURIComponent(filename)}`;
      }
    });
  };
}
