import { ux } from "@oclif/core";
import { defaultDatabaseDir } from "../services/config";

type DBType = "feed" | "counter" | "eventlog" | "docstore" | "keyvalue";

export { DBType };
export { createDB, CreateDBOptions };

type CreateDBOptions = {
  overwrite?: boolean;
  directory?: string;
  showSpinner?: boolean;
};

const defaultCreateDBOptions = {
  overwrite: false,
  directory: defaultDatabaseDir,
  showSpinner: true,
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
  options: CreateDBOptions = {},
) => {
  if (options.overwrite === undefined || options.overwrite === null) {
    options.overwrite = defaultCreateDBOptions.overwrite;
  }

  if (options.directory === undefined || options.directory === null) {
    options.directory = defaultCreateDBOptions.directory;
  }
  if (options.showSpinner === undefined || options.showSpinner === null) {
    options.showSpinner = defaultCreateDBOptions.showSpinner;
  }

  if (options.showSpinner) ux.action.start(`Creating ${type} DB ${name}`);
  try {
    const db = await orbitdb.create(name, type, {
      overwrite: options.overwrite,
      directory: options.directory,
    });
    if (options.showSpinner) ux.action.stop();
    return db;
  } catch (error) {
    if (options.showSpinner) ux.action.stop("Failed");
    throw new Error("An error occured while creating DB");
  }
};
