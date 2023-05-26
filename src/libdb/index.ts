// this is taken from https://github.com/orbitdb/orbit-db-control-center/blob/main/src/database/index.js
import {create, IPFS} from 'ipfs';
import OrbitDB from 'orbit-db';
import Identities from 'orbit-db-identity-provider'
import Config from './config';

let orbitdb: OrbitDB;

type DbType = 'counter' | 'eventlog' | 'feed' | 'docstore' | 'keyvalue';

export const initIpfs = async () => {
    const ipfs = await create(Config.ipfs);
    return ipfs;
}

export const initOrbitDb = async (ipfs: IPFS, options = {identity: null}) => {
    const identity = options.identity || await Identities.createIdentity({ id: 'user' });
    orbitdb = await OrbitDB.createInstance(ipfs, { identity, directory: Config.dbDir });
    return orbitdb;
}

export const getDb = async (name: string, type: DbType, permissions: 'public' | 'private', localOnly: boolean) => {
    let accessController = { write: [orbitdb.identity.id] };

    if (!orbitdb) {
        throw new Error('OrbitDB not initialized');
    }
    if (permissions === 'public') {
        accessController = { write: ["*"] };
    }
    let db = await orbitdb.open(name, { create: true, localOnly, type, accessController });
    await db.load();
    return db;
}
