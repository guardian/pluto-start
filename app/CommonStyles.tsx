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
  "@global": {
    ".MuiPaper-root": {
      backgroundColor: theme.palette.type == "dark" ? "#424242A0" : "#FBFBFBA0",
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
  secondaryPara: {
    color: theme.palette.text.secondary,
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    lineHeight: theme.typography.subtitle2.lineHeight,
    letterSpacing: theme.typography.subtitle2.letterSpacing,
    paddingLeft: "0.8em",
  },
  clickable: {
    cursor: "pointer",
  },
  bigInfoDialog: {
    "max-width": "95%",
    "min-width": "60%",
  },
  dialogPara: {
    marginBottom: "0.4em",
  },
  dialogButtonSingle: {
    maxWidth: "300px",
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: "1em",
  },
}));

export { useStyles };
