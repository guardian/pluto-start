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

async function getProjects (user) {

  const {
    status,
    data: { result: projects = [] },
  } = await Axios.put(`/pluto-core/api/project/list?length=16`,{"user": user, "match":"W_CONTAINS"});

  if (status !== 200) {
    throw new Error("Unable to fetch projects");
  }
  //const commissionData = await Axios.get(`/pluto-core/api/commission?length=16`);
  //console.log(commissions);
  return projects;
}

async function getUserName() {
  const signingKey = await loadInSigningKey();
  const decodedData = await validateAndDecode(getRawToken(), signingKey, null);
  return decodedData.preferred_username ?? decodedData.username;
}


class ProjectsList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      userName: ''
    };
  }

  componentDidMount() {
    const getUserAndProjects = async () => {
      try {
        const user = await getUserName();
        console.log("User is: " + user);
        this.setState({ userName: user })
        const projects = await getProjects(this.state.userName);
        this.setState({ projects: projects })
      } catch (error) {
        console.error("Could not get user or projects:", error);
      }
    };

    getUserAndProjects();

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
                  <strong>My Latest Projects</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            {!!this.state.projects.length ? (
              <TableBody>
                {this.state.projects.map(project => <TableRow hover={true} onClick={() => { window.location.href = (`/pluto-core/project/${project.id}`);}} key={project.id}><TableCell>{project.title}</TableCell><TableCell>{new Date(project.created).toLocaleString()}</TableCell></TableRow>)}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2}>
                    No projects found
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

export default ProjectsList;
