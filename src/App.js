import React, { useState } from 'react';
import Navbar from './Navbar';
import Posts from './Posts';
import Post from './Post';
import './App.scss';

const App = () => {
  const [option, setOption] = useState("Posts");
  const [index, setIndex] = useState();

  const updateComponent = (component) => {
    setOption(component);
  }

  const mainComponent = () => {
    switch(option){
      case "Posts":
        return <Posts updateComponent={updateComponent} setIndex={setIndex}/>;
      case "Pictures":
        return <div>pictures</div>;
      case "Post":
        return <Post index={index} />;
      default:
        return <div className="error">error in loading</div>;
    }
  }
  return (
    <div className="App">
      <Navbar updateComponent={updateComponent}/>
      {mainComponent()}
    </div>
  );
}

export default App;
