import React from "react";
import ScalaBackendClient from "./ScalaBackendClient.jsx";
import css from "./rootcomponent.css"
import DjangoBackendClient from "./DjangoBackendClient.jsx";
class RootComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    render() {
        return <div>
            <h1>App root</h1>
            <div className="api-client-holder">
                <ScalaBackendClient backendRootUrl="https://adfstest-scala.pluto-dev.gnm.int"/>
                <DjangoBackendClient/>
            </div>
        </div>
    }
}

export default RootComponent;