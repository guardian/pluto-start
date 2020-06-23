import React from "react";
import ScalaBackendClient from "./ScalaBackendClient.jsx";
import css from "./rootcomponent.css";
import DjangoBackendClient from "./DjangoBackendClient.jsx";
class RootComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div>
        <h1>App root</h1>
        <div className="api-client-holder">
          <ScalaBackendClient backendRootUrl="https://adfstest.pluto-dev.gnm.int/scala-backend" />
          <DjangoBackendClient backendRootUrl="https://adfstest.pluto-dev.gnm.int/django-backend" />
        </div>
      </div>
    );
  }
}

export default RootComponent;
