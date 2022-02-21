import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  Grid,
  Icon,
  IconButton,
  Link,
  Paper,
  Typography,
} from "@material-ui/core";
import {
  SystemNotifcationKind,
  SystemNotification,
  UserContext,
} from "pluto-headers";
import PanelLauncher from "./PanelLauncher";
import { ProjectsPanelProps, usePanelStyles } from "./PanelsCommon";
import { useStyles as useCommonStyles } from "../CommonStyles";
import { GetMyRecentOpenProjects, openProject } from "../services/PlutoCore";
import { formatRelative, parseISO } from "date-fns";
import { CancelOutlined, Help, Launch } from "@material-ui/icons";
import PlutoCoreHealthcheck from "./PlutoCoreHealthcheck";
import clsx from "clsx";

const ProjectsPanel: React.FC<ProjectsPanelProps> = (props) => {
  const userContext = useContext(UserContext);
  const commonClasses = useCommonStyles();
  const panelClasses = usePanelStyles();

  const [lastOpenedProject, setLastOpenedProject] = useState<
    PlutoProject | undefined
  >(undefined);
  const [lastOpenedAt, setLastOpenedAt] = useState<Date | undefined>(undefined);
  const [
    healthcheckStateChangeCount,
    setHealthcheckStateChangeCount,
  ] = useState(0);

  const [showingCreateHelp, setShowingCreateHelp] = useState(false);

  useEffect(() => {
    GetMyRecentOpenProjects(1)
      .then((results) => {
        const [projects, events] = results;
        setLastOpenedProject(projects.length > 0 ? projects[0] : undefined);

        try {
          if (events.length > 0) {
            const lastOpenedDate = parseISO(events[0].at);
            setLastOpenedAt(lastOpenedDate);
          }
        } catch (err) {
          console.error(
            "Could not get time from ",
            events[0],
            " field 'at': ",
            err
          );
        }
      })
      .catch((err) => {
        console.error(
          "Could not receive last opened project information: ",
          err
        );
        SystemNotification.open(
          SystemNotifcationKind.Warning,
          "Could not get last opened project"
        );
      });
  }, [healthcheckStateChangeCount]);

  const launchLastProject = async () => {
    if (lastOpenedProject) {
      try {
        await openProject(lastOpenedProject.id);
      } catch (error) {
        SystemNotification.open(
          SystemNotifcationKind.Warning,
          "An error occurred when attempting to open the project."
        );
        console.error(error);
      }
    } else {
      console.error("Can't open last opened project as there is none set");
    }
  };

  return (
    <>
      <Paper className={clsx(props.className, panelClasses.panel)}>
        <PanelLauncher
          buttonLabel="Open Project"
          onClick={launchLastProject}
          caption={`Work on the last edit that I had open`}
          disabled={!lastOpenedProject}
        >
          {lastOpenedProject ? (
            <Typography className={commonClasses.secondaryPara}>
              You last opened "{lastOpenedProject.title}"
              {lastOpenedAt
                ? ` at ${formatRelative(lastOpenedAt, Date.now())}`
                : ""}
              <IconButton
                onClick={() =>
                  (window.location.href = `/pluto-core/project/${lastOpenedProject?.id}`)
                }
              >
                <Launch />
              </IconButton>
            </Typography>
          ) : undefined}
        </PanelLauncher>
        <PanelLauncher
          buttonLabel="Project List"
          onClick={() => window.location.assign("/pluto-core/project/?mine")}
          caption="Search for another of my edits"
        />
        <PanelLauncher
          buttonLabel="Create Project"
          onClick={() => window.location.assign("/pluto-core/project/new")}
          caption="Create a new edit project in an existing piece of work"
        />
        <PanelLauncher
          buttonLabel="Create Commission"
          onClick={() => window.location.assign("/pluto-core/commission/new")}
          caption="Start a completely new piece of work"
        />
        <span
          className={commonClasses.clickable}
          onClick={() => setShowingCreateHelp(true)}
          style={{ marginTop: "0.2em" }}
        >
          <Help />
          <Typography
            className={commonClasses.secondaryPara}
            style={{ verticalAlign: "top", display: "inline" }}
          >
            Should I create a new commission or project?
          </Typography>
        </span>
        <PlutoCoreHealthcheck
          onConnectionRestored={() =>
            setHealthcheckStateChangeCount((prev) => prev + 1)
          }
        />
      </Paper>

      <Dialog
        open={showingCreateHelp}
        onClose={() => setShowingCreateHelp(false)}
        aria-labelledby="create-help-title"
        maxWidth="lg"
        fullWidth={true}
      >
        <DialogTitle style={{ textAlign: "center" }}>
          Should I create a commission or project?
          <IconButton
            onClick={() => setShowingCreateHelp(false)}
            style={{ float: "right" }}
          >
            <CancelOutlined />
          </IconButton>
        </DialogTitle>
        <Typography
          className={commonClasses.dialogPara}
          style={{ textAlign: "center" }}
        >
          <b>
            THINK BEFORE YOU TYPE!! - How would I find this in the future if I
            had not worked on it.
          </b>
        </Typography>

        <Typography className={commonClasses.dialogPara}>
          The purpose of splitting our work into working groups, commissions and
          projects is to make it easier for other people to find your work in
          the future.
          <br />
          This could be for syndication or sales, or it could be for awards
          entries, or to locate specific footage for another edit.
        </Typography>
        <Typography className={commonClasses.dialogPara}>
          The job of a <b>Commission</b> is to hold together edit projects all
          relating to the same content or content series.
          <br />
          For example, a documentary film may well have multiple edit projects,
          graphics projects, audio sweetening.... All of these should live in
          the same Commission, so we can find them later.
          <br />
          At the other extreme, all reactive news projects for a given month
          live in the same commission. This is because every day has multiple
          projects created and we need to keep them together.
        </Typography>
        <Typography className={commonClasses.dialogPara}>
          The job of a <b>Project</b>, on the other hand, is to represent{" "}
          <i>your current edit</i>. Normally, this will live{" "}
          <b>within a pre-existing commission</b> and you should <b>always</b>{" "}
          make an effort to find a relevant commission before you create a new
          one. This will help avoid a situation where we have two, three or more
          commissions all apparently relating to the same thing but with
          slightly different spellings. You can use the Search function in the
          commissions list when creating a project to try to find a relevant
          one.
        </Typography>
        <Typography className={commonClasses.dialogPara}>
          When choosing a name for a project, think how you would search for
          that project if you did not know what it was called. Avoid acronyms
          and try to ensure that key words are included in the title. This will
          make it much more likely to surface when you are using the Search
          function in the Projects list.
        </Typography>
        <Typography variant="h6">Examples</Typography>
        <ul>
          <li className={commonClasses.dialogPara}>
            <Typography>
              <b>I need to record a quick voiceover for a video project</b>
            </Typography>
            <Typography>
              You{" "}
              <b>
                <i>must</i>
              </b>{" "}
              find the commission that the video project belongs to. If it has
              not been created yet then create it as if you were the video
              producer. You{" "}
              <b>
                <i>MUST NOT</i>
              </b>
              create a commission called e.g. &quot;Voice-over for Jim&quot; in
              the &quot;Multimedia Audio&quot; working group because when
              looking for the media nobody is going to look there.
            </Typography>
          </li>
          <li className={commonClasses.dialogPara}>
            <Typography>
              <b>I need to ingest some footage that somebody just gave me</b>
            </Typography>
            <Typography>
              Make sure you ask &quot;somebody&quot; if a project exists already
              and if so where. There is nothing wrong with creating an
              &quot;ingest project&quot; if an edit is already in-progress, but
              make sure that it is in the same commission as the edit project.
              That will ensure that the footage is easily findable.
            </Typography>
          </li>
          <li className={commonClasses.dialogPara}>
            <Typography>
              <b>I have an edit that needs to be done NOW!!!!</b>
            </Typography>
            <Typography>
              Spend 2 minutes in the Commissions page and search for something
              relevant in your working group. If your edit is part of a longer
              running series (e.g. Made in Britain, Anywhere But.... etc.) then
              search for that and see how it has been managed in the past.
              <br />
              <b>Golden rule</b> is less commissions, more projects <i>in</i>{" "}
              commissions.
            </Typography>
          </li>
        </ul>
        <Button
          variant="contained"
          onClick={() => setShowingCreateHelp(false)}
          className={commonClasses.dialogButtonSingle}
        >
          Got it, thanks!
        </Button>
      </Dialog>
    </>
  );
};

export default ProjectsPanel;
