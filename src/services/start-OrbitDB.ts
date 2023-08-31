import { defaultDatabaseDir } from "./config";
import { ux } from "@oclif/core";

// return: OrbitDB
const startOrbitDB = async (offline: boolean, showSpinner: boolean): Promise<any> => {
  if (showSpinner) ux.action.start("Starting OrbitDB");
  const { startIpfs } = await import("./start-ipfs.js");
  try {
    const ipfs = await startIpfs(!offline);
    // @ts-ignore
    const directory: string = defaultDatabaseDir;
    // @ts-ignore
    const { createOrbitDB } = await import("@orbitdb/core");
    const orbitdb = createOrbitDB({ ipfs, directory })
    if (showSpinner) ux.action.stop();
    return orbitdb;
  } catch (error) {
    if (showSpinner) ux.action.stop("Failed:");
    throw new Error("An error occured while starting OrbitDB");
  }
};

export { startOrbitDB };
