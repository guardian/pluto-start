import React from "react";
import "./rootcomponent.css";
import CommissionsList from "./CommissionsList.jsx";
import ProjectsList from "./ProjectsList.jsx";
import { Table, TableBody, TableCell, TableRow } from "@material-ui/core";

class RootComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const token = window.localStorage.getItem("pluto:access-token");

    return (
      <div className="home-page-container-box">
        <h3>Welcome to Pluto</h3>
        {token ? (
          <div>
            <Table>
              <TableRow>
                <TableCell className="home-page-table">
                  <CommissionsList />
                </TableCell>
                <TableCell className="home-page-table">
                  <ProjectsList />
                </TableCell>
              </TableRow>
            </Table>
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
