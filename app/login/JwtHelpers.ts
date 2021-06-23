import jwt, { JwtPayload, verify } from "jsonwebtoken";
import { JwtData, JwtDataShape } from "./DecodedProfile";

/**
 * perform the validation of the token via jsonwebtoken library.
 * if validation fails then the returned promise is rejected
 * if validation succeeds, then the promise only completes once the decoded content has been set into the state.
 * @returns {Promise<object>} Decoded JWT content or rejects with an error
 */
function verifyJwt(token: string, signingKey: string, refreshToken?: string) {
  return new Promise<JwtPayload | undefined>((resolve, reject) => {
    jwt.verify(token, signingKey, (err, decoded) => {
      if (err) {
        console.log("token: ", token);
        console.log("signingKey: ", signingKey);
        console.error("could not verify JWT: ", err);
        reject(err);
      }

      window.localStorage.setItem("pluto:access-token", token); //it validates so save the token
      if (refreshToken)
        window.localStorage.setItem("pluto:refresh-token", refreshToken);
      resolve(decoded);
    });
  });
}

/**
 * gets the signing key from the server
 * @returns {Promise<string>} Raw content of the signing key in PEM format
 */
async function loadInSigningKey() {
  const result = await fetch("/meta/oauth/publickey.pem");
  switch (result.status) {
    case 200:
      return result.text();
    default:
      console.error(
        "could not retrieve signing key, server gave us ",
        result.status
      );
      throw "Could not retrieve signing key";
  }
}

/**
 * helper function that validates and decodes into a user profile a token already existing in the localstorage
 */
async function verifyExistingLogin(): Promise<JwtDataShape | undefined> {
  const token = getRawToken();
  if (token) {
    const signingKey = await loadInSigningKey();
    const jwtPayload = await verifyJwt(token, signingKey);
    return jwtPayload ? JwtData(jwtPayload) : undefined;
  }
}

/**
 * returns the raw JWT for passing to backend services
 * @returns {string} the JWT, or null if it is not set.
 */
function getRawToken() {
  return window.localStorage.getItem("pluto:access-token");
}

export { verifyJwt, loadInSigningKey, verifyExistingLogin, getRawToken };
