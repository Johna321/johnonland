import React from 'react';
import './Post.scss';
import post_list from './content/posts.json';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Post = ({ index }) => {
  const { title, author, date, content } = post_list[index];
  return (
    <div className="post">
      <div className="post-title">
        <h1>{title}</h1>
        <h4>{author} on {date}</h4>
      </div>
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
            h1: ({ node, children }) => {
              return (
                <h1 className="article-header">
                  {children}
                </h1>
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

export default Post;
