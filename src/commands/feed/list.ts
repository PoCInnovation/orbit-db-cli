import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";

export default class FeedList extends Command {
  static description = "Show values of a feed type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myFeedDbName --limit=10",
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
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(FeedList);
    const orbitdb = await startOrbitDB(true);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "feed");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }

    const db = await openDB(orbitdb, dbAdress, "feed");
    ux.action.start(`Listing entries from eventlog '${flags.dbName}' database`);
    const entries = db
      .iterator({ limit: flags.limit || -1, reverse: true })
      .collect();
    if (entries.length > 0) {
      ux.action.stop()
      this.log(`--- Database last ${entries.length} entries ---`);
      for (const entry of entries) {
        this.log(`${JSON.stringify(entry.payload.value, null, 2)}`);
      }
    } else {
      ux.action.stop(`No entries found`);
    }

    await db.close();
    await stopOrbitDB(orbitdb);
  }
}
