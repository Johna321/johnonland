---
title: Building John on Land
---
In the past few years I've tried various different methods of organizing my work and thoughts. Bullet journals, e-ink tablets hooked up to cloud storage, &c. The motivating method for this project was [Zettelkasten](https://en.wikipedia.org/wiki/Zettelkasten), which has likely seeped into the world's conception of knowledge management via the hypertextual behemoth [Wikipedia](https://en.wikipedia.org/wiki/Main_Page). 

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Zettelkasten_%28514941699%29.jpg/2880px-Zettelkasten_%28514941699%29.jpg" width="500" />

## Criteria of the ideal personal knowledge system
1. Standardized syntax and format in entries
2. Support for links, backlinks, graph connections
3. Extensibility for non-text features (i.e. videos, equations, images)
4. Easily exportable to web
5. Freedom in design

[vimwiki](https://github.com/vimwiki/vimwiki) was got the closest to this. It encouraged wiki-style webs of links, supported Markdown syntax, exported to HTML, and (most importantly) integrated well into my laptop's environment; but on a terminal display I'm not free to inject $\LaTeX$ renderings or pretty much anything that isn't enriched UTF-8 text. I shall be free. 

## Building with Quartz
[Quartz](https://quartz.jzhao.xyz/) is a static site generator that has checked all these boxes thus far, mainly because its compatible with the Obsidian markdown system.
