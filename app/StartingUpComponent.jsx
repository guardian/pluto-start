import React from "react";
require("./appgeneric.css");

class StartingUpComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="centered" style={{ display: "flex" }}>
        <img
          src="/static/Ellipsis-4.5s-200px.svg"
          alt="loading"
          className="loading-image"
        />
        <p style={{ flex: 1 }}>Please wait...</p>
      </div>
    );
  }
}

export default StartingUpComponent;
