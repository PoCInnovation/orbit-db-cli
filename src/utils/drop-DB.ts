import { ux } from "@oclif/core";

import { DBType } from "./db-types";

export { dropDB }

const dropDB = async (orbitdb: any, name: string, type: DBType, { showSpinner, entryStorage }: { showSpinner: boolean, entryStorage: any }) => {
    const db = await orbitdb.open(name, { type, sync: false, entryStorage });

    if (showSpinner) ux.action.start(`dropping database ${name}`);
    await db.drop();
    await db.close();
    if (showSpinner) ux.action.stop();
}
