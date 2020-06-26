import React from "react";
import PropTypes from "prop-types";
import { loadInSigningKey, validateAndDecode } from "./JwtHelpers";
import { JwtDataShape, JwtData } from "./DecodedProfile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
require("./loginbanner.css");
import moment from "moment";
import "moment-timezone";

interface LoginBannerProps {
  clientId: string;
  resource: string;
  redirectUri: string;
  oAuthUri: string;
}

interface LoginBannerState {
  loginData?: JwtDataShape | null;
  expiredAt?: number | null;
  expired?: boolean;
  checkExpiryTimer?: number | undefined;
  expiryWarning?: boolean;
}

class LoginBanner extends React.Component<LoginBannerProps, LoginBannerState> {
  state: LoginBannerState;

  static propTypes = {
    clientId: PropTypes.string.isRequired,
    resource: PropTypes.string.isRequired,
    redirectUri: PropTypes.string.isRequired,
    oAuthUri: PropTypes.string.isRequired,
  };

  /**
   * uses the metadata loaded from the server to generate the correct URL to kick off the authentication flow.
   * if there is no token in storage on mount, then the user is redirected out to this url to authenticate
   * @returns {string}
   */
  makeLoginUrl() {
    const currentUri = new URL(window.location.href);

    const args: Record<string, string> = {
      response_type: "code",
      client_id: this.props.clientId,
      resource: this.props.resource,
      redirect_uri: this.props.redirectUri,
      state: currentUri.pathname,
    };

    const encoded = Object.entries(args).map(
      ([k, v]) => `${k}=${encodeURIComponent(v)}`
    );
    return this.props.oAuthUri + "/adfs/oauth2/authorize?" + encoded.join("&");
  }

  constructor(props: LoginBannerProps) {
    super(props);

    this.state = {
      loginData: null,
      expiredAt: null,
      expired: false,
      checkExpiryTimer: undefined,
      expiryWarning: false,
    };

    this.checkExpiryHandler = this.checkExpiryHandler.bind(this);
  }

  setStatePromise(newState: LoginBannerState) {
    return new Promise((resolve, reject) => {
      this.setState(newState, () => resolve());
    });
  }

  componentWillUnmount() {
    if (this.state.checkExpiryTimer) {
      window.clearInterval(this.state.checkExpiryTimer);
    }
  }

  /**
   * lightweight function that is called every minute to verify the state of the token
   * it returns a promise that resolves when the component state has been updated. In normal usage this
   * is ignored but it is used in testing to ensure that the component state is only checked after it has been set.
   */
  checkExpiryHandler() {
    if (this.state.loginData) {
      const nowTime = new Date().getTime() / 1000; //assume time is in seconds
      //we know that it is not null due to above check
      const expiry = this.state.loginData.exp;
      const timeToGo = expiry ? expiry - nowTime : null;
      if (timeToGo && timeToGo >= 300) {
        console.log("expiry is in 5 minutes or more");
      } else if (timeToGo && timeToGo > 0) {
        console.log("login will expire in next 5 minutes");
        return this.setStatePromise({
          expiryWarning: true,
        } as LoginBannerState);
      } else {
        console.log("login has expired already");
        return this.setStatePromise({
          expired: true,
          expiryWarning: false,
          expiredAt: expiry,
        });
      }
    } else {
      console.log("no login data present for expiry check");
    }
  }

  async componentDidMount() {
    const token = sessionStorage.getItem("adfs-test:token");
    if (!token) return;

    await this.setStatePromise({
      checkExpiryTimer: window.setInterval(this.checkExpiryHandler, 60000),
    } as LoginBannerState);

    try {
      let signingKey = sessionStorage.getItem("adfs-test:signing-key");
      if (!signingKey) signingKey = await loadInSigningKey();

      const decodedData = await validateAndDecode(token, signingKey, undefined);
      this.setState({ loginData: decodedData });
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        console.error("Token has already expired");
        this.setState({ expired: true, expiredAt: err.expiredAt });
      } else {
        console.error("existing login token was not valid: ", err);
      }
    }
  }

  render() {
    if (this.state.expired) {
      return (
        <div className="login-banner">
          <div className="welcome">
            Your login has expired. <a href={this.makeLoginUrl()}>Click here</a>{" "}
            to log in again.
          </div>
        </div>
      );
    }
    if (!this.state.loginData) {
      return (
        <div className="login-banner">
          <div className="welcome">
            You are not currently logged in.{" "}
            <a href={this.makeLoginUrl()}>Click here</a> to log in
          </div>
        </div>
      );
    }

    const loginData = this.state.loginData;
    const loginExpires = loginData.exp_moment;
    return (
      <div className="login-banner">
        <div className="welcome">
          <p style={{ margin: 0, padding: 0 }}>
            Welcome {loginData.first_name} {loginData.family_name}
          </p>
          <p
            className={this.state.expiryWarning ? "smaller warning" : "smaller"}
          >
            {this.state.expiryWarning
              ? "Your login expires soon!"
              : "Your login expires at"}{" "}
            {loginExpires
              ? loginExpires.tz("Europe/London").format("HH:mm")
              : "Unknown!"}{" "}
            (London). Auto-refresh is{" "}
            {sessionStorage.getItem("adfs-test:refresh")
              ? "available"
              : "not available"}
          </p>
        </div>
        <div className="username-box">
          <FontAwesomeIcon style={{ marginRight: "0.25em" }} icon="user" />
          <span style={{ paddingRight: "0.5em" }}>{loginData.username}</span>
          <a href="/logout">
            <FontAwesomeIcon icon="sign-out-alt" />
          </a>
        </div>
      </div>
    );
  }
}

export default LoginBanner;
