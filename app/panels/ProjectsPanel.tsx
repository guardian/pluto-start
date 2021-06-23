import React, { useContext } from "react";
import { Paper } from "@material-ui/core";
import UserContext from "../context/UserContext";
import PanelLauncher from "./PanelLauncher";
import { ProjectsPanelProps } from "./PanelsCommon";

const ProjectsPanel: React.FC<ProjectsPanelProps> = (props) => {
  const userContext = useContext(UserContext);

  const launchLastProject = () => {
    alert(
      `I would launch last project for ${userContext.profile?.username}, but it's not been implemented yet`
    );
  };
  return (
    <Paper className={props.className}>
      <PanelLauncher
        buttonLabel="Open Project"
        onClick={launchLastProject}
        caption={`Work on the last edit that I had open`}
      />
      <PanelLauncher
        buttonLabel="Project List"
        onClick={() => window.location.assign("/pluto-core/project/?mine")}
        caption="Search for another of my edits"
      />
      <PanelLauncher
        buttonLabel="Create Project"
        onClick={() => window.location.assign("/pluto-core/project/new")}
        caption="Create a new edit project in an existing piece of work"
      />
      <PanelLauncher
        buttonLabel="Create Commission"
        onClick={() => window.location.assign("/pluto-core/commission/new")}
        caption="Start a completely new piece of work"
      />
    </Paper>
  );
};

export default ProjectsPanel;
