import React, { useContext, useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@material-ui/core";
import {
  SystemNotifcationKind,
  SystemNotification,
  UserContext,
} from "pluto-headers";
import PanelLauncher from "./PanelLauncher";
import { ProjectsPanelProps } from "./PanelsCommon";
import { useStyles as useCommonStyles } from "../CommonStyles";
import { GetMyRecentOpenProjects } from "../services/PlutoCore";
import { formatRelative, parseISO } from "date-fns";

const ProjectsPanel: React.FC<ProjectsPanelProps> = (props) => {
  const userContext = useContext(UserContext);
  const commonClasses = useCommonStyles();

  const [lastOpenedProject, setLastOpenedProject] = useState<
    PlutoProject | undefined
  >(undefined);
  const [lastOpenedAt, setLastOpenedAt] = useState<Date | undefined>(undefined);

  useEffect(() => {
    GetMyRecentOpenProjects(1)
      .then((results) => {
        const [projects, events] = results;
        setLastOpenedProject(projects.length > 0 ? projects[0] : undefined);

        try {
          if (events.length > 0) {
            const lastOpenedDate = parseISO(events[0].at);
            setLastOpenedAt(lastOpenedDate);
          }
        } catch (err) {
          console.error(
            "Could not get time from ",
            events[0],
            " field 'at': ",
            err
          );
        }
      })
      .catch((err) => {
        console.error(
          "Could not receive last opened project information: ",
          err
        );
        SystemNotification.open(
          SystemNotifcationKind.Warning,
          "Could not get last opened project"
        );
      });
  }, []);

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
        disabled={!lastOpenedProject}
      >
        {lastOpenedProject ? (
          <Typography className={commonClasses.secondaryPara}>
            You last opened "{lastOpenedProject.title}"
            {lastOpenedAt
              ? ` at ${formatRelative(lastOpenedAt, Date.now())}`
              : ""}
          </Typography>
        ) : undefined}
      </PanelLauncher>
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
