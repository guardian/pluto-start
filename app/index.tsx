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
import RootComponent from "./RootComponent.jsx";
import NotFoundComponent from "./NotFoundComponent.jsx";
import OAuthCallbackComponent from "./login/OAuthCallbackComponent";
import RefreshLoginComponent from "./RefreshLoginComponent";
import StartingUpComponent from "./StartingUpComponent";
import { Header, AppSwitcher } from "pluto-headers";
import LoggedOutComponent from "./LoggedOutComponent.jsx";
import { OAuthContextProvider } from "./context/OAuthContext";
import { UserContextProvider } from "./context/UserContext";
import { JwtDataShape } from "./login/DecodedProfile";

library.add(faFolder, faFolderOpen, faSearch, faCog, faUser, faSignOutAlt);
require("./app.css");

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

  // async componentDidMount() {
  //   await this.loadOauthData();
  //   if (this.haveToken()) {
  //     console.log("have pre-existing token");
  //     this.setState({ lastError: null });
  //   } else {
  //     this.setState({ redirectToLogin: true });
  //   }
  // }

  const logOutIfReferrer = () => {
    //If the referring URL contains '/oauth2/callback' the user is trying
    //to log in again so the access token should not be cleared.
    if (!document.referrer.includes("/oauth2/callback")) {
      window.localStorage.removeItem("pluto:access-token");
    }
  };

  //it's important that logout uses render= not component=. render= is evaluated at load, when oAuthUri is blank
  //need it to be evaluated at run when it is set
  //the adfs server bounces us back to /adfs/oauth2/logout when the logout process is complete so we bounce straight back to root
  return (
    <>
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
            <Route exact path="/" component={RootComponent} />
            <Route path="/" component={NotFoundComponent} />
          </Switch>
        </UserContextProvider>
      </OAuthContextProvider>
    </>
  );
};

const AppWithRouter = withRouter(App);
render(
  <BrowserRouter basename="/">
    <AppWithRouter />
  </BrowserRouter>,
  document.getElementById("app")
);
