import moment from "moment";
import { tz } from "moment-timezone";

/**
 * this is a helper object to get at the fields of the JWT claim while enabling auto-complete and nice
 * things like that
 */
class DecodedProfile {
  constructor(fromData) {
    if (!fromData.hasOwnProperty("sub") || !fromData.hasOwnProperty("aud")) {
      console.error(
        "Tried to initialise DecodedProfile from something that is not a user profile"
      );
      throw TypeError;
    }

    this._content = fromData;
  }

  aud() {
    return this._content.hasOwnProperty("aud") ? this._content.aud : null;
  }
  iss() {
    return this._content.hasOwnProperty("iss") ? this._content.iss : null;
  }
  iat_raw() {
    return this._content.hasOwnProperty("iat") ? this._content.iat : null;
  }
  iat() {
    return moment.utc(this.iat_raw() * 1000);
  }
  exp_raw() {
    return this._content.hasOwnProperty("exp") ? this._content.exp : null;
  }
  exp() {
    //would be cool to get the user's timezone from the profile to automatically zone this
    return moment.utc(this.exp_raw() * 1000);
  }
  sub() {
    return this._content.hasOwnProperty("sub") ? this._content.sub : null;
  }
  email() {
    return this._content.hasOwnProperty("email") ? this._content.email : null;
  }
  first_name() {
    return this._content.hasOwnProperty("first_name")
      ? this._content.first_name
      : null;
  }
  family_name() {
    return this._content.hasOwnProperty("family_name")
      ? this._content.family_name
      : null;
  }
  username() {
    return this._content.hasOwnProperty("username")
      ? this._content.username
      : null;
  }
  location() {
    return this._content.hasOwnProperty("location")
      ? this._content.location
      : null;
  }
  job_title() {
    return this._content.hasOwnProperty("job_title")
      ? this._content.job_title
      : null;
  }
  authmethod() {
    return this._content.hasOwnProperty("authmethod")
      ? this._content.authmethod
      : null;
  }
  auth_time() {
    return this._content.hasOwnProperty("auth_time")
      ? this._content.auth_time
      : null;
  }
  ver() {
    return this._content.hasOwnProperty("ver") ? this._content.ver : null;
  }
  appid() {
    return this._content.hasOwnProperty("appid") ? this._content.appid : null;
  }
}

export default DecodedProfile;
