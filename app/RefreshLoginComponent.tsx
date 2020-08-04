import React from "react";
import PropTypes from "prop-types";
import QueryString from "query-string";
import AbsoluteRedirect from "./AbsoluteRedirect";
require("./appgeneric.css");

interface ReactRouterLocation {
  search?: string;
}
interface RefreshLoginComponentProps {
  clientId: string;
  resource: string;
  redirectUri: string;
  oAuthUri: string;
  location: ReactRouterLocation;
}

class RefreshLoginComponent extends React.Component<
  RefreshLoginComponentProps
> {
  static propTypes = {
    clientId: PropTypes.string.isRequired,
    resource: PropTypes.string.isRequired,
    redirectUri: PropTypes.string.isRequired,
    oAuthUri: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
  };

  makeLoginUrl() {
    const parsedQuery = this.props.location.search
      ? QueryString.parse(this.props.location.search)
      : undefined;
    const redirectState =
      parsedQuery && parsedQuery.returnTo ? parsedQuery.returnTo : "/";

    const args = {
      response_type: "code",
      client_id: this.props.clientId,
      resource: this.props.resource,
      redirect_uri: this.props.redirectUri,
      state: redirectState,
    };

    const encoded = Object.entries(args).map(
      ([k, v]) => `${k}=${encodeURIComponent(v as string)}`
    );
    return this.props.oAuthUri + "?" + encoded.join("&");
  }

  render() {
    return (
      <AbsoluteRedirect
        to={this.makeLoginUrl()}
        descriptiveLabel="Redirecting to login service..."
      />
    );
  }
}

export default RefreshLoginComponent;
