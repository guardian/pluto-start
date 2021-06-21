import React from "react";
import { shallow, mount } from "enzyme";
import RefreshLoginComponent from "../app/RefreshLoginComponent";
import OAuthContext from "../app/context/OAuthContext";
import { MemoryRouter } from "react-router";
import sinon from "sinon";

describe("RefreshLoginComponent", () => {
  const oAuthData = {
    clientId: "my-clientid",
    resource: "someresource",
    redirectUri: "https://my-service/oauth2callback",
    oAuthUri: "https://my-oauth-server/adfs/oauth2/authorize",
    tokenUri: "https://my-oauth-server/token",
  };

  it("should render a redirect to the auth server including a redirect path in the state param", () => {
    const fakeLocation = {
      search:
        "?returnTo=/path/to/some/other/service&something=something&somethingelse=that",
    };

    const originalAssign = window.location.assign;
    window.location.assign = sinon.spy();

    const rendered = mount(
      <MemoryRouter initialEntries={[fakeLocation]}>
        <OAuthContext.Provider value={oAuthData}>
          <RefreshLoginComponent />
        </OAuthContext.Provider>
      </MemoryRouter>
    );

    //@ts-ignore
    expect(
      window.location.assign.calledWith(
        "https://my-oauth-server/adfs/oauth2/authorize?response_type=code&client_id=my-clientid&resource=someresource&redirect_uri=https%3A%2F%2Fmy-service%2Foauth2callback&state=%2Fpath%2Fto%2Fsome%2Fother%2Fservice"
      )
    ).toBeTruthy();
    window.location.assign = originalAssign;
  });

  it("should redirect back to root if there is no path to redirect to", () => {
    const fakeLocation = {
      search: "?something=something&somethingelse=that",
    };

    const originalAssign = window.location.assign;
    window.location.assign = sinon.spy();

    const rendered = mount(
      <MemoryRouter initialEntries={[fakeLocation]}>
        <OAuthContext.Provider value={oAuthData}>
          <RefreshLoginComponent />
        </OAuthContext.Provider>
      </MemoryRouter>
    );

    //@ts-ignore
    expect(
      window.location.assign.calledWith(
        "https://my-oauth-server/adfs/oauth2/authorize?response_type=code&client_id=my-clientid&resource=someresource&redirect_uri=https%3A%2F%2Fmy-service%2Foauth2callback&state=%2F"
      )
    ).toBeTruthy();
    window.location.assign = originalAssign;
  });

  it("should redirect back to root if the query string is empty", () => {
    const fakeLocation = {
      search: "",
    };

    window.location.assign = sinon.spy();

    const rendered = mount(
      <MemoryRouter initialEntries={[fakeLocation]}>
        <OAuthContext.Provider value={oAuthData}>
          <RefreshLoginComponent />
        </OAuthContext.Provider>
      </MemoryRouter>
    );

    //@ts-ignore
    expect(
      window.location.assign.calledWith(
        "https://my-oauth-server/adfs/oauth2/authorize?response_type=code&client_id=my-clientid&resource=someresource&redirect_uri=https%3A%2F%2Fmy-service%2Foauth2callback&state=%2F"
      )
    ).toBeTruthy();
  });

  it("should redirect back to root if the query string does not exist", () => {
    const fakeLocation = {};

    const rendered = mount(
      <MemoryRouter initialEntries={[fakeLocation]}>
        <OAuthContext.Provider value={oAuthData}>
          <RefreshLoginComponent />
        </OAuthContext.Provider>
      </MemoryRouter>
    );

    //@ts-ignore
    expect(
      window.location.assign.calledWith(
        "https://my-oauth-server/adfs/oauth2/authorize?response_type=code&client_id=my-clientid&resource=someresource&redirect_uri=https%3A%2F%2Fmy-service%2Foauth2callback&state=%2F"
      )
    ).toBeTruthy();
  });
});
