import React from "react";
import PropTypes from "prop-types";
import jwt from "jsonwebtoken";
import { loadInSigningKey, validateAndDecode } from "./JwtHelpers.jsx";
import { Redirect } from "react-router";
require("./appgeneric.css");

function delayedRequest(url, timeoutDelay, token) {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      console.error("Request timed out, could not contact UserBeacon");
      resolve();
    }, timeoutDelay);

    fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, body: "" },
    })
      .then((response) => {
        try {
          window.clearTimeout(timerId);
        } catch (err) {
          console.error("Could not clear the time out: ", err);
        }
        if (response.status === 200) {
          console.log("UserBeacon contacted successfully");
        } else {
          console.log("UserBeacon returned an error: ", response.status);
        }
        resolve();
      })
      .catch((err) => {
        try {
          window.clearTimeout(timerId);
        } catch (error) {
          console.error("Could not clear the time out: ", error);
        }
        console.error("Could not contact UserBeacon: ", err);
        reject(err);
      });
  });
}

/**
 * this component handles the token redirect from the authentication
 * once the user has authed successfully with the IdP, the browser is sent a redirect
 * that lands here. We are given an opaque code by the server in the "code" query parameter.
 * We take this and try to exchange it for a bearer token; if successful this is stored into
 * the local storage and we then redirect the user back to what they were doing (via the State parameter)
 * If not successful, we halt and display an error message.
 */
class OAuthCallbackComponent extends React.Component {
  static propTypes = {
    oAuthUri: PropTypes.string.isRequired,
    tokenUri: PropTypes.string.isRequired,
    clientId: PropTypes.string.isRequired,
    redirectUri: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      stage: 0,
      authCode: null,
      state: "/",
      token: null,
      refreshToken: null,
      expiry: null,
      haveClientId: false,
      lastError: null,
      inProgress: true,
      doRedirect: false,
      decodedContent: "",
      signingKey: "",
    };

    this.validateAndDecode = this.validateAndDecode.bind(this);
  }

  setStatePromise(newState) {
    return new Promise((resolve, reject) =>
      this.setState(newState, () => resolve())
    );
  }

  /**
   * perform the validation of the token via jsonwebtoken library.
   * if validation fails then the returned promise is rejected
   * if validation succeeds, then the promise only completes once the decoded content has been set into the state.
   * @returns {Promise<unknown>}
   */
  async validateAndDecode() {
    let signingKey = this.state.signingKey;
    if (!signingKey) {
      signingKey = await loadInSigningKey();
      await this.setStatePromise({ signingKey: signingKey });
    }

    try {
      const decoded = await validateAndDecode(
        this.state.token,
        this.state.signingKey,
        this.state.refreshToken
      );
      /* make a fire-and-forget request to pluto-user-beacon (if available) to ensure that the user exists in VS.
       * You should not assume that the component will still be existing when the initial promise completes! */
      await delayedRequest(
        "/userbeacon/register-login",
        5000,
        this.state.token
      );
      return this.setStatePromise({
        decodedContent: JSON.stringify(decoded),
        stage: 3,
      });
    } catch (err) {
      console.error("could not decode JWT: ", err);
      return this.setStatePromise({ lastError: err.toString() });
    }
  }

  /**
   * gets the auth code parameter from the URL query string and stores it in the state
   * @returns {Promise<unknown>}
   */
  async loadInAuthcode() {
    const paramParts = new URLSearchParams(this.props.location.search);
    //FIXME: handle incoming error messages too
    return this.setStatePromise({
      stage: 1,
      authCode: paramParts.get("code"),
      state: paramParts.get("state"),
    });
  }

  /**
   * performs the second-stage exchange, i.e. it sends the code back to the server and requests a bearer
   * token in response
   * @returns {Promise<void>}
   */
  async requestToken() {
    //wait for ui to update before continuing
    await function () {
      return new Promise((resolve, reject) =>
        window.setTimeout(() => resolve(), 500)
      );
    };

    const postdata = {
      grant_type: "authorization_code",
      client_id: this.props.clientId,
      redirect_uri: this.props.redirectUri,
      code: this.state.authCode,
    };
    console.log("passed client_id ", this.props.clientId);

    const content_elements = Object.keys(postdata).map(
      (k) => k + "=" + encodeURIComponent(postdata[k])
    );
    const body_content = content_elements.join("&");

    const response = await fetch(this.props.tokenUri, {
      method: "POST",
      body: body_content,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    switch (response.status) {
      case 200:
        const content = await response.json();

        return this.setStatePromise({
          stage: 2,
          token: content.access_token,
          refreshToken: content.hasOwnProperty("refresh_token")
            ? content.refresh_token
            : null,
          expiry: content.expires_in,
          inProgress: false,
        });
      default:
        const errorContent = await response.text();
        console.log(
          "token endpoint returned ",
          response.status,
          ": ",
          errorContent
        );
        return this.setStatePromise({
          lastError: errorContent,
          inProgress: false,
        });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    //if the clientId is set when we are ready for it (stage==1), then action straightaway.
    //Otherwise it will be picked up in componentDidMount after stage 1 completes.
    if (
      prevProps.clientId === "" &&
      this.props.clientId !== "" &&
      this.state.stage === 1
    ) {
      this.requestToken()
        .then(this.validateAndDecode)
        .catch((err) => {
          console.error("requestToken failed: ", err);
          this.setState({ lastError: err.toString(), inProgress: false });
        });
    }
  }

  async componentDidMount() {
    await this.loadInAuthcode();
    if (this.props.clientId !== "") {
      await this.requestToken().catch((err) => {
        console.error("requestToken failed: ", err);
        this.setState({ lastError: err.toString(), inProgress: false });
      });
    }
  }

  render() {
    let newLocation = "";
    if (this.state.stage === 3) {
      newLocation = this.state.state ?? "/";
      console.log(newLocation, this.state);
      window.location.href = newLocation;
    }

    return (
      <div
        className="centered"
        style={{ display: this.state.inProgress ? "flex" : "none" }}
      >
        <img
          src="/static/Ellipsis-4.5s-200px.svg"
          alt="loading"
          className="loading-image"
        />
        <p
          style={{
            flex: 1,
            display: this.state.inProgress ? "inherit" : "none",
          }}
        >
          {this.state.stage === 3
            ? `Login completed, sending you to ${newLocation}`
            : "Logging you in..."}
        </p>
        <p
          className="error"
          style={{ display: this.state.lastError ? "inherit" : "none" }}
        >
          Uh-oh, something went wrong: {this.state.lastError}
        </p>
      </div>
    );
  }
}

export { delayedRequest };
export default OAuthCallbackComponent;
