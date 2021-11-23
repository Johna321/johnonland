import React from 'react';
import './Navbar.scss';

const Navbar = ({ updateComponent }) => {
  const subtitles = [
    "blogosphere",
    "meniscus",
    "mingrelian architecture",
    "YouTube"
  ]

  return(
    <div className="Navbar">
      <div className="title">
        <b>john on land</b>
        <div className="subtitle">
          <i>{subtitles[Math.floor(Math.random() * subtitles.length)]}</i>
        </div>
      </div>
      <div className="navs">
        <button 
          className="nav-button"
          onClick={() => updateComponent("Posts")}
        >posts</button>
        <button 
          className="nav-button"
          onClick={() => updateComponent("Pictures")}
        >pictures</button>
      </div> 
    </div>
  );
}

export default Navbar;
