import React, { useContext, useEffect, useState } from "react";
import { ProjectsPanelProps, usePanelStyles } from "./PanelsCommon";
import { UserContext } from "@guardian/pluto-headers";
import { Paper } from "@material-ui/core";
import PanelLauncher from "./PanelLauncher";
import { GetMyRecentOpenProjects } from "../services/PlutoCore";
import clsx from "clsx";

const DeliverablesPanel: React.FC<ProjectsPanelProps> = (props) => {
  const panelClasses = usePanelStyles();

  const [recentOpenProjects, setRecentOpenProjects] = useState<PlutoProject[]>(
    []
  );

  useEffect(() => {
    GetMyRecentOpenProjects(5)
      .then((results) => {
        const [projects, events] = results;
        setRecentOpenProjects(projects);
        if (props.onLoaded) props.onLoaded(projects.length > 0);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <Paper className={clsx(props.className, panelClasses.panel)}>
      <PanelLauncher
        buttonLabel="Search"
        onClick={() => window.location.assign("/deliverables/search")}
        caption="Search for deliverables"
      />
      {recentOpenProjects.map((proj, idx) => (
        <PanelLauncher
          key={idx}
          buttonLabel="Deliverables"
          onClick={() =>
            window.location.assign(`/deliverables/project/${proj.id}`)
          }
          caption={`Add deliverables to ${proj.title}`}
        />
      ))}
    </Paper>
  );
};

export default DeliverablesPanel;
