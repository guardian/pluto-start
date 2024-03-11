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
  ButtonBase,
} from "@material-ui/core";
import Stack from "@mui/material/Stack";
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

const useStyles = makeStyles((theme) => ({
  fullwidthAlert: {
    "&:hover": {
      backgroundColor: theme.palette.warning.light,
      cursor: "pointer",
    },
    width: "100%",
  },
  overdueAlert: {
    margin: theme.spacing(2, 0),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.error.main,
    color: theme.palette.getContrastText(theme.palette.error.main),
    borderRadius: theme.shape.borderRadius,
  },
  overdueListItem: {
    "&:hover": {
      backgroundColor: theme.palette.error.light, // Lighter red on hover
      cursor: "pointer", // Change cursor to pointer to indicate clickable
    },
  },
  overdueListLink: {
    textDecoration: "none",
    color: theme.palette.getContrastText(theme.palette.error.main),
    "&:hover": {
      textDecoration: "underline", // Underline on hover to indicate clickability
    },
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
  const classes = useStyles();

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
  const classes = useStyles(); // Use custom useStyles instead of rootComponentStyles for the alert
  const [overdueCommissions, setOverdueCommissions] = useState([]);

  useEffect(() => {
    if (userContext.profile) {
      const user = `${userContext.profile.first_name}_${userContext.profile.family_name}`;
      console.log("Fetching overdue commissions for", userContext.profile);

      Promise.all([
        getOverdueCommissions(user, "In Production"),
        getOverdueCommissions(user, "New"),
      ])
        .then((results) => {
          // Manually concatenate the arrays instead of using flat()
          const combinedResults = [].concat(...results);
          setOverdueCommissions(combinedResults || []);
        })
        .catch((error) => {
          console.error("Failed to fetch overdue commissions:", error);
        });
    }
  }, [userContext.profile]);

  const displayName = () =>
    userContext.profile
      ? userContext.profile.first_name || userContext.profile.family_name
        ? `${userContext.profile.first_name} ${userContext.profile.family_name}`
        : userContext.profile.username
      : undefined;

  const renderOverdueCommissionsAlert = () => (
    <Stack sx={{ width: "100%" }} spacing={2}>
      <Alert variant="filled" className={classes.overdueAlert} severity="error">
        You have {overdueCommissions.length} overdue commission
        {overdueCommissions.length > 1 ? "s" : ""}. Please set the status to
        "Completed" or adjust the scheduled completion date if the commission is
        still ongoing.
      </Alert>
      {overdueCommissions.map((entry) => (
        <ButtonBase
          key={entry["id"]}
          href={`/pluto-core/commission/${entry["id"]}`}
          style={{ width: "100%", justifyContent: "flex-start" }} // Ensure the ButtonBase fills the container and aligns content to the start
        >
          <Alert
            variant="filled"
            className={classes.fullwidthAlert}
            severity="warning"
          >
            {entry["title"]}
          </Alert>
        </ButtonBase>
      ))}
    </Stack>
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
