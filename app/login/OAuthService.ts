import { loadInSigningKey, OAuthContextData, verifyJwt } from "pluto-headers";

interface OAuthResponse {
  token?: string;
  refreshToken?: string;
  error?: string;
}

/**
 * performs the second-stage exchange, i.e. it sends the received code back to the server and requests a bearer
 * token in response
 * @param searchParams the URLSearchParams received from the server in stage one, including the "code" or "error" parameter
 * @param clientId oauth client ID from context
 * @param redirectUri oauth redirect uri from context
 * @param tokenUri oauth token uri from context
 */
async function stageTwoExchange(
  searchParams: URLSearchParams,
  clientId: string,
  redirectUri: string,
  tokenUri: string
): Promise<OAuthResponse> {
  const authCode = searchParams.get("code");
  const errorInUrl = searchParams.get("error");
  const codeChallenge = sessionStorage.getItem("cx") as string | null; //this is set in OAuthContext.tsx, in pluto-headers, via makeLoginUrl()
  sessionStorage.removeItem("cx");

  if (errorInUrl) {
    return {
      token: undefined,
      refreshToken: undefined,
      error: errorInUrl,
    };
  }

  if (!authCode) {
    return {
      error: "There was no code provided to exchange",
    };
  } else {
    const postdata: Record<string, string> = {
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code: authCode,
    };
    console.log("passed client_id ", clientId);

    if (!!codeChallenge && codeChallenge != "") {
      console.log(`have code_verifier '${codeChallenge}' from step one`);
      postdata["code_verifier"] = codeChallenge;
    }

    const content_elements = Object.keys(postdata).map(
      (k) => k + "=" + encodeURIComponent(postdata[k])
    );

    const body_content = content_elements.join("&");

    const response = await fetch(tokenUri, {
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

        return {
          token: content.id_token ?? content.access_token,
          refreshToken: content.hasOwnProperty("refresh_token")
            ? content.refresh_token
            : undefined,
          error: undefined,
        };

      default:
        const errorContent = await response.text();
        console.log(
          "token endpoint returned ",
          response.status,
          ": ",
          errorContent
        );
        return {
          error: "Could not get token from server",
        };
    }
  }
}

function delayedRequest(url: string, timeoutDelay: number, token: string) {
  return new Promise<void>((resolve, reject) => {
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
 *  * perform the validation of the token via jsonwebtoken library.
 * if validation fails then the returned promise is rejected
 * if validation succeeds, then the promise only completes once the decoded content has been set into the state.
 */
async function validateAndDecode(
  oAuthContext: OAuthContextData,
  response: OAuthResponse
) {
  if (response.token) {
    const decoded = await verifyJwt(
      oAuthContext,
      response.token,
      response.refreshToken
    );
    /* Make a request to pluto-user-beacon (if available) to ensure that the user exists in Vidispine.
     * The function should wait for up to five seconds for a response from pluto-user-beacon. */
    await delayedRequest("/userbeacon/register-login", 5000, response.token);
    return decoded;
  } else {
    throw "Could not validate aas no token was provided";
  }
}

export { stageTwoExchange, delayedRequest, validateAndDecode };
