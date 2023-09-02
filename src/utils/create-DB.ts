import { ux } from "@oclif/core";
import { DBType } from './db-types';

export { createDB, CreateDBOptions };

import { dropDB } from './drop-DB';

type CreateDBOptions = {
  overwrite?: boolean;
  showSpinner: boolean;
  sync?: boolean;
};

const defaultCreateDBOptions = {
  overwrite: false,
  showSpinner: true,
  sync: false,
};

// orbitdb: OrbitDB
/**
 * @brief Create a DB
 *
 * @param orbitdb the orbitdb instance (src/services/start-OrbitDB.ts)
 * @param name the name of the DB (not the address[resolved])
 * @param type the type of the DB
 * @param options the options to pass to orbitdb
 *
 * @return
 */
const createDB = async (
  orbitdb: any,
  name: string,
  type: DBType,
  options: CreateDBOptions,
) => {
  // @ts-ignore
  const { IPFSBlockStorage, LevelStorage, ComposedStorage } = await import("@orbitdb/core");
  const entryStorage = await ComposedStorage(await IPFSBlockStorage({ipfs: orbitdb.ipfs}), await LevelStorage());

  if (options.overwrite === undefined || options.overwrite === null) {
    options.overwrite = defaultCreateDBOptions.overwrite;
  }

  if (options.showSpinner === undefined || options.showSpinner === null) {
    options.showSpinner = defaultCreateDBOptions.showSpinner;
  }

  if (options.sync === undefined || options.sync === null) {
    options.sync = defaultCreateDBOptions.sync;
  }

  if (options.overwrite) {
    if (options.showSpinner) ux.action.start("Droping DB if exists");
    try {
      await dropDB(orbitdb, name, type, { showSpinner: options.showSpinner, entryStorage: entryStorage });
      if (options.showSpinner) ux.action.stop();
    } catch (error) {
      if (options.showSpinner) ux.action.stop("Failed");
      throw new Error(`An error occured while dropping DB: ${error}`);
    }
  }

  if (options.showSpinner) ux.action.start(`Creating ${type} DB ${name}`);
  try {
    const db = await orbitdb.open(name, { type, sync: options.sync, entryStorage: entryStorage });
    if (options.showSpinner) ux.action.stop();
    return db;
  } catch (error) {
    if (options.showSpinner) ux.action.stop("Failed");
    throw new Error(`An error occured while creating DB: ${error}`);
  }
};
