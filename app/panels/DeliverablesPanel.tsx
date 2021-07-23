import React, { useContext, useEffect, useState } from "react";
import { ProjectsPanelProps } from "./PanelsCommon";
import { UserContext } from "pluto-headers";
import { Paper } from "@material-ui/core";
import PanelLauncher from "./PanelLauncher";
import { GetMyRecentOpenProjects } from "../services/PlutoCore";

const DeliverablesPanel: React.FC<ProjectsPanelProps> = (props) => {
  const userContext = useContext(UserContext);
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
    <Paper className={props.className}>
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
