import { defaultDatabaseDir } from "./config";

const startOrbitDB = async () => {
  const { startIpfs } = await import("./start-ipfs.js");
  try {
    const ipfs = await startIpfs();
    // @ts-ignore
    const peerId = await ipfs.id();
    const directory: string = process.env.ORBITDB_PATH || defaultDatabaseDir;
    // @ts-ignore
    const { default: OrbitDB } = await import("orbit-db");
    const orbitdb = OrbitDB.createInstance(ipfs, { directory: directory, id: peerId });
    return orbitdb;
  } catch (error) {
    console.error('An error occured while starting OrbitDB', error);
    throw new Error('An error occured while starting OrbitDB');
  }
}

export { startOrbitDB };
