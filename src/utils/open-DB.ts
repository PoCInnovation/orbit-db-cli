import { DBType } from './create-DB';

export { openDB };

/**
* @brief Open a DB
*
* @param orbitdb the orbitdb instance (src/services/start-OrbitDB.ts)
* @param name the resolved name of the DB (src/utils/resolve-DBIdByName.ts); if the name is not resolved: set create to true
* @param type the type of the DB
* @param replicate if true, the DB will be replicated with other
* @param create if true, the DB will be created (if it does not exist)
* @param localOnly if true, throw an error if the DB can't be found locally
*
* @return
*/
const openDB = async (orbitdb: any, name: string, type: DBType, replicate: boolean = false, create: boolean = false, localOnly: boolean = false) => {
  const db = await orbitdb.open(name, {
    replicate,
    type,
    create,
    localOnly,
  });
  return db;
}
