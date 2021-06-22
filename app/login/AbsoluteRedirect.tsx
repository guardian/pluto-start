import React from "react";
import { useStyles } from "../../CommonStyles";

interface AbsoluteRedirectProps {
  to: string;
  descriptiveLabel?: string;
}
/**
 * very simple component that looks the same as <Redirect> but can bounce us out to another server
 */
const AbsoluteRedirect: React.FC<AbsoluteRedirectProps> = (props) => {
  const classes = useStyles();

  window.location.assign(props.to);
  return (
    <div className={classes.centered} style={{ display: "flex" }}>
      <img
        src="/static/Ellipsis-4.5s-200px.svg"
        alt="loading"
        className={classes.loadingImage}
      />
      <p style={{ flex: 1 }}>
        {props.descriptiveLabel ?? "Redirecting to login service..."}{" "}
      </p>
    </div>
  );
};

export default AbsoluteRedirect;
