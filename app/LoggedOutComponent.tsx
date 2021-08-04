import React, { useEffect, useState } from "react";
import NotLoggedInPanel from "./panels/NotLoggedInPanel";
import { Grid, Typography } from "@material-ui/core";
import { useHistory } from "react-router";

const LoggedOutComponent: React.FC = (props) => {
  const [timeRemaining, setTimeRemaining] = useState(10);
  const history = useHistory();

  const countTimer = () => {
    setTimeRemaining((value) => value - 1);
  };

  useEffect(() => {
    const timerId = window.setInterval(countTimer, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (timeRemaining < 1) {
      history.push("/");
    }
  }, [timeRemaining]);

  return (
    <NotLoggedInPanel bannerText="You are now logged out, feel free to close the window.">
      <Grid item>
        <Typography>
          Returning to login screen in {timeRemaining} seconds...
        </Typography>
      </Grid>
    </NotLoggedInPanel>
  );
};

export default LoggedOutComponent;
