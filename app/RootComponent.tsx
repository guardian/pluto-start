import React from "react";
import CommissionsList from "./widgets/CommissionsList.jsx";
import ProjectsList from "./widgets/ProjectsList.jsx";
import { Table, TableBody, TableCell, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  apiClientHolder: {
    display: "flex",
  },
  actionComponentBox: {
    flex: 1,
    marginLeft: "0.5em",
    marginRight: "0.5em",
  },
  homePageTitle: {
    marginLeft: "20px",
  },
  "MuiTableRow-hover": {
    cursor: "pointer",
  },
  homePageTable: {
    verticalAlign: "top",
  },
}));

const RootComponent: React.FC<{}> = () => {
  const token = window.localStorage.getItem("pluto:access-token");
  const classes = useStyles();

  return (
    <div>
      <h3 className={classes.homePageTitle}>Welcome to Pluto</h3>
      {token ? (
        <Table>
          <TableRow>
            <TableCell className={classes.homePageTable}>
              <CommissionsList />
            </TableCell>
            <TableCell className={classes.homePageTable}>
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
};

export default RootComponent;
