import React from 'react';
import PropTypes from 'prop-types';
import {loadInSigningKey, validateAndDecode} from "./JwtHelpers.jsx";
import DecodedProfile from "./DecodedProfile.jsx";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import css from './loginbanner.css';

class LoginBanner extends React.Component {
    static propTypes = {

    }

    constructor(props) {
        super(props);

        this.state = {
            loginData: null,
        }
    }

    async componentDidMount() {
        const token = sessionStorage.getItem("adfs-test:token");
        if(!token) return;

        try {
            let signingKey = sessionStorage.getItem("adfs-test:signing-key");
            if(!signingKey) signingKey = await loadInSigningKey();

            const decodedData = await validateAndDecode(token, signingKey);
            this.setState({loginData: new DecodedProfile(decodedData)})
        } catch(err) {
            console.error("existing login token was not valid: ", err);
        }
    }

    render() {
        if(!this.state.loginData) {
            return <div className="login-banner">
                <div className="welcome">You are not currently logged in.</div>
            </div>
        }
        return <div className="login-banner">
            <div className="welcome">Welcome {this.state.loginData.first_name()} {this.state.loginData.family_name()}</div>
            <div className="username-box">
                <FontAwesomeIcon style={{marginRight: "0.25em"}} icon="user"/>
                <span style={{paddingRight: "0.5em"}}>{this.state.loginData.username()}</span>
                <a href="/logout"><FontAwesomeIcon icon="sign-out-alt"/></a></div>
        </div>
    }
}

export default LoginBanner;