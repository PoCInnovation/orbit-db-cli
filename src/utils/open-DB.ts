import { ux } from "@oclif/core";
import { DBType } from "./db-types";
import { getEntryStorage } from "../services/config";

export { openDB, OpenDBOptions };

type OpenDBOptions = {
  replicate?: boolean;
  create?: boolean;
  localOnly?: boolean;
  sync?: boolean;
  showSpinner: boolean;
  pinIpfsBlocks?: boolean;
};

const defaultOpenDBOptions = {
  replicate: false,
  create: false,
  localOnly: false,
  sync: false,
  showSpinner: true,
  pinIpfsBlocks: false,
};

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
const openDB = async (
  orbitdb: any,
  name: string,
  type: DBType,
  options: OpenDBOptions,
) => {
  if (options.replicate === undefined || options.replicate === null) {
    options.replicate = defaultOpenDBOptions.replicate;
  }

  if (options.create === undefined || options.create === null) {
    options.create = defaultOpenDBOptions.create;
  }

  if (options.localOnly === undefined || options.localOnly === null) {
    options.localOnly = defaultOpenDBOptions.localOnly;
  }

  if (options.sync === undefined || options.sync === null) {
    options.sync = defaultOpenDBOptions.sync;
  }

  if (options.showSpinner === undefined || options.showSpinner === null) {
    options.showSpinner = defaultOpenDBOptions.showSpinner;
  }

  if (options.pinIpfsBlocks === undefined || options.pinIpfsBlocks === null) {
    options.pinIpfsBlocks = defaultOpenDBOptions.pinIpfsBlocks;
  }

  if (options.showSpinner) ux.action.start(`Opening ${type} DB ${name}`);


  // @ts-ignore
  const { OrbitDBAccessController } = await import("@orbitdb/core");
  const AccessController = await OrbitDBAccessController({ write: ['*']});

  try {
    // @ts-ignore
    const entryStorage = await getEntryStorage(orbitdb.ipfs, options.pinIpfsBlocks);
    const db = await orbitdb.open(name, {
      type,
      replicate: options.replicate,
      create: options.create,
      localOnly: options.localOnly,
      sync: options.sync,
      entryStorage: entryStorage,
      AccessController: AccessController,
    });
    if (options.showSpinner) ux.action.stop();
    if (options.showSpinner) ux.action.start('Loading last snapshot');
    try {
      await db.loadFromSnapshot();
    } catch (_) {}
    if (options.showSpinner) ux.action.stop();
    return db;
  } catch (error) {
    if (options.showSpinner) ux.action.stop("Failed");
    throw new Error(`An error occured while opening DB ${error}`);
  }
};
