import React from 'react';
import SideExplorer from './SideExplorer';
import './Posts.scss';
import post_list from './content/posts.json';

const Posts = () => {
  const loadPosts = () => {
    const posts = post_list.map((post, index) => {
      return(
        <div key={index}>
          <h2>{post.title}</h2>
          <h4>{post.author}</h4>
          <h4>{post.date}</h4>
          <p style={{marginBottom: '50px'}}>
            {post.content}
          </p>
          <div style={{height: '5px', width: '100%', backgroundColor: 'green'}} />
        </div>
      );
    });
    return <div>{posts}</div>;
  }
  return(
    <div className="Posts">
      <SideExplorer />
      {loadPosts()} 
    </div>
  );
}

export default Posts;
