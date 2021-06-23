import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import UserContext from "./context/UserContext";
import { Button, Fade, Grid, Paper, Typography } from "@material-ui/core";
import ProjectsPanel from "./panels/ProjectsPanel";
import clsx from "clsx";
import DeliverablesPanel from "./panels/DeliverablesPanel";
import { ChevronRight } from "@material-ui/icons";

const rootComponentStyles = makeStyles((theme) => ({
  actionPanel: {
    width: "40%",
    maxWidth: "1000px",
  },
  panelContent: {
    padding: "1em",
  },
  bannerText: {
    textAlign: "center",
  },
  separated: {
    marginBottom: "1em",
  },
}));

const LoggedInRoot: React.FC = () => {
  const userContext = useContext(UserContext);
  const [showDeliverables, setShowDeliverables] = useState(false);
  const classes = rootComponentStyles();

  return (
    <>
      <Typography
        variant="h6"
        className={clsx(classes.bannerText, classes.separated)}
      >
        What do you need to find?
      </Typography>
      <Grid container justify="space-around" spacing={4}>
        <Fade in={true}>
          <Grid item className={classes.actionPanel}>
            <ProjectsPanel className={classes.panelContent} />
          </Grid>
        </Fade>
        <Fade in={showDeliverables}>
          <Grid item className={classes.actionPanel}>
            <DeliverablesPanel
              className={classes.panelContent}
              onLoaded={(haveContent) => setShowDeliverables(haveContent)}
            />
          </Grid>
        </Fade>
      </Grid>
    </>
  );
};

const LoggedOutRoot: React.FC = () => {
  return (
    <Grid
      container
      justify="space-around"
      style={{ marginTop: "auto", marginBottom: "auto" }}
    >
      <Grid item>
        <Paper className={classes.actionPanel}>
          <Typography variant="h6" className={classes.bannerText}>
            You need to log in to access the Multimedia production system, using
            your normal Mac login credentials.
          </Typography>
          <Button
            style={{ marginLeft: "auto", marginRight: "auto" }}
            variant="contained"
            endIcon={<ChevronRight />}
          >
            Log me in
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
};
const NewRootComponent: React.FC = () => {
  const userContext = useContext(UserContext);
  const classes = rootComponentStyles();

  const displayName = () =>
    userContext.profile
      ? userContext.profile.first_name || userContext.profile.family_name
        ? `${userContext.profile.first_name} ${userContext.profile.family_name}`
        : userContext.profile.username
      : undefined;

  return (
    <>
      <Typography variant="h1" className={classes.bannerText}>
        {userContext.profile ? `Welcome ${displayName()}` : "Welcome to Pluto"}
      </Typography>
      {userContext.profile ? <LoggedInRoot /> : <LoggedOutRoot />}
    </>
  );
};

export default NewRootComponent;
