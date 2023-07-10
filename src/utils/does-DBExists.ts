import { defaultDatabaseDir } from '../services/config';

export { doesDBExists }

/**
* @brief Check if a DB exists
*
* @param orbitdb the orbitdb instance (src/services/stop-OrbitDB.ts)
* @param name the resolved name of the DB (src/utils/resolve-DBIdByName.ts)
*
* @return true if the DB exists
*/
const doesDBExists = async (orbitdb: any, name: string) => {
  const cache = await orbitdb._requestCache(name, defaultDatabaseDir);
  const haveDb = await orbitdb._haveLocalData(cache, name);

  return haveDb;
}
