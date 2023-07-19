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
  sync: false,
}

/**
* @brief Open a DB
*
* @param orbitdb the orbitdb instance (src/services/start-OrbitDB.ts)
* @param name the resolved name of the DB (src/utils/resolve-DBIdByName.ts); if the name is not resolved: set create to true
* @param type the type of the DB
* @param options the options to pass to orbitdb
*
* @return Store (orbit-db-store)
*/
const openDB = async (orbitdb: any, name: string, type: DBType, options: OpenDBOptions = {}) => {
  if (options.replicate === undefined || options.replicate === null) {
    options.replicate = defaultOpenDBOptions.replicate
  }

  if (options.create === undefined || options.create === null) {
    options.create = defaultOpenDBOptions.create
  }

  if (options.localOnly === undefined || options.localOnly === null) {
    options.localOnly = defaultOpenDBOptions.localOnly
  }

  if (options.sync === undefined || options.sync === null) {
    options.sync = defaultOpenDBOptions.sync
  }

  const db = await orbitdb.open(name, {
    type,
    replicate: options.replicate,
    create: options.create,
    localOnly: options.localOnly,
    sync: options.sync,
  })
  try {
    await db.loadFromSnapshot()
  } catch (_) {}
  return db
}
