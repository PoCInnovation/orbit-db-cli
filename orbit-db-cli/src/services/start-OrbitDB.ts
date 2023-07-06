import { defaultDatabaseDir } from "./config";

const startOrbitDB = async () => {
  const { startIpfs } = await import("./start-ipfs.js");
  try {
    const ipfs = await startIpfs();
    // @ts-ignore
    const peerId = ipfs.id;
    const directory: string = process.env.ORBITDB_PATH || defaultDatabaseDir;
    // @ts-ignore
    const OrbitDB = await import("orbit-db");
    const orbitdb = OrbitDB.createInstance(ipfs, { directory: directory, id: peerId });
    return orbitdb;
  } catch (error) {
    throw new Error('An error occured while starting OrbitDB');
  }
}

export { startOrbitDB };
