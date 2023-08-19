import { defaultDatabaseDir } from "./config";
import { ux } from "@oclif/core";

// return: OrbitDB
const startOrbitDB = async (offline = true): Promise<any> => {
  ux.action.start("Starting OrbitDB");
  const { startIpfs } = await import("./start-ipfs.js");
  try {
    const ipfs = await startIpfs(!offline);
    // @ts-ignore
    const peerId = await ipfs.id();
    const directory: string = defaultDatabaseDir;
    // @ts-ignore
    const { default: OrbitDB } = await import("orbit-db");
    const orbitdb = OrbitDB.createInstance(ipfs, {
      offline,
      directory,
      id: peerId,
    });
    ux.action.stop();
    return orbitdb;
  } catch (error) {
    ux.action.stop("Failed:");
    console.error("An error occured while starting OrbitDB", error);
    throw new Error("An error occured while starting OrbitDB");
  }
};

export { startOrbitDB };
