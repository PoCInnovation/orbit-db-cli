import { ux } from "@oclif/core";

export { saveDB };

/**
 * @brief Save the DB
 *
 * @param db the DB opened (src/utils/open-DB.ts)
 */
const saveDB = async (db: any, showSpinner = true): Promise<void> => {
  if (showSpinner) ux.action.start("Saving DB");
  await db.saveSnapshot();
  if (showSpinner) ux.action.stop();
};
