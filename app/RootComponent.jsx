import React from "react";
import LoginBanner from "./LoginBanner.jsx";

class RootComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    render() {
        return <div>
            <h1>App root</h1>
            <p>Nothing here yet!</p>
        </div>
    }
}

export default RootComponent;