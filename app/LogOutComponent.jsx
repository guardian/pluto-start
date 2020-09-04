import React from "react";
import { Link } from "react-router-dom";
require("./app.css");

class LogOutComponent extends React.Component {
  render() {
    return (
      <div className="logout">
        <h1 className="logout_heading">Logging out</h1>
        <Link to="/">Return to log in page.</Link>
      </div>
    );
  }
}

export default LogOutComponent;
