import React, { useContext, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { UserContext } from "@guardian/pluto-headers";
import {
  Button,
  Fade,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  Link,
} from "@material-ui/core";
import ProjectsPanel from "./panels/ProjectsPanel";
import clsx from "clsx";
import DeliverablesPanel from "./panels/DeliverablesPanel";
import { ChevronRight } from "@material-ui/icons";
import { makeLoginUrl, OAuthContext } from "@guardian/pluto-headers";
import NotLoggedInPanel from "./panels/NotLoggedInPanel";
import HelpPanel from "./panels/HelpPanel";
import ObitsPanel from "./panels/ObitsPanel";
import { getOverdueCommissions } from "./services/PlutoCore";
import Alert from "@material-ui/lab/Alert";

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
  overdueAlert: {
    margin: theme.spacing(2, 0), // Add some spacing
    backgroundColor: theme.palette.error.dark, // Use a theme color for the background
    color: theme.palette.getContrastText(theme.palette.error.dark),
  },
  overdueLink: {
    color: theme.palette.getContrastText(theme.palette.error.dark),
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  listItem: {
    padding: theme.spacing(0.5, 0), // Reduce padding for each list item for compactness
  },
  link: {
    color: theme.palette.secondary.contrastText, // Use a color that stands out
    fontWeight: "bold", // Make it bold to attract attention
    "&:hover": {
      textDecoration: "underline", // Underline on hover to indicate clickability
    },
  },
}));

const useStyles = makeStyles((theme) => ({
  // existing styles...
  overdueAlert: {
    margin: theme.spacing(2, 0), // Add some spacing
    backgroundColor: theme.palette.error.dark, // Use a theme color for the background
    color: theme.palette.getContrastText(theme.palette.error.dark), // Ensure the text is readable on the error background
  },
  overdueLink: {
    color: theme.palette.getContrastText(theme.palette.error.dark),
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
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
        <Fade in={true}>
          <Grid item className={classes.actionPanel}>
            <ObitsPanel className={classes.panelContent} obitsToShow={4} />
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
    <NotLoggedInPanel
      bannerText="You need to log in to access the Multimedia production system.
    When prompted enter your email address in the format firstname.lastname@theguardian.com,
    and then approve on your phone when prompted from the Microsoft Authenticator app"
    >
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
  const classes = rootComponentStyles(); // Use custom useStyles instead of rootComponentStyles for the alert
  const [overdueCommissions, setOverdueCommissions] = useState([]);

  useEffect(() => {
    if (userContext.profile) {
      var user = `${userContext.profile.first_name}_${userContext.profile.family_name}`;
      console.log("Fetching overdue commissions for", userContext.profile);
      getOverdueCommissions(user)
        .then((data) => setOverdueCommissions(data || []))
        .catch((error) =>
          console.error("Failed to fetch overdue commissions:", error)
        );
    }
  }, [userContext.profile]);

  const displayName = () =>
    userContext.profile
      ? userContext.profile.first_name || userContext.profile.family_name
        ? `${userContext.profile.first_name} ${userContext.profile.family_name}`
        : userContext.profile.username
      : undefined;

  const renderOverdueCommissionsAlert = () => (
    <Alert severity="error" className={classes.overdueAlert}>
      You have {overdueCommissions.length} overdue commission
      {overdueCommissions.length > 1 ? "s" : ""}. Please adjust the scheduled
      completion date if this commission is still ongoing.
      <List>
        {overdueCommissions.map((entry) => (
          <ListItem key={entry["id"]} className={classes.listItem}>
            <Link
              href={`/pluto-core/commission/${entry["id"]}`}
              className={classes.link}
              underline="none"
            >
              {entry["title"]}
            </Link>
          </ListItem>
        ))}
      </List>
    </Alert>
  );

  return (
    <>
      {overdueCommissions.length > 0 && renderOverdueCommissionsAlert()}

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
