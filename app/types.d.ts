interface WallpaperManifest {
  changeWallpaper?: boolean; //if true, rotate the wallpapers; if false, just use the first
  onScreenFor?: number; //if changing wallpapers, duration (in seconds) that each stays on the screen.
  wallpaperUrls: string[]; //urls to find the wallpapers
  randomise?: boolean;
  transitionTime?: number; //if changing wallpapers, duration (in seconds) of the fade
}

type ProductionOffice = "UK" | "US" | "Aus";
type ProjectStatus = "New" | "In Production" | "Held" | "Completed" | "Killed";

interface PlutoProject {
  id: number;
  projectTypeId: number;
  title: string;
  created: string;
  user: string;
  workingGroupId: number;
  commissionId: number;
  deletable: boolean;
  deep_archive: boolean;
  sensitive: boolean;
  status: ProjectStatus;
  productionOffice: ProductionOffice;
}

interface PlutoAuditLog {
  id: number;
  username: string;
  actionType: string;
  targetObjectId: string;
  at: string;
  data?: string;
}

interface PlutoCoreListResponse<T> {
  status: string;
  count: number;
  result: T[];
}

interface PlutoCoreResponse<T> {
  status: string;
  entry: T;
}
