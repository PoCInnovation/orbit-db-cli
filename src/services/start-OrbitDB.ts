import { defaultDatabaseDir } from "./config";
import { ux } from "@oclif/core";
import { startIpfs } from "./start-ipfs";

// return: OrbitDB
const startOrbitDB = async (offline: boolean, showSpinner: boolean, ipfsAddress: string | undefined = undefined): Promise<any> => {
  if (showSpinner) ux.action.start("Starting OrbitDB");
  try {
    const ipfs = await startIpfs(!offline, ipfsAddress);
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
