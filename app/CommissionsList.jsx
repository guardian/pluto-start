import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@material-ui/core";
import React from "react";
import Axios from "axios";
import {
  loadInSigningKey,
  validateAndDecode,
  getRawToken,
} from "./JwtHelpers.jsx";

async function getCommissions(user) {
  const {
    status,
    data: { result: commissions = [] },
  } = await Axios.put(`/pluto-core/api/pluto/commission/list?length=16`, {
    owner: user,
    match: "W_CONTAINS",
  });

  if (status !== 200) {
    throw new Error("Unable to fetch commissions");
  }
  return commissions;
}

async function getUserName() {
  const signingKey = await loadInSigningKey();
  const decodedData = await validateAndDecode(getRawToken(), signingKey, null);
  return decodedData.preferred_username ?? decodedData.username;
}

class CommissionsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commissions: [],
      userName: "",
    };
  }

  componentDidMount() {
    const getUserAndCommissions = async () => {
      try {
        const user = await getUserName();
        console.log("User is: " + user);
        this.setState({ userName: user });
        const commissions = await getCommissions(this.state.userName);
        this.setState({ commissions: commissions });
      } catch (error) {
        console.error("Could not get user or commissions:", error);
      }
    };

    getUserAndCommissions();
  }

  render() {
    const getCommissionsContent = (commissions) => {
      let content = [];
      for (let i = 0; i < 16; i++) {
        if (commissions[i]) {
          const item = commissions[i];
          content.push(
            <TableRow
              hover={true}
              onClick={() => {
                window.location.href = `/pluto-core/commission/${item.id}`;
              }}
              key={item.id}
            >
              <TableCell>{item.title}</TableCell>
              <TableCell>{new Date(item.created).toLocaleString()}</TableCell>
            </TableRow>
          );
        } else {
          content.push(
            <TableRow>
              <TableCell colSpan={2}>&nbsp;</TableCell>
            </TableRow>
          );
        }
      }
      return content;
    };
    return (
      <>
        <Paper elevation={3} className="home-page-comissions-table">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={2}>
                    <strong>Latest Commissions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              {!!this.state.commissions.length ? (
                <TableBody>
                  {getCommissionsContent(this.state.commissions)}
                </TableBody>
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={2}>No commissions found</TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </Paper>
      </>
    );
  }
}

export default CommissionsList;
