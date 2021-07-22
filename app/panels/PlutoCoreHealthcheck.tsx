import React, { SetStateAction, useEffect, useState } from "react";
import axios from "axios";
import { Alert } from "@material-ui/lab";

interface PlutoCoreHealthcheckProps {
  onConnectionRestored?: () => void;
}

const PlutoCoreHealthcheck: React.FC<PlutoCoreHealthcheckProps> = (props) => {
  const [healthcheckStatus, setHealthcheckStatus] = useState(true);
  const [dbStatus, setDbStatus] = useState(true);

  useEffect(() => {
    console.log("initiating pluto core healthchecker");
    const timerId = window.setInterval(checkHealthStatus, 10000);
    checkHealthStatus();

    return () => {
      console.log("removing pluto core healthchecker");
      window.clearInterval(timerId);
    };
  }, []);

  const checkDidPass: SetStateAction<boolean> = (prevValue: boolean) => {
    if (!prevValue && props.onConnectionRestored) {
      props.onConnectionRestored();
    }
    return true;
  };

  const checkHealthStatus = async () => {
    try {
      const response = await axios.get("/pluto-core/api/healthcheck", {
        validateStatus: () => true,
      });
      switch (response.status) {
        case 200:
          setHealthcheckStatus(checkDidPass);
          if (response.data.hasOwnProperty("database")) {
            if (response.data.database === "ok") {
              setDbStatus(true);
            } else {
              setDbStatus(false);
            }
          }
          break;
        case 404:
          console.error(
            "Could not perform pluto-core healthcheck, got 404. This should not happen."
          );
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.error(
            "Pluto-core healthcheck returned ",
            response.status,
            " something is wrong"
          );
          setHealthcheckStatus(false);
          break;
        default:
          console.error(
            "pluto-core healthcheck returned an unexpected response ",
            response.status,
            " don't know what to do about that."
          );
          break;
      }
    } catch (err) {
      console.error("Could not perform pluto-core healthcheck: ", err);
    }
  };

  if (!healthcheckStatus) {
    return (
      <Alert severity="error">
        pluto-core may have problems, contact multimediatech if you are
        experiencing difficulties
      </Alert>
    );
  }
  if (!dbStatus) {
    return (
      <Alert severity="error">
        pluto-core is having database issues, you may experience problems
      </Alert>
    );
  }
  return <></>;
};

export default PlutoCoreHealthcheck;
