import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import CircularProgress from "@material-ui/core/CircularProgress";
import { stageTwoExchange, validateAndDecode } from "./OAuthService";
import { UserContext } from "pluto-headers";
import { JwtData, OAuthContext } from "pluto-headers";
import { Link, Typography } from "@material-ui/core";
import { useStyles } from "../CommonStyles";
import { makeLoginUrl as buildLoginURL } from "pluto-headers";
/**
 * this component handles the token redirect from the authentication
 * once the user has authed successfully with the IdP, the browser is sent a redirect
 * that lands here. We are given an opaque code by the server in the "code" query parameter.
 * We take this and try to exchange it for a bearer token; if successful this is stored into
 * the local storage and we then redirect the user back to what they were doing (via the State parameter)
 * If not successful, we halt and display an error message.
 */
const OAuthCallbackComponent: React.FC<{}> = () => {
  const [inProgress, setInProgress] = useState(true);
  const [doRedirect, setDoRedirect] = useState<string | undefined>(undefined);
  const [showingLink, setShowingLink] = useState(false);

  const [lastError, setLastError] = useState<string | undefined>(undefined);
  const oAuthContext = useContext(OAuthContext);
  const userContext = useContext(UserContext);

  const classes = useStyles();

  const history = useHistory();

  const makeLoginURL = () => {
    if (oAuthContext) {
      return buildLoginURL(oAuthContext);
    } else {
      setLastError("Could not get server information for login");
      setShowingLink(false);
    }
  };

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
              userContext.updateProfile(marshalledData);
            } else {
              setLastError("Login was validated but no user data returned");
            }

            const newLocation = searchParams.get("state");
            if (newLocation && newLocation != "/") {
              //if we  have a specific location to go to, then assume it's external and do it via window.setLocation
              setDoRedirect(newLocation);
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
          window.setTimeout(() => setShowingLink(true), 3000);
        }
      } else {
        setLastError("Could not get server information for login");
        setInProgress(false);
        setShowingLink(true);
      }
    };

    loginProcess();
  }, [oAuthContext]);

  return (
    <div>
      {lastError ? (
        <div className={classes.errorCentered}>
          <Typography className={classes.urlError}>
            There was an error when logging in.
          </Typography>
          <Typography>{lastError}</Typography>
          {showingLink ? (
            <Link href={makeLoginURL()}>Attempt to log in again</Link>
          ) : (
            <CircularProgress />
          )}
        </div>
      ) : (
        <div
          className={classes.centered}
          style={{ display: inProgress ? "flex" : "none" }}
        >
          <img
            src="/static/Ellipsis-4.5s-200px.svg"
            alt="loading"
            className={classes.loadingImage}
          />
          <Typography
            style={{
              flex: 1,
              display: inProgress ? "inherit" : "none",
            }}
          >
            {doRedirect
              ? `Login completed, sending you to ${doRedirect}`
              : "Logging you in..."}
          </Typography>
          <Typography
            className={classes.error}
            style={{ display: lastError ? "inherit" : "none" }}
          >
            Uh-oh, something went wrong: {lastError}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default OAuthCallbackComponent;
