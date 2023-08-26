import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";
import { saveDB } from "../../utils/save-DB";

export default class EventlogAdd extends Command {
  public static enableJsonFlag = true
  static description = "Add a data to an eventlog type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myEventlogDbName --data=lol",
  ];

  static flags = {
    dbName: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
    // flag with a value (-d VALUE, --data=VALUE)
    data: Flags.string({
      char: "d",
      description: "data to add to the eventlog",
      required: true,
      multiple: true,
    }),
    failfast: Flags.boolean({
      description:
        "if stop adding datas at first adding failed (default: try to add all datas)",
      default: false,
    }),
    saveonerror: Flags.boolean({
      name: "save-on-error",
      description:
        "save the database even if an item has not been added (default: don't save if an error happen)",
      default: false,
    }),
    json: Flags.boolean({
      description: "output as JSON",
    })
  };

  public async run(): Promise<{name: string, added: {value: string, added: boolean}[]}> {
    const { flags } = await this.parse(EventlogAdd);
    const orbitdb = await startOrbitDB(true, !flags.json);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "eventlog");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }

    const db = await openDB(orbitdb, dbAdress, "eventlog", { showSpinner: !flags.json });

    let isError = false;
    let added: {value: string, added: boolean}[] = [];
    for (const data of flags.data) {
      if (isError === true && flags.failfast === true) {
        break;
      }
      if (!flags.json) ux.action.start(`Adding data: ${data} to eventlog '${flags.dbName}' database`);
      try {
        const hash = await db.add(data);
        if (!flags.json) ux.action.stop(`hash: ${hash}`);
        added.push({value: data, added: true});
      } catch (error) {
        isError = true;
        if (!flags.json) ux.action.stop(`Error occured while adding entry ${data}: ${error}`);
        added.push({value: data, added: false});
      }
    }
    if (isError === false || flags.saveonerror === true) {
      await saveDB(db, !flags.json);
    }
    await db.close();
    await stopOrbitDB(orbitdb, !flags.json);
    return {name: flags.dbName, added};
  }
}
