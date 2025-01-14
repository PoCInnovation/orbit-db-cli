import { Command, Flags } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";
import { saveDB } from "../../utils/save-DB";

export default class DocStoreDel extends Command {
  static description = "Delete a file to a docstore type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myDocstoreDbName -k keyname",
  ];

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    dbName: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
    // flag with a value (-n VALUE, --name=VALUE)
    keys: Flags.integer({
      char: "k",
      description: "specify the keys of the entries you want to delete",
      required: true,
      multiple: true,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(DocStoreDel);
    const orbitdb = await startOrbitDB(true);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "docstore");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }

    const db = await openDB(orbitdb, dbAdress, "docstore");
    for (const keys of flags.entries) {
      try {
        await db.del(keys);
        this.log(
          `deleted entry: ${keys} from docstore '${flags.dbName}' database`,
        );
      } catch (error) {
        this.log(`Error occured while deleting entry: ${error}`);
      }
    }
    await saveDB(db);
    await db.close();
    await stopOrbitDB(orbitdb);
  }
}
