import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";

export default class EventlogList extends Command {
  public static enableJsonFlag = true
  static description = "Show informations about an eventlog type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myEventlogDbName --file=myFile",
  ];

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    dbName: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),

    // flag with a value (-n VALUE, --name=VALUE)
    limit: Flags.integer({
      char: "l",
      description: "number of entries you want to query",
      default: -1,
    }),
    json: Flags.boolean({
      description: "output as JSON",
    })
  };

  public async run(): Promise<{name: string, entries: string[]}> {
    const { flags } = await this.parse(EventlogList);
    const orbitdb = await startOrbitDB(true, !flags.json);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "eventlog");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }

    const db = await openDB(orbitdb, dbAdress, "eventlog", { showSpinner: !flags.json });
    if (!flags.json) ux.action.start(`Listing entries from eventlog '${flags.dbName}' database`);
    const entries: { payload: { value: string } }[] = db
      .iterator({ limit: flags.limit, reverse: true })
      .collect();
    let listValue: string[] = []
    if (entries.length > 0) {
      if (!flags.json) ux.action.stop()
      this.log(`--- Database last ${entries.length} entries ---`);
      listValue = entries.map((entry) => entry.payload.value)
      if (!flags.json) {
        listValue.forEach((value) => {
          this.log(` --->\n${value}`);
        })
      }
    } else {
      if (!flags.json) ux.action.stop(`No entries found`);
    }

    await db.close();
    await stopOrbitDB(orbitdb, !flags.json);
    return { name: flags.dbName, entries: listValue };
  }
}
