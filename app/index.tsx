import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
  withRouter,
} from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faFolder,
  faFolderOpen,
  faSearch,
  faCog,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import RootComponent from "./RootComponent";
import NotFoundComponent from "./NotFoundComponent";
import OAuthCallbackComponent from "./login/OAuthCallbackComponent";
import RefreshLoginComponent from "./RefreshLoginComponent";
import StartingUpComponent from "./StartingUpComponent";
import { Header, AppSwitcher } from "pluto-headers";
import LoggedOutComponent from "./LoggedOutComponent";
import { OAuthContextProvider } from "./context/OAuthContext";
import { UserContextProvider } from "./context/UserContext";
import { JwtDataShape } from "./login/DecodedProfile";
import { ThemeProvider, createMuiTheme, CssBaseline } from "@material-ui/core";
import Wallpaper from "./Wallpaper";
import NewRootComponent from "./NewRootComponent";
import { verifyExistingLogin } from "./login/JwtHelpers";

library.add(faFolder, faFolderOpen, faSearch, faCog, faUser, faSignOutAlt);

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      "sans-serif",
      '"Helvetica Neue"',
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
  },
  palette: {
    type: "dark",
    background: {
      paper: "#424242A0",
    },
  },
});

const App: React.FC<{}> = () => {
  const [startup, setStartup] = useState(true);
  const [loading, setLoading] = useState(true);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [lastError, setLastError] = useState<string | undefined>(undefined);

  const [userProfile, setUserProfile] = useState<JwtDataShape | undefined>(
    undefined
  );

  const haveToken = () => {
    return window.localStorage.getItem("pluto:access-token");
  };

  useEffect(() => {
    if (haveToken()) {
      verifyExistingLogin()
        .then((profile) => setUserProfile(profile))
        .catch((err) =>
          console.error("Could not verify existing user profile: ", err)
        );
    }
  }, []);

  const logOutIfReferrer = () => {
    //If the referring URL contains '/oauth2/callback' the user is trying
    //to log in again so the access token should not be cleared.
    if (!document.referrer.includes("/oauth2/callback")) {
      window.localStorage.removeItem("pluto:access-token");
      setUserProfile(undefined);
    }
  };

  //it's important that logout uses render= not component=. render= is evaluated at load, when oAuthUri is blank
  //need it to be evaluated at run when it is set
  //the adfs server bounces us back to /adfs/oauth2/logout when the logout process is complete so we bounce straight back to root
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Wallpaper />
        {window.location.href.includes("oauth2") ? (
          ""
        ) : (
          <>
            <Header />
            <AppSwitcher />
          </>
        )}
        <OAuthContextProvider>
          <UserContextProvider
            value={{
              profile: userProfile,
              updateProfile: (newValue) => setUserProfile(newValue),
            }}
          >
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
          </UserContextProvider>
        </OAuthContextProvider>
      </ThemeProvider>
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
