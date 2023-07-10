import { DBType } from './create-DB';

export { openDB };

// orbitdb: OrbitDB
const openDB = async (orbitdb: any, name: string, type: DBType, replicate: boolean = false, create: boolean = false, localOnly: boolean = false) => {
  const db = await orbitdb.open(name, {
    replicate,
    type,
    create,
    localOnly,
  });
  return db;
}
