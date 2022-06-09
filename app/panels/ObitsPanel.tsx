import React, { useEffect, useState } from "react";
import { ProjectsPanelProps, usePanelStyles } from "./PanelsCommon";
import PanelLauncher from "./PanelLauncher";
import clsx from "clsx";
import { Paper, Typography } from "@material-ui/core";
import { GetRecentObits } from "../services/PlutoCore";
import { useStyles as useCommonStyles } from "../CommonStyles";

interface ProjectSummary {
  title: string;
  id: number;
  owner: string;
  subject: string;
}

const ObitsPanel: React.FC<ProjectsPanelProps & { obitsToShow: number }> = (
  props
) => {
  const classes = usePanelStyles();
  const commonClasses = useCommonStyles();

  const [recentObits, setRecentObits] = useState<ProjectSummary[]>([]);

  const jumpToObits = () => window.location.assign("/pluto-core/obituaries/");
  const openProject = (projectId: number) =>
    window.location.assign(`/pluto-core/project/${projectId}`);

  useEffect(() => {
    GetRecentObits(props.obitsToShow)
      .then((projects) => {
        const obits = projects.map((proj) =>
          proj.isObitProject
            ? {
                title: proj.title,
                id: proj.id,
                owner: proj.user,
                subject: proj.isObitProject,
              }
            : undefined
        );

        setRecentObits(
          obits.filter((o) => o !== undefined) as ProjectSummary[]
        );
      })
      .catch((err) => {
        console.error(`Could not load obituaries: ${err}`);
      });
  }, [props.obitsToShow]);

  function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  return (
    <>
      <Paper className={clsx(props.className, classes.panel)}>
        <PanelLauncher
          buttonLabel="Obituaries"
          caption="Find an obituary"
          onClick={jumpToObits}
        />
        {recentObits.map((obit, k) => (
          <PanelLauncher
            key={k}
            buttonLabel="Project page"
            caption={toTitleCase(obit.subject)}
            onClick={() => openProject(obit.id)}
          >
            <Typography
              className={commonClasses.secondaryPara}
              style={{ verticalAlign: "top", display: "inline" }}
            >
              {obit.title} created by {obit.owner}
            </Typography>
          </PanelLauncher>
        ))}
      </Paper>
    </>
  );
};

export default ObitsPanel;
