import React, { useEffect, useState } from "react";
import { red } from "@material-ui/core/colors";

/*
          clientId: content.clientId,
          resource: content.resource,
          oAuthUri: content.oAuthUri,
          tokenUri: content.tokenUri,
 */
interface OAuthContextData {
  clientId: string;
  resource: string;
  oAuthUri: string;
  tokenUri: string;
  redirectUri: string;
}

const OAuthContext = React.createContext<OAuthContextData | undefined>(
  undefined
);
export const OAuthContextProvider: React.FC<{
  children: React.ReactFragment;
  onError?: (desc: string) => void;
}> = (props) => {
  const [clientId, setClientId] = useState("");
  const [resource, setResource] = useState("");
  const [oAuthUri, setOAuthUri] = useState("");
  const [tokenUri, setTokenUri] = useState("");
  const [haveData, setHaveData] = useState(false);

  const currentUri = new URL(window.location.href);
  const redirectUrl =
    currentUri.protocol + "//" + currentUri.host + "/oauth2/callback";

  const loadOauthData = async () => {
    const response = await fetch("/meta/oauth/config.json");
    switch (response.status) {
      case 200:
        console.log("got response data");
        const content = await response.json();

        setClientId(content.clientId);
        setResource(content.resource);
        setOAuthUri(content.oAuthUri);
        setTokenUri(content.tokenUri);
        setHaveData(true);
        break;
      case 404:
        await response.text(); //consume body and discard it
        if (props.onError)
          props.onError(
            "Metadata not found on server, please contact administrator"
          ); //temporary until we have global snackbar
        break;
      default:
        await response.text(); //consume body and discard it
        if (props.onError)
          props.onError(
            `Server returned a ${response.status} error trying to access meetadata`
          );
        break;
    }
  };

  useEffect(() => {
    //maybe not FIXME: need to figure a way of running this check once we have oauth data present
    loadOauthData();
    // .then(()=>{
    //     if(haveToken()) {
    //         console.log("have pre-existing token");
    //         setLastError(undefined);
    //     } else {
    //         setRedirectToLogin(true);
    //     }
    // })
  }, []);

  return (
    <OAuthContext.Provider
      value={
        haveData
          ? {
              clientId: clientId,
              resource: resource,
              oAuthUri: oAuthUri,
              tokenUri: tokenUri,
              redirectUri: redirectUrl,
            }
          : undefined
      }
    >
      {props.children}
    </OAuthContext.Provider>
  );
};

export type { OAuthContextData };
export default OAuthContext;
