import React from 'react';
import css from "./appgeneric.css";
import ScalaBackendClient from "./ScalaBackendClient.jsx";
import {render} from 'react-dom';

class App extends React.Component {
    render(){
        return <div className="app-container">
            <ScalaBackendClient backendRootUrl="https://adfstest-scala.pluto-dev.gnm.int"/>
        </div>
    }
}

render(<App/>, document.getElementById("app"));