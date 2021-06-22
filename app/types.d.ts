interface WallpaperManifest {
  changeWallpaper?: boolean; //if true, rotate the wallpapers; if false, just use the first
  onScreenFor?: number; //if changing wallpapers, duration (in seconds) that each stays on the screen.
  wallpaperUrls: string[]; //urls to find the wallpapers
  randomise?: boolean;
  transitionTime?: number; //if changing wallpapers, duration (in seconds) of the fade
}
