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
import { loadInSigningKey, validateAndDecode, getRawToken } from "./JwtHelpers.jsx";


async function getCommissions (user) {

  const {
    status,
    data: { result: commissions = [] },
  } = await Axios.put(`/pluto-core/api/pluto/commission/list?length=16`,{"owner": user, "match":"W_CONTAINS"});

  if (status !== 200) {
    throw new Error("Unable to fetch commissions");
  }
  //const commissionData = await Axios.get(`/pluto-core/api/commission?length=16`);
  //console.log(commissions);
  return commissions;
}

async function isLoggedIn () {
  try {
    const { status, data } = await Axios.get(`/pluto-core/api/isLoggedIn`);

    if (status === 200) {
      return data;
    }

    throw new Error(`Could not retrieve who is logged in. ${status}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

async function getUserName() {
  const signingKey = await loadInSigningKey();
  const decodedData = await validateAndDecode(getRawToken(), signingKey, null);
  console.log("Got profile", decodedData);
  //console.log("User from token: " + decodedData.username);
  return decodedData.preferred_username ?? decodedData.username;
}


class CommissionsList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      commissions: [],
      userName: ''
    };
  }

  componentDidMount() {
    const getUserAndCommissions = async () => {
      try {
        const user = await getUserName();
        console.log("User is: " + user);
        this.setState({ userName: user })
        const commissions = await getCommissions(this.state.userName);
        this.setState({ commissions: commissions })
      } catch (error) {
        console.error("Could not get user or commissions:", error);
      }
    };

    getUserAndCommissions();

    //const updateCommissions = async () => {
    //  const commissions = await getCommissions(this.state.userName);
    //  this.setState({ commissions: commissions })
    //};

    //updateCommissions();

  }

  //componentDidUpdate() {
  //  const updateCommissions = async () => {
  //    const commissions = await getCommissions();
  //    this.setState({ commissions: commissions })
  //  };

  //  updateCommissions();
  //}

  ///const [commissions, setCommissions] = useState([]);


  render() {
    //const token = window.localStorage.getItem("pluto:access-token");
    //console.log(getCommissions());

    //const commissionData = getCommissions();


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
                {this.state.commissions.map(commission => <TableRow hover={true} onClick={() => { window.location.href = (`/pluto-core/commission/${commission.id}`);}} key={commission.id}><TableCell>{commission.title}</TableCell><TableCell>{new Date(commission.created).toLocaleString()}</TableCell></TableRow>)}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2}>
                    No commissions found
                  </TableCell>
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
