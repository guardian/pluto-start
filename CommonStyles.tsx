/**
 * This file replaces appgeneric.css and contains styles common to all components
 */
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    "& hr": {
      marginLeft: "2em",
      marginRight: "2em",
    },
  },
  appContainer: {
    display: "flex",
  },
  actionComponentBox: {
    border: "2px solid black",
    borderRadius: "12px",
    backgroundColor: "aliceblue",
    minHeight: "600px",
  },
  boxheader: {
    "& h2": {
      fontSize: "1em",
      fontWeight: "bold",
      backgroundColor: "mediumpurple",
      margin: "0",
      padding: "0.1em",
      marginBottom: "1em",
      backgroundClip: "border-box",
      overflow: "hidden",
    },
  },
  centered: {
    "& div": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      flexDirection: "column",
    },
  },
  loadingImage: {
    minWidth: "200px",
    maxHeight: "50px",
    flex: "1 1 0",
    objectFit: "cover",
  },
  urlError: {
    padding: "40px",
  },
  errorCentered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    flexDirection: "column",
    fontSize: "40px",
  },
  error: {
    color: theme.palette.warning.main,
  },
}));

export { useStyles };
