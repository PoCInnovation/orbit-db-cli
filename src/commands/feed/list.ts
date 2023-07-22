import { Command, Flags } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";
import { saveDB } from "../../utils/save-DB";

export default class FeedList extends Command {
  static description = "Show informations about a feed type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myFeedDbName --file=myFile",
  ];

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    dbName: Flags.string({
      char: 'n',
      description: "name of the database",
      required: true,
    }),

    // flag with a value (-n VALUE, --name=VALUE)
    limit: Flags.integer({
      char: 'l',
      description: "number of entries you want to query",
    })
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

    const db = await openDB(orbitdb, dbAdress, "feed")
    const entries = db.iterator({ limit: flags.limit || -1, reverse: true })
    if (entries.length > 0) {
      this.log(`--- Database last ${entries.length} entries ---`)
      entries.forEach((entry: any) => {
        this.log(`${JSON.stringify(entry.payload.value, null, 2)}`)
      });
    } else {
      this.log(`Database ${db.dbname} is empty`)
    }
    await saveDB(db);
    await db.close();
    await stopOrbitDB(orbitdb);
  }
}
