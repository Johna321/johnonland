import React from 'react';
//import SideExplorer from './SideExplorer';
import './Posts.scss';
import post_list from './content/posts.json';
//import Markdown from 'react-markdown';

const Posts = () => {
  const loadPosts = () => {
    /*const posts = post_list.map((post, index) => {
      return(
        <div className="post-listing" key={index}>
          <div className="post-listing-header">
            <div>{post.title}</div>
            <div>
              <div>{post.author}</div>
              <div>{post.date}</div>
            </div>
          </div>
        </div>
      );
    });*/
    const posts = post_list.map((post, index) => {
      return (
        <li key={index}><a href="#">{post.title}</a></li>
      );
    })
    return <ul>{posts}</ul>;
  }
  return(
    <div className="Posts">
      <div className="main-container">
        <div className="introduction">
          welcome to the <b>john on land</b> blog <br />
          a blog dedicated to remaining on land, no matter the cost
        </div>
        <div>{loadPosts()}</div>
      </div>
    </div>
  );
}

export default Posts;
