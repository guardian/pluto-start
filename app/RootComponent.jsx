import React from "react";
import "./rootcomponent.css";
import CommissionsList from "./widgets/CommissionsList.jsx";
import ProjectsList from "./widgets/ProjectsList.jsx";
import { Table, TableBody, TableCell, TableRow } from "@material-ui/core";

class RootComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const token = window.localStorage.getItem("pluto:access-token");

    return (
      <div>
        <h3 className="home-page-title">Welcome to Pluto</h3>
        {token ? (
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
