---
title: on making a blog website
author: John aitken
date: 22 November 2021
---

this is a test post

check it out

```java
public static void main(String[] args){
  System.out.println("heres some java code");
}
```

# heres the code that made this
## now how does this look
ew so i need to fix it so that all headers have the same
color

```js
const Post = ({ index }) => {
  const { title, author, date, content } = post_list[index];
  return (
    <div className="post">
      <h1 className="post-title">{title}</h1>
      <h4 className="post-title">{author} on {date}</h4>
      <div className="content-container">
        <ReactMarkdown 
          children={content}
          components={{
            p: ({ node, children }) => {
              return (
                <p className="article-body">
                  {children}
                </p>
              )
            },
            code({ className, children }) {
              const language = className.replace("language-", "");
              return (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language}
                  children={children[0]}
                /> 
              );
            }
          }}
        /> 
      </div>
    </div>
  );
}
```

