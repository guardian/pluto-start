import { loadInSigningKey, verifyJwt } from "./JwtHelpers";

interface OAuthResponse {
  token?: string;
  refreshToken?: string;
  error?: string;
}

/**
 * performs the second-stage exchange, i.e. it sends the code back to the server and requests a bearer
 * token in response
 * @param searchParams
 * @param clientId
 * @param redirectUri
 * @param tokenUri
 */
async function stageTwoExchange(
  searchParams: URLSearchParams,
  clientId: string,
  redirectUri: string,
  tokenUri: string
): Promise<OAuthResponse> {
  const authCode = searchParams.get("code");
  const errorInUrl = searchParams.get("error");

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
          token: content.access_token,
          refreshToken: content.hasOwnProperty("refresh_token")
            ? content.refresh_token
            : undefined,
          error: undefined,
        };

      // return this.setStatePromise({
      //     stage: 2,
      //     token: content.access_token,
      //     refreshToken: content.hasOwnProperty("refresh_token")
      //         ? content.refresh_token
      //         : null,
      //     expiry: content.expires_in,
      //     inProgress: false,
      // });
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
      // return this.setStatePromise({
      //     lastError: errorContent,
      //     inProgress: false,
      // });
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
 * @param response
 */
async function validateAndDecode(response: OAuthResponse) {
  const signingKey = await loadInSigningKey();

  if (response.token) {
    const decoded = await verifyJwt(
      response.token,
      signingKey,
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

export { stageTwoExchange, validateAndDecode, delayedRequest };
