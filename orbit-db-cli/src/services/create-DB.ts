import { defaultDatabaseDir } from './config';

type DBType = 'feed' | 'counter' | 'eventlog' | 'docstore' | 'keyvalue';

export { DBType };

// orbitdb: OrbitDB
const createDB = async (orbitdb: any, name: string, type: DBType, overwrite: boolean = false, directory: string = defaultDatabaseDir) => {
    const db = await orbitdb.create(name, type, { overwrite, directory });
    return db;
}

export { createDB };
