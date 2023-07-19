export {saveDB}

/**
* @brief Save the DB
*
* @param db the DB opened (src/utils/open-DB.ts)
*/
const saveDB = async (db: any): Promise<void> => {
  await db.saveSnapshot()
}
