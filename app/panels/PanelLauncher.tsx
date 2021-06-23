import React from "react";
import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import { ChevronRight } from "@material-ui/icons";

interface LauncherProps {
  caption?: string;
  children?: React.ReactFragment;
  buttonLabel: string;
  buttonVariant?: "text" | "outlined" | "contained";
  onClick: () => void;
}

const useStyles = makeStyles((theme) => ({
  caption: {
    fontSize: "1.4em",
  },
  captionContainer: {
    maxWidth: "70%",
  },
}));

const PanelLauncher: React.FC<LauncherProps> = (props) => {
  const classes = useStyles();

  return (
    <Grid
      container
      direction="row"
      justify="space-between"
      spacing={3}
      alignItems="center"
    >
      <Grid item className={classes.captionContainer}>
        {props.children ? props.children : null}
        {props.caption && !props.children ? (
          <Typography className={classes.caption}>{props.caption}</Typography>
        ) : null}
      </Grid>
      <Grid item>
        <Button
          onClick={props.onClick}
          variant={props.buttonVariant}
          endIcon={<ChevronRight />}
        >
          {props.buttonLabel}
        </Button>
      </Grid>
    </Grid>
  );
};

export default PanelLauncher;
