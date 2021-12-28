import React from 'react';
//import SideExplorer from './SideExplorer';
import './Posts.scss';
import post_list from './content/posts.json';
import banner from './content/johnonland.jpg';

const Posts = ({ updateComponent, setIndex }) => {
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
        <li key={index}>
          <button 
            className="post-button"
            onClick={() => {
              setIndex(index);
              updateComponent("Post");
            }}
          >
            {post.title}
          </button>
        </li>
      );
    })
    return <ul>{posts}</ul>;
  }
  return(
    <div className="Posts">
      <div className="main-container">
        <div>
          <div className="introduction">
            welcome to the <b>john on land</b> blog <br />
            a blog dedicated to remaining on land, no matter the cost 
          </div>
          <div>{loadPosts()}</div>
        </div>
        <div>
          <img className="banner-image" src={banner} alt="john on land"/>
          <i>(john, on land)</i>
        </div>
      </div>
    </div>
  );
}

export default Posts;
