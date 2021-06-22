import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link, Typography } from "@material-ui/core";

class NotFoundComponent extends React.Component {
  render() {
    return (
      <>
        <Typography variant="h4">Not found</Typography>
        <Typography>
          Hmmmm, there is no page with that path in the frontend.
        </Typography>
        <Link component={RouterLink} to="/">
          Home
        </Link>
      </>
    );
  }
}

export default NotFoundComponent;
