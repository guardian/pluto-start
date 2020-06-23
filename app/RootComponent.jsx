import React from "react";
import "./rootcomponent.css";
class RootComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const token = window.sessionStorage.getItem("adfs-test:token");

    return (
      <div>
        <h1>Next-Gen Pluto Dev Login</h1>
        {token ? (
          <div>
            <p>
              This page is the under-development landing page for "Prexit", the
              next-generation version of Pluto.
            </p>
            <p>
              Choose from the following locations:
              <ul>
                <li>
                  <a href="/pluto-core">Pluto-Core</a>
                </li>
                <li>
                  <a href="/vs-jobs">Pluto-Logtool</a>
                </li>
              </ul>
            </p>
          </div>
        ) : (
          <div>
            <p>Please log in with the link above to continue</p>
          </div>
        )}
      </div>
    );
  }
}

export default RootComponent;
