import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { BrowserRouter, Route, Switch, withRouter } from "react-router-dom";
import NotFoundComponent from "./NotFoundComponent";
import OAuthCallbackComponent from "./login/OAuthCallbackComponent";
import RefreshLoginComponent from "./RefreshLoginComponent";
import StartingUpComponent from "./StartingUpComponent";
import {
  Header,
  AppSwitcher,
  PlutoThemeProvider,
  OAuthContextData,
} from "@guardian/pluto-headers";
import LoggedOutComponent from "./LoggedOutComponent";
import { OAuthContextProvider } from "@guardian/pluto-headers";
import { UserContextProvider } from "@guardian/pluto-headers";
import { JwtDataShape, verifyExistingLogin } from "@guardian/pluto-headers";
import { CssBaseline } from "@material-ui/core";
import Wallpaper from "./Wallpaper";
import NewRootComponent from "./NewRootComponent";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import { SystemNotification } from "@guardian/pluto-headers";

axios.interceptors.request.use(function (config) {
  const token = window.localStorage.getItem("pluto:access-token");
  if (
    config.url?.startsWith("/pluto-core") ||
    config.url?.startsWith("/deliverables")
  ) {
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    width: "100vw",
    height: "100vh",
    overflowX: "hidden",
    overflowY: "auto",
  },
}));

const App: React.FC = () => {
  const [startup, setStartup] = useState(false);

  const [userProfile, setUserProfile] = useState<JwtDataShape | undefined>(
    undefined
  );

  const classes = useStyles();

  const haveToken = () => {
    return window.localStorage.getItem("pluto:access-token");
  };

  const oAuthConfigLoaded = (oAuthConfig: OAuthContextData) => {
    if (haveToken()) {
      verifyExistingLogin(oAuthConfig)
        .then((profile) => setUserProfile(profile))
        .catch((err) =>
          console.error("Could not verify existing user profile: ", err)
        );
    }
  };

  const logOutIfReferrer = () => {
    //If the referring URL contains '/oauth2/callback' the user is trying
    //to log in again so the access token should not be cleared.
    if (!document.referrer.includes("/oauth2/callback")) {
      window.localStorage.removeItem("pluto:access-token");
      setUserProfile(undefined);
    }
  };

  return (
    <div className={classes.rootContainer}>
      <PlutoThemeProvider>
        <CssBaseline />
        <Wallpaper />
        <OAuthContextProvider onLoaded={oAuthConfigLoaded}>
          <UserContextProvider
            value={{
              profile: userProfile,

              updateProfile: (newValue) => setUserProfile(newValue),
            }}
          >
            <Header />
            {userProfile ? <AppSwitcher /> : undefined}
            <Switch>
              <Route
                exact
                path="/logout"
                render={() => {
                  logOutIfReferrer();
                  return <LoggedOutComponent />;
                }}
              />
              <Route
                path="/refreshlogin"
                render={(props) => {
                  return startup ? (
                    <StartingUpComponent />
                  ) : (
                    <RefreshLoginComponent />
                  );
                }}
              />
              <Route
                exact
                path="/oauth2/callback"
                component={OAuthCallbackComponent}
              />
              <Route exact path="/" component={NewRootComponent} />
              <Route path="/" component={NotFoundComponent} />
            </Switch>
            <SystemNotification />
          </UserContextProvider>
        </OAuthContextProvider>
      </PlutoThemeProvider>
    </div>
  );
};

const AppWithRouter = withRouter(App);
render(
  <BrowserRouter basename="/">
    <AppWithRouter />
  </BrowserRouter>,
  document.getElementById("app")
);
