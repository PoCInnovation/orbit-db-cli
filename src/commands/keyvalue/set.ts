import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";
import { saveDB } from "../../utils/save-DB";

export default class KeyValueSet extends Command {
  public static enableJsonFlag = true
  static description = "Set a key,value pair to a keyvalue type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myKeyValueDbName -k keyname -v abc",
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
      char: "v",
      description: "value to set into key entry",
    }),
    json: Flags.boolean({
      description: "output as JSON",
    })
  };

  public async run(): Promise<{name: string, set: boolean}> {
    const { flags } = await this.parse(KeyValueSet);
    const orbitdb = await startOrbitDB(true, !flags.json);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "keyvalue");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }
    const db = await openDB(orbitdb, dbAdress, "keyvalue", { showSpinner: !flags.json });

    if (flags.value !== undefined) {
      if (!flags.json) ux.action.start(`Setting value: '${flags.value}' to key '${flags.key}' of ${flags.dbName} database`);
      try {
        await db.put(flags.key, flags.value);
        if (!flags.json) ux.action.stop();
      } catch (error) {
        if (!flags.json) ux.action.stop(`Error occured while setting value: ${error}`);
      }
    } else {
      if (!flags.json) ux.action.start(`Setting key: "${flags.key}" to ${flags.dbName} database`);
      try {
        await db.put(flags.key, null);
        if (!flags.json) ux.action.stop();
      } catch (error) {
        if (!flags.json) ux.action.stop(`An Error occured while adding key ${flags.key}: ${error}`);
      }
    }

    await saveDB(db, !flags.json);
    await db.close();
    await stopOrbitDB(orbitdb, !flags.json);
    return {name: flags.dbName, set: true};
  }
}
