import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";
import { saveDB } from "../../utils/save-DB";

export default class FeedAdd extends Command {
  static description = "Add a file to a feed type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myFeedDbName --data=someData",
    "<%= config.bin %> <%= command.id %> --name=myFeedDbName --d someData",
    "<%= config.bin %> <%= command.id %> -n myFeedDbName -d someData",
  ];

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    dbName: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
    // flag with a value (-n VALUE, --name=VALUE)
    data: Flags.string({
      char: "d",
      description: "file to add into db",
      required: true,
      multiple: true,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(FeedAdd);
    const orbitdb = await startOrbitDB(true);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "feed");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }

    const db = await openDB(orbitdb, dbAdress, "feed");
    for (const data of flags.data) {
      ux.action.start(`Adding data: ${data} to feed '${flags.dbName}' database`);
      try {
        const hash = await db.add(data);
        ux.action.stop(`hash: ${hash}`);
      } catch (error) {
        ux.action.stop(`Error occured while adding entry: ${error}`);
      }
    }
    await saveDB(db);
    await db.close();
    await stopOrbitDB(orbitdb);
  }
}
