import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";

export default class KeyValueGet extends Command {
  static description = "Get a value by its key from a keyvalue type database";

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
    const { flags } = await this.parse(KeyValueGet);
    const orbitdb = await startOrbitDB(true);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "keyvalue");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }
    const db = await openDB(orbitdb, dbAdress, "keyvalue");

    ux.action.start(`Getting value: ${flags.key} from keyvalue '${flags.dbName}' database`);
    const value = db.get(flags.key);
    if (value === undefined) {
      ux.action.stop("Failed");
      this.error(`key ${flags.key} does not exist on db ${flags.dbName}`);
    }
    ux.action.stop();
    this.log(`${value}`);

    await db.close();
    await stopOrbitDB(orbitdb);
  }
}
