import React from "react";
import { shallow, mount } from "enzyme";
import RefreshLoginComponent from "../app/RefreshLoginComponent";

describe("RefreshLoginComponent", () => {
  it("should render a redirect to the auth server including a redirect path in the state param", () => {
    const fakeLocation = {
      search:
        "?returnTo=/path/to/some/other/service&something=something&somethingelse=that",
    };

    const rendered = shallow(
      <RefreshLoginComponent
        clientId="my-clientid"
        resource="someresource"
        redirectUri="https://my-service/oauth2callback"
        oAuthUri="https://my-oauth-server"
        location={fakeLocation}
      />
    );

    const redir = rendered.find("Redirect");
    expect(redir.length).toEqual(1);
    expect(redir.props().to).toEqual(
      "https://my-oauth-server/adfs/oauth2/authorize?response_type=code&client_id=my-clientid&resource=someresource&redirect_uri=https%3A%2F%2Fmy-service%2Foauth2callback&state=%2Fpath%2Fto%2Fsome%2Fother%2Fservice"
    );
  });

  it("should redirect back to root if there is no path to redirect to", () => {
    const fakeLocation = {
      search: "?something=something&somethingelse=that",
    };

    const rendered = shallow(
      <RefreshLoginComponent
        clientId="my-clientid"
        resource="someresource"
        redirectUri="https://my-service/oauth2callback"
        oAuthUri="https://my-oauth-server"
        location={fakeLocation}
      />
    );

    const redir = rendered.find("Redirect");
    expect(redir.length).toEqual(1);
    expect(redir.props().to).toEqual(
      "https://my-oauth-server/adfs/oauth2/authorize?response_type=code&client_id=my-clientid&resource=someresource&redirect_uri=https%3A%2F%2Fmy-service%2Foauth2callback&state=%2F"
    );
  });

  it("should redirect back to root if the query string is empty", () => {
    const fakeLocation = {
      search: "",
    };

    const rendered = shallow(
      <RefreshLoginComponent
        clientId="my-clientid"
        resource="someresource"
        redirectUri="https://my-service/oauth2callback"
        oAuthUri="https://my-oauth-server"
        location={fakeLocation}
      />
    );

    const redir = rendered.find("Redirect");
    expect(redir.length).toEqual(1);
    expect(redir.props().to).toEqual(
      "https://my-oauth-server/adfs/oauth2/authorize?response_type=code&client_id=my-clientid&resource=someresource&redirect_uri=https%3A%2F%2Fmy-service%2Foauth2callback&state=%2F"
    );
  });

  it("should redirect back to root if the query string does not exist", () => {
    const fakeLocation = {};

    const rendered = shallow(
      <RefreshLoginComponent
        clientId="my-clientid"
        resource="someresource"
        redirectUri="https://my-service/oauth2callback"
        oAuthUri="https://my-oauth-server"
        location={fakeLocation}
      />
    );

    const redir = rendered.find("Redirect");
    expect(redir.length).toEqual(1);
    expect(redir.props().to).toEqual(
      "https://my-oauth-server/adfs/oauth2/authorize?response_type=code&client_id=my-clientid&resource=someresource&redirect_uri=https%3A%2F%2Fmy-service%2Foauth2callback&state=%2F"
    );
  });
});
