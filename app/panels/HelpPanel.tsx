import React from "react";
import { ProjectsPanelProps } from "./PanelsCommon";
import { IconButton, Link, Paper, Typography } from "@material-ui/core";
import PanelLauncher from "./PanelLauncher";
import { useStyles } from "../CommonStyles";
import { ArrowDropUp } from "@material-ui/icons";

interface HelpPanelProps extends ProjectsPanelProps {
  hideRequested: () => void;
}

const HelpPanel: React.FC<HelpPanelProps> = (props) => {
  const commonClasses = useStyles();

  return (
    <Paper className={props.className}>
      <PanelLauncher
        buttonLabel="Help"
        onClick={() =>
          window.location.assign(
            "https://docs.google.com/document/d/1QG9mOu_HDBoGqQs7Dly0sxifk4w9vaJiDiWdi3Uk1a8"
          )
        }
        caption="This is all new to me, what should I do?"
      />
      <Link
        className={commonClasses.secondaryPara}
        style={{ cursor: "pointer", paddingLeft: 0 }}
        onClick={props.hideRequested}
      >
        Hide this panel in the future
      </Link>
    </Paper>
  );
};

export default HelpPanel;
