import React, { useContext } from "react";
import QueryString from "query-string";
import AbsoluteRedirect from "./login/AbsoluteRedirect";
import { OAuthContext } from "@guardian/pluto-headers";
import { useHistory } from "react-router";

const RefreshLoginComponent: React.FC = () => {

  const oAuthContext = useContext(OAuthContext);
  const history = useHistory();

  const makeLoginUrl = () => {
    const parsedQuery = history.location.search
      ? QueryString.parse(history.location.search)
      : undefined;
    const redirectState =
      parsedQuery && parsedQuery.returnTo ? parsedQuery.returnTo : "/";

    const args = {
      response_type: "code",
      client_id: oAuthContext?.clientId,
      resource: oAuthContext?.resource,
      redirect_uri: oAuthContext?.redirectUri,
      state: redirectState,
    };

    const encoded = Object.entries(args).map(
      ([k, v]) => `${k}=${encodeURIComponent(v as string)}`
    );
    return oAuthContext?.oAuthUri + "?" + encoded.join("&");
  };

  if (oAuthContext) {
    window.location.assign(makeLoginUrl());
  }

  return (
    <>
    </>
  );
};

export default RefreshLoginComponent;
