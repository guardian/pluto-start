import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import CircularProgress from "@material-ui/core/CircularProgress";
import { stageTwoExchange, validateAndDecode } from "./OAuthService";
import { UserContext } from "pluto-headers";
import { JwtData, OAuthContext } from "pluto-headers";
import { Grid, LinearProgress, Link, Typography } from "@material-ui/core";
import { useStyles } from "../CommonStyles";
import { makeLoginUrl as buildLoginURL } from "pluto-headers";
import NotLoggedInPanel from "../panels/NotLoggedInPanel";
/**
 * this component handles the token redirect from the authentication
 * once the user has authed successfully with the IdP, the browser is sent a redirect
 * that lands here. We are given an opaque code by the server in the "code" query parameter.
 * We take this and try to exchange it for a bearer token; if successful this is stored into
 * the local storage and we then redirect the user back to what they were doing (via the State parameter)
 * If not successful, we halt and display an error message.
 */
const OAuthCallbackComponent: React.FC<{}> = () => {
  const [inProgress, setInProgress] = useState(false);
  const [showingLink, setShowingLink] = useState(false);

  const [lastError, setLastError] = useState<string | undefined>(undefined);
  const oAuthContext = useContext(OAuthContext);
  const userContext = useContext(UserContext);

  const classes = useStyles();

  const history = useHistory();

  const makeLoginURL = () => {
    if (oAuthContext) {
      return buildLoginURL(oAuthContext);
    } //shouldn't show an error message as we always start up without oAuthContext then it gets updated
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => setShowingLink(true), 3000);
    return () => window.clearTimeout(timerId);
  }, [lastError]);

  useEffect(() => {
    const loginProcess = async () => {
      if (oAuthContext) {
        try {
          const searchParams = new URLSearchParams(history.location.search);
          const response = await stageTwoExchange(
            searchParams,
            oAuthContext.clientId,
            oAuthContext.redirectUri,
            oAuthContext.tokenUri
          );
          if (response.error) {
            setLastError(response.error);
          } else {
            const decodedData = await validateAndDecode(response);

            if (decodedData) {
              const marshalledData = JwtData(decodedData);
              userContext.updateProfile(marshalledData); //updating this context here seems to trigger a re-mount, or at least a re-running of this hook
            } else {
              setLastError("Login was validated but no user data returned");
            }

            const newLocation = searchParams.get("state");
            if (newLocation && newLocation != "/") {
              //disallow any fully-qualified links as they may send us where we don't want to go
              if (newLocation.startsWith("htt")) {
                history.push("/");
              } else {
                //if we  have a specific location to go to, then assume it's external and do it via window.setLocation
                window.location.href = newLocation;
              }
              setInProgress(false);
            } else {
              //if we are going to root, that is one of ours, so do it through react-router
              history.push("/");
              setInProgress(false);
            }
          }
        } catch (err) {
          setLastError(`Could not log in: ${err}`);
          setInProgress(false);
        }
      }
    };

    if (oAuthContext && !inProgress) {
      setInProgress(true); //if we don't put a blocker in here this hook is run twice resulting in spurious errors
      loginProcess();
    }
  }, [oAuthContext]);

  return lastError ? (
    <NotLoggedInPanel bannerText="Could not log you in">
      <Grid item>
        <Typography>There was a problem logging you in: {lastError}</Typography>
      </Grid>
      <Grid item>
        {showingLink ? (
          <Link href={makeLoginURL()}>Attempt to log in again</Link>
        ) : (
          <CircularProgress />
        )}
      </Grid>
    </NotLoggedInPanel>
  ) : (
    <NotLoggedInPanel bannerText="Logging you in...">
      <Grid item style={{ width: "100%" }}>
        <LinearProgress
          color="secondary"
          style={{ width: "80%", marginLeft: "auto", marginRight: "auto" }}
        />
      </Grid>
    </NotLoggedInPanel>
  );
};

export default OAuthCallbackComponent;
