import React from 'react';
import PropTypes from 'prop-types';
import {loadInSigningKey, validateAndDecode} from "./JwtHelpers.jsx";
import DecodedProfile from "./DecodedProfile.jsx";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import css from './loginbanner.css';
import {tz} from "moment-timezone";

class LoginBanner extends React.Component {
    static propTypes = {
        clientId: PropTypes.string.isRequired,
        resource: PropTypes.string.isRequired,
        redirectUri: PropTypes.string.isRequired,
        oAuthUri: PropTypes.string.isRequired
    }

    /**
     * uses the metadata loaded from the server to generate the correct URL to kick off the authentication flow.
     * if there is no token in storage on mount, then the user is redirected out to this url to authenticate
     * @returns {string}
     */
    makeLoginUrl() {
        const currentUri = new URL(window.location.href);
        const args = {
            response_type: "code",
            client_id: this.props.clientId,
            resource: this.props.resource,
            redirect_uri: this.props.redirectUri,
            state: currentUri.pathname,
        };

        const encoded = Object.keys(args).map(k=>k + "=" + encodeURIComponent(args[k]))
        return this.props.oAuthUri + "/adfs/oauth2/authorize?" + encoded.join("&");
    }

    constructor(props) {
        super(props);

        this.state = {
            loginData: null,
            expiredAt: null,
            expired: false,
            checkExpiryTimer: null,
            expiryWarning: false
        };

        this.checkExpiryHandler = this.checkExpiryHandler.bind(this);
    }

    setStatePromise(newState) {
        return new Promise((resolve, reject)=>{
            this.setState(newState, ()=>resolve())
        });
    }

    componentWillUnmount() {
        if(this.state.checkExpiryTimer) {
            window.clearInterval(this.state.checkExpiryTimer);
        }
    }

    /**
     * lightweight function that is called every minute to verify the state of the token
     * it returns a promise that resolves when the component state has been updated. In normal usage this
     * is ignored but it is used in testing to ensure that the component state is only checked after it has been set.
     */
    checkExpiryHandler() {
        if(this.state.loginData) {
            const nowTime = new Date().getTime() / 1000;    //assume time is in seconds
            const timeToGo = this.state.loginData.exp_raw() ? this.state.loginData.exp_raw() - nowTime : null;
            if(timeToGo && timeToGo>=300){
                console.log("expiry is in 5 minutes or more");
            } else if(timeToGo && timeToGo>0) {
                console.log("login will expire in next 5 minutes");
                return this.setStatePromise({expiryWarning: true});
            } else {
                console.log("login has expired already");
                return this.setStatePromise({expired: true, expiryWarning: false, expiredAt: this.state.loginData.exp_raw()});
            }
        } else {
            console.log("no login data present for expiry check");
        }
    }

    async componentDidMount() {
        const token = sessionStorage.getItem("adfs-test:token");
        if(!token) return;

        await this.setStatePromise({checkExpiryTimer: window.setInterval(this.checkExpiryHandler, 60000)});

        try {
            let signingKey = sessionStorage.getItem("adfs-test:signing-key");
            if(!signingKey) signingKey = await loadInSigningKey();

            const decodedData = await validateAndDecode(token, signingKey);
            this.setState({loginData: new DecodedProfile(decodedData)})
        } catch(err) {
            if(err.name==="TokenExpiredError") {
                console.error("Token has already expired");
                this.setState({expired: true, expiredAt: err.expiredAt})
            } else {
                console.error("existing login token was not valid: ", err);
            }
        }
    }

    render() {
        if(this.state.expired) {
            return <div className="login-banner">
                <div className="welcome">Your login has expired. <a href={this.makeLoginUrl()}>Click here</a> to log in again.</div>
            </div>
        }
        if(!this.state.loginData) {
            return <div className="login-banner">
                <div className="welcome">You are not currently logged in.  <a href={this.makeLoginUrl()}>Click here</a> to log in</div>
            </div>
        }
        return <div className="login-banner">
            <div className="welcome">
                <p style={{margin: 0, padding: 0}}>Welcome {this.state.loginData.first_name()} {this.state.loginData.family_name()}</p>
                <p className={this.state.expiryWarning ? 'smaller warning': 'smaller'}>{this.state.expiryWarning ? "Your login expires soon!" : "Your login expires at"} {this.state.loginData.exp().tz("Europe/London").format("HH:mm")} (London).  Auto-refresh is {sessionStorage.getItem("adfs-test:refresh") ? "available" : "not available"}</p>
            </div>
            <div className="username-box">
                <FontAwesomeIcon style={{marginRight: "0.25em"}} icon="user"/>
                <span style={{paddingRight: "0.5em"}}>{this.state.loginData.username()}</span>
                <a href="/logout"><FontAwesomeIcon icon="sign-out-alt"/></a></div>
        </div>
    }
}

export default LoginBanner;