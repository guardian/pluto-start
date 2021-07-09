import React from "react";
import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import { ChevronRight } from "@material-ui/icons";

interface LauncherProps {
  caption?: string;
  children?: React.ReactFragment;
  buttonLabel: string;
  buttonVariant?: "text" | "outlined" | "contained";
  onClick: () => void;
  disabled?: boolean;
}

const useStyles = makeStyles((theme) => ({
  caption: {
    fontSize: "1.4em",
    paddingLeft: "0.4em",
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
      <Grid container direction="column" className={classes.captionContainer}>
        <Grid item>
          {props.caption ? (
            <Typography className={classes.caption}>{props.caption}</Typography>
          ) : null}
        </Grid>
        <Grid>{props.children}</Grid>
      </Grid>
      <Grid item>
        <Button
          onClick={props.onClick}
          variant={props.buttonVariant}
          endIcon={<ChevronRight />}
          disabled={props.disabled}
        >
          {props.buttonLabel}
        </Button>
      </Grid>
    </Grid>
  );
};

export default PanelLauncher;
