import React from 'react';
import PropTypes from 'prop-types';
import jwt from 'jsonwebtoken';

/**
 * this component handles the token redirect from the authentication
 * once the user has authed successfully with the IdP, the browser is sent a redirect
 * that lands here. We are given an opaque code by the server in the "code" query parameter.
 * We take this and try to exchange it for a bearer token; if successful this is stored into the session
 * storage and we then redirect the user back to what they were doing (via the State parameter)
 * If not successful, we halt and display an error message.
 */
class OAuthCallbackComponent extends React.Component {
    static propTypes = {
        oAuthUri: PropTypes.string.isRequired,
        clientId: PropTypes.string.isRequired,
        redirectUri: PropTypes.string.isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            stage: 0,
            authCode: null,
            state: "/",
            token: null,
            refreshToken: null,
            expiry: null,
            haveClientId: false,
            lastError: null,
            inProgress: true,
            doRedirect: false,
            decodedContent: "",
            signingKey: ""
        };

        this.validateAndDecode = this.validateAndDecode.bind(this);
    }

    setStatePromise(newState) {
        return new Promise((resolve, reject)=>this.setState(newState, ()=>resolve()));
    }

    /**
     * perform the validation of the token via jsonwebtoken library.
     * if validation fails then the returned promise is rejected
     * if validation succeeds, then the promise only completes once the decoded content has been set into the state.
     * @returns {Promise<unknown>}
     */
    async validateAndDecode() {
        if(!this.state.signingKey){
            await this.loadInSigningKey();
        }

        return new Promise((resolve, reject)=>{
            jwt.verify(this.state.token, this.state.signingKey, (err,decoded)=>{
                if(err){
                    console.error("could not verify JWT: ", err);
                    this.setStatePromise({lastError: err}).then(()=>reject(err));
                }
                console.log("decoded JWT");
                sessionStorage.setItem("adfs-test:token", this.state.token);    //it validates, save the token
                sessionStorage.setItem("adfs-test:refresh", this.state.refreshToken);
                this.setState({decodedContent: JSON.stringify(decoded), stage: 3}, ()=>resolve());
            });
        });
    }

    /**
     * gets the signing key from the server
     * @returns {Promise<void>}
     */
    async loadInSigningKey() {
        const result = await fetch("/meta/oauth/publickey.pem");
        switch(result.status){
            case 200:
                const content = await result.text();
                return this.setStatePromise({signingKey: content});
            default:
                console.error("could not retrieve signing key, server gave us ", result.status);
                await this.setStatePromise({lastError: "Could not retrieve signing key"});
                throw "Could not retrieve signing key";
        }
    }

    /**
     * gets the auth code parameter from the URL query string and stores it in the state
     * @returns {Promise<unknown>}
     */
    async loadInAuthcode() {
        const paramParts = new URLSearchParams(this.props.location.search);
        //FIXME: handle incoming error messages too
        return this.setStatePromise({stage: 1, authCode: paramParts.get("code"), state: paramParts.get("state")})
    }

    /**
     * performs the second-stage exchange, i.e. it sends the code back to the server and requests a bearer
     * token in response
     * @returns {Promise<void>}
     */
    async requestToken() {
        //wait for ui to update before continuing
        await function(){ return new Promise((resolve,reject)=>window.setTimeout(()=>resolve(), 500))}

        const postdata = {
            grant_type: "authorization_code",
            client_id: this.props.clientId,
            redirect_uri: this.props.redirectUri,
            code: this.state.authCode
        }
        console.log("passed client_id ", this.props.clientId);

        const content_elements = Object.keys(postdata).map(k=>k + "=" + encodeURIComponent(postdata[k]));
        const body_content = content_elements.join("&");

        const tokenUri = this.props.oAuthUri + "/adfs/oauth2/token";
        const response = await fetch(tokenUri, {method: "POST", body: body_content, headers: {Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded"}});
        switch(response.status) {
            case 200:
                const content = await response.json();
                return this.setStatePromise({stage: 2,
                    token: content.access_token,
                    refreshToken: content.hasOwnProperty("refresh_token") ? content.refresh_token : null,
                    expiry: content.expires_in,
                    inProgress: false});
            default:
                const errorContent = await response.text();
                console.log("token endpoint returned ", response.status, ": ", errorContent);
                return this.setStatePromise({lastError: errorContent, inProgress: false});
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //if the clientId is set when we are ready for it (stage==1), then action straightaway.
        //Otherwise it will be picked up in componentDidMount after stage 1 completes.
        if(prevProps.clientId==="" && this.props.clientId!=="" && this.state.stage===1){
            this.requestToken().then(this.validateAndDecode).catch(err=>{
                console.error("requestToken failed: ", err);
                this.setState({lastError: err.toString(), inProgress: false});
            });
        }
    }

    async componentDidMount() {
        await this.loadInAuthcode();
        if(this.props.clientId!=="") {
            await this.requestToken().catch(err=>{
                console.error("requestToken failed: ", err);
                this.setState({lastError: err.toString(), inProgress: false});
            });
        }
    }

    render() {
        return <div>
            <h1>testing</h1>
            <table border="1">
                <tbody>
                <tr><td>stage</td><td><pre>{this.state.stage}</pre></td></tr>
                <tr><td>authCode</td><td><pre>{this.state.authCode}</pre></td></tr>
                <tr><td>state</td><td><pre>{this.state.state}</pre></td></tr>
                <tr><td>token</td><td><pre>{this.state.token}</pre></td></tr>
                <tr><td>refresh token</td><td><pre>{this.state.refreshToken}</pre></td></tr>
                <tr><td>lastError</td><td><pre style={{color:"red"}}>{this.state.lastError}</pre>
                    <a href="/" style={{display: this.state.lastError ? "inline" : "none"}}>Try again?</a></td></tr>
                <tr><td>inProgress</td><td><pre>{this.state.inProgress ? "yes" : "no"}</pre></td></tr>
                <tr><td>doRedirect</td><td><pre>{this.state.doRedirect}</pre></td></tr>
                <tr><td>decodedContent</td><td><pre id="decoded-content-holder">{this.state.decodedContent}</pre></td></tr>
                </tbody>
            </table>
        </div>
    }
}

export default OAuthCallbackComponent;