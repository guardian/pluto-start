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
import moment from "moment";
import { SystemNotifcationKind, SystemNotification } from "pluto-headers";

async function getProjects(user) {
  const {
    status,
    data: { result: projects = [] },
  } = await Axios.put(
    `/pluto-core/api/project/list?length=16`,
    {
      user: user,
      match: "W_CONTAINS",
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("pluto:access-token")}`,
      },
    }
  );

  if (status !== 200) {
    throw new Error("Unable to fetch projects");
  }
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
      userName: "",
    };
  }

  componentDidMount() {
    const getUserAndProjects = async () => {
      try {
        const user = await getUserName();
        console.log("User is: " + user);
        this.setState({ userName: user });
        const projects = await getProjects(this.state.userName);
        this.setState({ projects: projects });
      } catch (error) {
        SystemNotification.open(
          SystemNotifcationKind.Error,
          "Could not load projects. If this problem persists contact multimediatech@theguardian.com"
        );
        console.error("Could not get user or projects:", error);
      }
    };

    getUserAndProjects();
  }

  render() {
    const getProjectsContent = (projects) => {
      let content = [];
      for (let i = 0; i < 16; i++) {
        if (projects[i]) {
          const item = projects[i];
          content.push(
            <TableRow
              hover={true}
              onClick={() => {
                window.location.href = `/pluto-core/project/${item.id}`;
              }}
              key={item.id}
            >
              <TableCell>{item.title}</TableCell>
              <TableCell>
                {moment(item.created).format("ddd Do MMM [at] H:mm")}
              </TableCell>
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
                    <strong>My Projects</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              {!!this.state.projects.length ? (
                <TableBody>{getProjectsContent(this.state.projects)}</TableBody>
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={2}>No projects found</TableCell>
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
