import {DBType} from './create-DB'

export {openDB, OpenDBOptions}

type OpenDBOptions = {
  replicate?: boolean,
  create?: boolean,
  localOnly?: boolean,
  sync?: boolean
}

const defaultOpenDBOptions = {
  replicate: false,
  create: false,
  localOnly: false,
  sync: false
}

/**
* @brief Open a DB
*
* @param orbitdb the orbitdb instance (src/services/start-OrbitDB.ts)
* @param name the resolved name of the DB (src/utils/resolve-DBIdByName.ts); if the name is not resolved: set create to true
* @param type the type of the DB
* @param options the options to pass to orbitdb
*
* @return
*/
const openDB = async (orbitdb: any, name: string, type: DBType, options: OpenDBOptions = {}) => {
  const db = await orbitdb.open(name, {
    type,
    replicate: options.replicate || defaultOpenDBOptions.replicate,
    create: options.create || defaultOpenDBOptions.create,
    localOnly: options.localOnly || defaultOpenDBOptions.localOnly,
    sync: options.sync || defaultOpenDBOptions.sync
  })
  return db
}
