import { makeStyles } from "@material-ui/core";

interface ProjectsPanelProps {
  className?: string;
  onLoaded?: (haveContent: boolean) => void;
}

const usePanelStyles = makeStyles((theme) => ({
  panel: {
    backgroundColor: theme.palette.type == "dark" ? "#424242E5" : "#FBFBFBE5",
  },
}));

export type { ProjectsPanelProps };
export { usePanelStyles };
