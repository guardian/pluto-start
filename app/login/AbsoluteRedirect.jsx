import React from "react";
import PropTypes from "prop-types";
require("../appgeneric.css");

/**
 * very simple component that looks the same as <Redirect> but can bounce us out to another server
 */
class AbsoluteRedirect extends React.Component {
  static propTypes = {
    to: PropTypes.string.isRequired,
    descriptiveLabel: PropTypes.string,
  };

  render() {
    window.location.assign(this.props.to);
    return (
      <div className="centered" style={{ display: "flex" }}>
        <img
          src="/static/Ellipsis-4.5s-200px.svg"
          alt="loading"
          className="loading-image"
        />
        <p style={{ flex: 1 }}>
          {this.props.descriptiveLabel ?? "Redirecting to login service..."}{" "}
        </p>
      </div>
    );
  }
}

export default AbsoluteRedirect;
