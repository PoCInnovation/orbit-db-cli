import { Command, Flags } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";

export default class DocstoreGet extends Command {
  static description = "Get a value by its key from a docstore type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myKeyValueDbName -k keyname",
  ];

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    dbName: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
    // flag with a value (-k VALUE, --key=VALUE)
    key: Flags.string({
      char: "k",
      description: "key of the entry",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(DocstoreGet);
    const orbitdb = await startOrbitDB(true);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "docstore");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }
    const db = await openDB(orbitdb, dbAdress, "docstore");

    const values = db.get(flags.key);
    if (values === undefined || values.length === 0) {
      this.error(`key ${flags.key} does not exist on db ${flags.dbName}`);
    }
    for (const value of values) {
      this.log(`${value.content}`);
    }

    await db.close();
    await stopOrbitDB(orbitdb);
  }
}
