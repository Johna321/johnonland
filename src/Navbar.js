import React, { useState, useEffect } from 'react';
import './Navbar.scss';

const Navbar = ({ updateComponent }) => {
  const [subtitle, setSubtitle] = useState('');

  useEffect(() => {
    const getSubtitle = async() => {
      const res = await fetch("https://random-word-api.herokuapp.com/word?number=2").then(data => data.json());
      let subline;
      if (res[0].endsWith("s") && res[1].endsWith("s")){
        subline = res[0] + " and " + res[1];
      }
      else {
        subline = res[0] + " " + res[1];
      }
      setSubtitle(subline);
    }
    getSubtitle();
  }, []);

  /*const subtitles = [
    "blogosphere",
    "meniscus",
    "mingrelian architecture",
    "YouTube"
  ]*/

  return(
    <div className="Navbar">
      <div className="title">
        <b>john on land</b>
        <div className="subtitle">
          {/*<i>{subtitles[Math.floor(Math.random() * subtitles.length)]}</i>*/}
          <i>{subtitle}</i>
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
