import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";
import { saveDB } from "../../utils/save-DB";

export default class FeedDel extends Command {
  public static enableJsonFlag = true
  static description = "Delete a file to a feed type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myFeedDbName --file=myFile",
  ];

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    dbName: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
    // flag with a value (-n VALUE, --name=VALUE)
    entries: Flags.integer({
      char: "e",
      description: "sequence number of the entry you want to delete",
      required: true,
      multiple: true,
    }),
    json: Flags.boolean({
      description: "output as JSON",
    })
  };

  public async run(): Promise<{name: string, entries: {entry: number, deleted: boolean}[]}> {
    const { flags } = await this.parse(FeedDel);
    const orbitdb = await startOrbitDB(true, !flags.json);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "feed");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }

    const db = await openDB(orbitdb, dbAdress, "feed", { showSpinner: !flags.json });
    let entriesDel: {entry: number, deleted: boolean}[] = [];
    for (const entry of flags.entries) {
      if (!flags.json) ux.action.start(`Deleting entry: ${entry} from feed '${flags.dbName}' database`);
      try {
        await db.del(entry);
        if (!flags.json) ux.action.stop();
        entriesDel.push({entry: entry, deleted: true});
      } catch (error) {
        if (!flags.json) ux.action.stop(`Error occured while deleting entry: ${error}`);
        entriesDel.push({entry: entry, deleted: false});
      }
    }

    await saveDB(db, !flags.json);
    await db.close();
    await stopOrbitDB(orbitdb, !flags.json);
    return {name: flags.dbName, entries: entriesDel};
  }
}
