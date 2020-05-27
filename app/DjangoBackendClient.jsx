import React from 'react';
import PropTypes from 'prop-types';
import {getRawToken} from "./JwtHelpers.jsx";

class DjangoBackendClient extends React.Component {
    static propTypes = {
        backendRootUrl: PropTypes.string.isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            isLoggedIn: false,
            receivedData: {},
            requestLog: []
        };

        this.performRequest = this.performRequest.bind(this);
    }

    setStatePromise(newState) {
        return new Promise((resolve,reject)=>this.setState(newState, ()=>resolve()))
    }

    //assumption is that this would become a library function that can be used generically to establish login
    async checkLogin(fetchResponse) {
        if(fetchResponse.status===403) { //request forbidden
            await this.setStatePromise(oldState=>{return {requestLog: oldState.requestLog.concat("not logged in! Log in via the link above and try again"), isLoggedIn: false}});
            reject("not logged in");
        } else {
            return this.setStatePromise(oldState=>{return {requestLog: oldState.requestLog.concat("you are logged in to this service"), isLoggedIn: true}});
        }
    }

    async performRequest() {
        const tok = getRawToken();
        if(!tok){
            return this.setStatePromise(oldState=>{return {requestLog: oldState.requestLog.concat("no current session. Log in via the link above and try again"), isLoggedIn: false}});
        }

        await this.setStatePromise(oldState=>{return {requestLog: oldState.requestLog.concat("starting request..."), loading: true}});
        const result = await fetch(this.props.backendRootUrl + "/api/test", {
            headers: {
                "Authorization": "Bearer " + tok,
                "Accept": "application/json"
            }
        });
        await this.checkLogin(result);  //if not logged in this promise is rejected and await throws an exception

        switch(result.status) {
            case 200:
                const downloadedData = await result.json();
                return this.setStatePromise(oldState=>{return {requestLog: oldState.requestLog.concat("completed successfully"), loading: false, receivedData: downloadedData}});
            default:
                const errText = await result.text();
                console.error(errText);
                return this.setStatePromise(oldState=>{return {requestLog: oldState.requestLog.concat("server returned " + result.status + " see console log for more details"), loading: false}});
        }
    }

    render() {
        return <div className="action-component-box">
            <h2 className="boxheader">Django backend</h2>
            <button onClick={this.performRequest}>Perform request...</button>
            <table>
                <tbody>
                {Object.keys(this.state.receivedData).map((k,i)=><tr key={i}><td>{k}</td><td>{this.state.receivedData[k]}</td></tr>)}
                </tbody>
            </table>
            <hr/>
            <pre className="action-component-log">{this.state.requestLog.join("\n")}</pre>
        </div>
    }
}

export default DjangoBackendClient;