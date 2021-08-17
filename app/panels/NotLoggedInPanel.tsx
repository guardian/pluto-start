import React from "react";
import { Button, Grid, Paper, Typography } from "@material-ui/core";
import clsx from "clsx";
import { ChevronRight } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { usePanelStyles } from "./PanelsCommon";

interface NotLoggedInPanelProps {
  bannerText?: string;
}

const useStyles = makeStyles({
  actionPanel: {
    width: "800px",
    maxWidth: "1000px",
  },
  loginBox: {
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "10em",
  },
  bannerText: {
    textAlign: "center",
  },
});

const NotLoggedInPanel: React.FC<NotLoggedInPanelProps> = (props) => {
  const classes = useStyles();
  const panelClasses = usePanelStyles();

  return (
    <Paper
      className={clsx(
        classes.actionPanel,
        classes.loginBox,
        panelClasses.panel
      )}
    >
      <Grid container direction="column" alignItems="center" spacing={3}>
        {props.bannerText ? (
          <Grid item>
            <Typography variant="h6" className={classes.bannerText}>
              {props.bannerText}
            </Typography>
          </Grid>
        ) : undefined}
        {props.children}
      </Grid>
    </Paper>
  );
};

export default NotLoggedInPanel;
