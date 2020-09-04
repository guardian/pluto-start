import React from "react";
import { Link } from "react-router-dom";

class LogOutComponent extends React.Component {
  render() {
    return (
      <div>
        <h1>Logging out</h1>
        <Link to="/">Home</Link>
      </div>
    );
  }
}

export default LogOutComponent;
