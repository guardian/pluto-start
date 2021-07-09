import React from "react";
import { useStyles } from "./CommonStyles";

const StartingUpComponent: React.FC = () => {
  const classes = useStyles();

  return (
    <div className="centered" style={{ display: "flex" }}>
      <img
        src="/static/Ellipsis-4.5s-200px.svg"
        alt="loading"
        className={classes.loadingImage}
      />
      <p style={{ flex: 1 }}>Please wait...</p>
    </div>
  );
};

export default StartingUpComponent;
