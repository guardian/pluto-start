import React from "react";
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
import OAuthCallbackComponent from "./OAuthCallbackComponent.jsx";
import RefreshLoginComponent from "./RefreshLoginComponent";
import StartingUpComponent from "./StartingUpComponent";
import { Header, AppSwitcher } from "pluto-headers";
import LogOutComponent from "./LogOutComponent.jsx";

library.add(faFolder, faFolderOpen, faSearch, faCog, faUser, faSignOutAlt);
require("./app.css");

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      startup: true,
      loading: false,
      redirectToLogin: false,
      lastError: null,
      clientId: "",
      resource: "",
      oAuthUri: "",
      tokenUri: "",
      hasExecuted: 0
    };

    const currentUri = new URL(window.location.href);
    this.redirectUri =
      currentUri.protocol + "//" + currentUri.host + "/oauth2/callback";
  }

  setStatePromise(newState) {
    return new Promise((resolve, reject) =>
      this.setState(newState, () => resolve())
    );
  }

  haveToken() {
    return window.localStorage.getItem("pluto:access-token");
  }

  async loadOauthData() {
    const response = await fetch("/meta/oauth/config.json");
    switch (response.status) {
      case 200:
        console.log("got response data");
        const content = await response.json();

        return this.setStatePromise({
          clientId: content.clientId,
          resource: content.resource,
          oAuthUri: content.oAuthUri,
          tokenUri: content.tokenUri,
          startup: false,
        });
      case 404:
        await response.text(); //consume body and discard it
        return this.setStatePromise({
          startup: false,
          lastError:
            "Metadata not found on server, please contact administrator",
        });
      default:
        await response.text(); //consume body and discard it
        return this.setStatePromise({
          startup: false,
          lastError:
            "Server returned a " +
            response.status +
            " error trying to access metadata",
        });
    }
  }

  async componentDidMount() {
    await this.loadOauthData();
    if (this.haveToken()) {
      console.log("have pre-existing token");
      this.setState({ lastError: null });
    } else {
      this.setState({ redirectToLogin: true });
    }
  }

  logOutCode() {
    var loggingOutValue = window.localStorage.getItem("pluto:logging-out");
    if (this.state.hasExecuted == 0) {
      if (loggingOutValue === null) {
        window.localStorage.removeItem("pluto:access-token");
        window.localStorage.setItem("pluto:logging-out", "True");
        this.setState({ hasExecuted: 1 });
      } else {
        window.localStorage.removeItem("pluto:logging-out");
        this.setState({ hasExecuted: 1 });
      }
    }
  }

  render() {
    //it's important that logout uses render= not component=. render= is evaluated at load, when oAuthUri is blank
    //need it to be evaluated at run when it is set
    //the adfs server bounces us back to /adfs/oauth2/logout when the logout process is complete so we bounce straight back to root
    return (
      <div>
        {window.location.href.includes("oauth2") ? (
          ""
        ) : (
          <>
            <Header></Header>
            <AppSwitcher></AppSwitcher>
          </>
        )}
        <Switch>
          <Route
            exact
            path="/logout"
            render={() => {
              this.logOutCode();
              return <LogOutComponent />;
            }}
          />
          <Route
            path="/refreshlogin"
            render={(props) => {
              console.log("refreshlogin", this.state);
              return this.state.startup ? (
                <StartingUpComponent />
              ) : (
                <RefreshLoginComponent
                  {...props}
                  clientId={this.state.clientId}
                  redirectUri={this.redirectUri}
                  resource={this.state.resource}
                  oAuthUri={this.state.oAuthUri}
                  location={props.location}
                />
              );
            }}
          />
          <Route
            exact
            path="/oauth2/callback"
            render={(props) => (
              <OAuthCallbackComponent
                {...props}
                oAuthUri={this.state.oAuthUri}
                tokenUri={this.state.tokenUri}
                clientId={this.state.clientId}
                redirectUri={this.redirectUri}
              />
            )}
          />
          <Route exact path="/" component={RootComponent} />
          <Route path="/" component={NotFoundComponent} />
        </Switch>
      </div>
    );
  }
}

const AppWithRouter = withRouter(App);
render(
  <BrowserRouter root="/">
    <AppWithRouter />
  </BrowserRouter>,
  document.getElementById("app")
);
