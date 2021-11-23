import React, { useState } from 'react';
import Navbar from './Navbar';
import Posts from './Posts';
import './App.scss';

const App = () => {
  const [option, setOption] = useState("Posts");

  const updateComponent = (component) => {
    setOption(component);
  }

  const mainComponent = () => {
    switch(option){
      case "Posts":
        return <Posts />;
      case "Pictures":
        return <div>pictures</div>;
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
