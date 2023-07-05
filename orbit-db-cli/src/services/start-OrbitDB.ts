import { defaultDatabaseDir } from "./config";
import { startIpfs } from "./start-ipfs";
// @ts-ignore
import OrbitDB from 'orbit-db';

const startOrbitDB = async (): Promise<OrbitDB> => {
  try {
    const ipfs = await startIpfs();
    const peerId = ipfs.id;
    const directory: string = process.env.ORBITDB_PATH || defaultDatabaseDir;
    const orbitdb = OrbitDB.createInstance(ipfs, { directory: directory, id: peerId });
    return orbitdb;
  } catch (error) {
    throw new Error('An error occured while starting OrbitDB');
  }
}

export { startOrbitDB };
