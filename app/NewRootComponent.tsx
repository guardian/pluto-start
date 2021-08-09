import React, { useContext, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { UserContext } from "pluto-headers";
import { Button, Fade, Grid, Paper, Typography } from "@material-ui/core";
import ProjectsPanel from "./panels/ProjectsPanel";
import clsx from "clsx";
import DeliverablesPanel from "./panels/DeliverablesPanel";
import { ChevronRight } from "@material-ui/icons";
import { makeLoginUrl, OAuthContext } from "pluto-headers";
import NotLoggedInPanel from "./panels/NotLoggedInPanel";
import HelpPanel from "./panels/HelpPanel";

const rootComponentStyles = makeStyles((theme) => ({
  panelContent: {
    padding: "1em",
  },
  bannerText: {
    textAlign: "center",
  },
  separated: {
    marginBottom: "1em",
  },
  actionPanel: {
    width: "800px",
    maxWidth: "1000px",
  },
  forceWhite: {
    color: theme.palette.common.white,
    textShadow: "2px 2px 4px #00000070",
  },
}));

const LoggedInRoot: React.FC = () => {
  const [showDeliverables, setShowDeliverables] = useState(true);
  const [showHelp, setShowHelp] = useState(true);
  const classes = rootComponentStyles();

  const hideHelp = () => {
    localStorage.setItem("pluto-hide-help", "true");
    setShowHelp(false);
  };

  useEffect(() => {
    setShowHelp(localStorage.getItem("pluto-hide-help") !== "true");
  }, []);

  return (
    <>
      <Typography
        variant="h6"
        className={clsx(
          classes.bannerText,
          classes.separated,
          classes.forceWhite
        )}
      >
        What do you need to find?
      </Typography>
      <Fade in={showHelp}>
        {showHelp ? (
          <Grid container justify="space-around" spacing={4}>
            <Grid item className={classes.actionPanel}>
              <HelpPanel
                className={classes.panelContent}
                hideRequested={hideHelp}
              />
            </Grid>
          </Grid>
        ) : (
          <span />
        )}
      </Fade>
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
              //always show deliverables panel now, as we have the general "search for deliverables" option above
              onLoaded={(haveContent) => setShowDeliverables(true)}
            />
          </Grid>
        </Fade>
      </Grid>
    </>
  );
};

const LoggedOutRoot: React.FC = () => {
  //const classes = rootComponentStyles();

  const oauthContext = useContext(OAuthContext);

  const doLogin = () => {
    oauthContext
      ? window.location.assign(makeLoginUrl(oauthContext))
      : alert(
          "Could not load login metadata, this should not happen. Please contact multimediatech."
        );
  };

  return (
    <NotLoggedInPanel bannerText="You need to log in to access the Multimedia production system, using your normal Mac password">
      <Grid item>
        <Button
          style={{ marginLeft: "auto", marginRight: "auto" }}
          variant="contained"
          endIcon={<ChevronRight />}
          onClick={doLogin}
        >
          Log me in
        </Button>
      </Grid>
    </NotLoggedInPanel>
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
      <Typography
        variant="h1"
        className={clsx(classes.bannerText, classes.forceWhite)}
      >
        {userContext.profile ? `Welcome ${displayName()}` : "Welcome to Pluto"}
      </Typography>
      {userContext.profile ? <LoggedInRoot /> : <LoggedOutRoot />}
    </>
  );
};

export default NewRootComponent;
