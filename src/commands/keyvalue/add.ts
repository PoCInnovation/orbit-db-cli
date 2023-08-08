import { Command, Flags } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";
import { saveDB } from "../../utils/save-DB";

export default class KeyValueAdd extends Command {
  static description = "Add a file to a keyvalue type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myKeyValueDbName --file=myFile",
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
    // flag with a value (-v VALUE, --value=VALUE)
    value: Flags.string({
      char: 'v',
      description: "value to add into key entry",
    })
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(KeyValueAdd);
    const orbitdb = await startOrbitDB(true);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "keyvalue");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }
    const db = await openDB(orbitdb, dbAdress, "keyvalue");

    if (flags.value !== undefined) {
      try {
        await db.put(flags.key, flags.value);
        this.log(`added value: '${flags.value}' to key '${flags.key}' of ${flags.dbName} database`);
      } catch (error) {
        this.log(`An Error occured while adding ${flags.value} value to key ${flags.key}: ${error}`);
      }
    } else {
      try {
        await db.put(flags.key, null)
        this.log(`added key: "${flags.key}" to ${flags.dbName} database`)
      } catch (error) {
        this.log(`An Error occured while adding key ${flags.key}: ${error}`)
      }
    }

    await saveDB(db);
    await db.close();
    await stopOrbitDB(orbitdb);
  }
}
