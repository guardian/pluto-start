import React from "react";
import { Link } from "react-router-dom";
require("./app.css");

class LoggedOutComponent extends React.Component {
  render() {
    return (
      <div className="logout">
        <h1 className="logout_heading">Logged out</h1>
        Log out process completed. Now you can either close this window or click
        the "LOGIN" button above to log in again.
      </div>
    );
  }
}

export default LoggedOutComponent;
