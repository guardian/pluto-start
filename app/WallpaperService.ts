import React from "react";

async function LoadWallpaperManifest(): Promise<WallpaperManifest | undefined> {
  const response = await fetch("/meta/wallpaper-config.json");
  switch (response.status) {
    case 200:
      const content = await response.json();
      return content as WallpaperManifest;
    case 404:
      console.log("No wallpaper configuration was defined");
      return undefined;
    default:
      const error = await response.text();
      console.error(
        `Could not load wallpaper configuration: ${response.status}`,
        error
      );
  }
}

export { LoadWallpaperManifest };
