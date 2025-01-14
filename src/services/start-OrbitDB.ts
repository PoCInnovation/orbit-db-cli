import { defaultDatabaseDir } from "./config";

// return: OrbitDB
const startOrbitDB = async (offline = true): Promise<any> => {
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
    return orbitdb;
  } catch (error) {
    console.error("An error occured while starting OrbitDB", error);
    throw new Error("An error occured while starting OrbitDB");
  }
};

export { startOrbitDB };
