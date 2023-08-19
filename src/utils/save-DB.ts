import { ux } from "@oclif/core";

export { saveDB };

/**
 * @brief Save the DB
 *
 * @param db the DB opened (src/utils/open-DB.ts)
 */
const saveDB = async (db: any): Promise<void> => {
  ux.action.start("Saving DB");
  await db.saveSnapshot();
  ux.action.stop();
};
