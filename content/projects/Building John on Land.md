---
title: Building John on Land
---
In the past few years I've tried various different methods of organizing my work and thoughts. Bullet journals, e-ink tablets hooked up to cloud storage, &c. The motivating method for this project was [Zettelkasten](https://en.wikipedia.org/wiki/Zettelkasten), which has seeped into the world's conception of knowledge management via the hypertextual behemoth [Wikipedia](https://en.wikipedia.org/wiki/Main_Page). 

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Zettelkasten_%28514941699%29.jpg/2880px-Zettelkasten_%28514941699%29.jpg" width="500" />

## Criteria of the ideal personal knowledge system
1. Standardized syntax and format in entries
2. Support for links, backlinks, graph connections
3. Extensibility for non-text features (i.e. videos, equations, images)
4. Easily exportable to web
5. Freedom in design

[vimwiki](https://github.com/vimwiki/vimwiki) got the closest to this. It encouraged wiki-style webs of links, supported Markdown syntax, exported to HTML, and (most importantly) integrated well into my laptop's environment; but on a terminal display I'm not free to inject $\LaTeX$ renderings or pretty much anything that isn't enriched UTF-8 text. I shall be free. 

## Building with Quartz
[Quartz](https://quartz.jzhao.xyz/) is a static site generator that has checked the highest number of these boxes thus far, mainly because its designed to work with the [Obsidian](https://obsidian.md/) markdown system. A simple deploy script makes the process of publishing writing from my local machine almost instant. 

But this setup is not without its caveats, both practical and conceptual. Making more bespoke or reactive UI changes can require working around some of Quartz's built-in architecture. Exploring new design ideas has some intrinsic inertia involved with bending Quartz's layout to the will of a new idea.

In general, Quartz was designed to remove the friction between writing and publishing which, as I have realized a few months down the line, places the emphasis on writing new content, rather than toying around with implementations and optimizations. As someone who is more comfortable wasting time on random technical projects than longer-form writing projects, I've found some conceptual inertia too.

 




