import React from 'react';
import PropTypes from 'prop-types';
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
            expiry: null,
            haveClientId: false,
            lastError: null,
            inProgress: true,
            doRedirect: false
        }
    }

    setStatePromise(newState) {
        return new Promise((resolve, reject)=>this.setState(newState, ()=>resolve()));
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
        // const postdata = {
        //     grant_type: "authorization_code",
        //     client_id: this.props.clientId,
        //     redirect_uri: this.props.redirectUri,
        //     code: this.state.authCode
        // }
        console.log("passed client_id ", this.props.clientId);

        let postdata = new FormData();
        postdata.append("grant_type","authorization_code");
        postdata.append("client_id", this.props.clientId);
        postdata.append("redirect_uri", this.props.redirectUri);
        postdata.append("code", this.state.authCode);

        const tokenUri = this.props.oAuthUri + "/adfs/oauth2/token";
        const response = await fetch(tokenUri, {method: "POST", body: postdata});
        switch(response.status) {
            case 200:
                const content = await response.json();
                return this.setStatePromise({stage: 2, token: content.access_token, expiry: content.expires_in});
            default:
                const errorContent = await response.text();
                console.log("token endpoint returned ", response.status, ": ", errorContent);
                return this.setStatePromise({lastError: errorContent});
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //if the clientId is set when we are ready for it, then action straightaway. Otherwise it will be picked
        //up in componentDidMount.
        if(prevProps.clientId==="" && this.props.clientId!=="" && this.state.stage===1){
            this.requestToken().catch(err=>console.error("requestToken failed: ", err));
        }
    }

    async componentDidMount() {
        await this.loadInAuthcode();
        if(this.props.clientId!=="") {
            await this.requestToken();
        }
    }

    render() {
        return <div>
            <h1>testing</h1>
            <table>
                <tbody>
                <tr><td>stage</td><td><pre>{this.state.stage}</pre></td></tr>
                <tr><td>authCode</td><td><pre>{this.state.authCode}</pre></td></tr>
                <tr><td>state</td><td><pre>{this.state.state}</pre></td></tr>
                <tr><td>token</td><td><pre>{this.state.token}</pre></td></tr>
                <tr><td>lastError</td><td><pre>{this.state.lastError}</pre></td></tr>
                <tr><td>inProgress</td><td><pre>{this.state.inProgress}</pre></td></tr>
                <tr><td>doRedirect</td><td><pre>{this.state.doRedirect}</pre></td></tr>
                </tbody>
            </table>
        </div>
    }
}

export default OAuthCallbackComponent;