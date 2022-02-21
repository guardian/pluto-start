import axios from "axios";

function dedupeAuditLogs(
  entries: PlutoAuditLog[],
  limit: number
): PlutoAuditLog[] {
  /*
    I really don't find this pleasant or pretty, but I could not think of a nicer way to get this de-duplicate done
    efficiently
     */
  let deDuped: PlutoAuditLog[] = [];
  let countedIds: string[] = [];

  for (let i = 0; i < entries.length; ++i) {
    const elem = entries[i];
    if (!countedIds.includes(elem.targetObjectId)) {
      deDuped = deDuped.concat(elem);
      countedIds = countedIds.concat(elem.targetObjectId);
    }
    if (deDuped.length >= limit) break;
  }
  return deDuped;
}

/**
 * Queries the audit log in pluto-core to find the most recent
 * @constructor
 */
async function GetMyRecentOpenProjects(
  wantedCount: number
): Promise<[PlutoProject[], PlutoAuditLog[]]> {
  //we get the default number, even though we want less; this is to de-duplicate on the item id and still meet our wanted count
  const response = await axios.get<PlutoCoreListResponse<PlutoAuditLog>>(
    `/pluto-core/api/history/my/actions?actionType=OpenProject&limit=${wantedCount}`
  );

  const deDuped = dedupeAuditLogs(response.data.result, wantedCount);

  const projectInformationPromise = Promise.all(
    deDuped.map((event) =>
      axios.get<PlutoCoreResponse<PlutoProject>>(
        `/pluto-core/api/project/${event.targetObjectId}`
      )
    )
  );

  const projectInformation = await projectInformationPromise;
  return [projectInformation.map((proj) => proj.data.result), deDuped];
}

export { GetMyRecentOpenProjects };

export const getFileData = async (id: number): Promise<FileEntry[]> => {
  try {
    const {
      status,
      data: { files },
    } = await axios.get<PlutoFilesAPIResponse<FileEntry[]>>(
      `/pluto-core/api/project/${id}/files`
    );

    if (status === 200) {
      return files;
    }

    throw new Error(`Could not get project data for project ${id}. ${status}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getStorageData = async (id: number): Promise<StorageEntry> => {
  try {
    const {
      status,
      data: { result },
    } = await axios.get<PlutoApiResponse<StorageEntry>>(
      `/pluto-core/api/storage/${id}`
    );

    if (status === 200) {
      return result;
    }

    throw new Error(`Could not get storage data for storage ${id}. ${status}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const openProject = async (id: number) => {
  const fileResult = await getFileData(id);
  const storageResult = await getStorageData(fileResult[0].storage);
  const pathToUse = storageResult.clientpath
    ? storageResult.clientpath
    : storageResult.rootpath;
  console.log("About to access a project with this path: " + pathToUse);
  console.log(
    "About to access a project with this file name: " + fileResult[0].filepath
  );
  window.open(
    `pluto:openproject:${pathToUse}/${fileResult[0].filepath}`,
    "_blank"
  );
};
