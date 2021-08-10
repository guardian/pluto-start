import React from "react";
import { ProjectsPanelProps, usePanelStyles } from "./PanelsCommon";
import { Link, Paper } from "@material-ui/core";
import PanelLauncher from "./PanelLauncher";
import { useStyles } from "../CommonStyles";
import clsx from "clsx";

interface HelpPanelProps extends ProjectsPanelProps {
  hideRequested: () => void;
}

const HelpPanel: React.FC<HelpPanelProps> = (props) => {
  const commonClasses = useStyles();
  const panelStyles = usePanelStyles();

  return (
    <Paper className={clsx(props.className, panelStyles.panel)}>
      <PanelLauncher
        buttonLabel="Help"
        onClick={() =>
          window.open(
            "https://docs.google.com/document/d/1QG9mOu_HDBoGqQs7Dly0sxifk4w9vaJiDiWdi3Uk1a8",
            "_blank"
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
