import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { LoadWallpaperManifest } from "./WallpaperService";
import { Fade } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  wallpaperHolder: {
    position: "absolute",
    top: "0",
    left: "0",
    margin: "0",
    padding: "0",
    width: "100vw",
    height: "100vh",
    objectFit: "cover",
    zIndex: -1,
  },
}));

const Wallpaper: React.FC = () => {
  const [selectedImageHolder, setSelectedImageHolder] = useState(0);
  const [config, setConfig] = useState<WallpaperManifest | undefined>(
    undefined
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [loadImmediate, setLoadImmediate] = useState(true);

  const classes = useStyles();

  const imageHolders = [
    React.createRef<HTMLImageElement>(),
    React.createRef<HTMLImageElement>(),
  ];

  useEffect(() => {
    LoadWallpaperManifest()
      .then((maybeContent) => setConfig(maybeContent))
      .catch((err) => {
        console.log("Could not set up wallpaper");
      });
  }, []);

  const switchOverImageAfterDelay = () => {
    const delayMs = loadImmediate ? 10 : (config?.onScreenFor ?? 60) * 1000;

    console.log("Image loaded, switching over after ", delayMs, "ms");
    window.setTimeout(() => {
      const targetImage = selectedImageHolder == 0 ? 1 : 0;
      if (imageHolders[targetImage].current) {
        // @ts-ignore
        imageHolders[targetImage].current.removeEventListener(
          "load",
          switchOverImageAfterDelay
        );
      }
      setSelectedImageHolder(targetImage);
      setImageIndex((prev) =>
        config && imageIndex >= config.wallpaperUrls.length - 1 ? 0 : prev + 1
      );
      setLoadImmediate(false);
    }, delayMs);
  };

  const loadNextImage = () => {
    console.log(
      `Loading in next image ${imageIndex} ${config?.wallpaperUrls[imageIndex]}`
    );
    const targetImage = selectedImageHolder == 0 ? 1 : 0;
    if (config) {
      // @ts-ignore
      imageHolders[targetImage].current.src = config.wallpaperUrls[imageIndex];
      // @ts-ignore
      imageHolders[targetImage].current.addEventListener(
        "load",
        switchOverImageAfterDelay
      );
    } else {
      console.log("No config was loaded");
    }
  };

  useEffect(() => {
    if (config && config.wallpaperUrls) {
      loadNextImage();
    }
  }, [config]);

  const timeouts = {
    enter: (config?.transitionTime ?? 3) * 1000,
    exit: (config?.transitionTime ?? 3) * 1000,
  };

  return (
    <>
      <Fade
        in={selectedImageHolder == 0 && !!config}
        timeout={timeouts}
        onExited={loadNextImage}
      >
        <img ref={imageHolders[0]} className={classes.wallpaperHolder} />
      </Fade>
      <Fade
        in={selectedImageHolder == 1 && !!config}
        timeout={timeouts}
        onExited={loadNextImage}
      >
        <img ref={imageHolders[1]} className={classes.wallpaperHolder} />
      </Fade>
    </>
  );
};

export default Wallpaper;
