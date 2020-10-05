import React from "react";
import { Link } from "react-router-dom";

class OAuthCallbackErrorComponent extends React.Component {
  render() {
    return (
      <div>
        <h1>Error</h1>
        <p>Wibble.</p>
        <Link to="/">Home</Link>
      </div>
    );
  }
}

export default OAuthCallbackErrorComponent;
