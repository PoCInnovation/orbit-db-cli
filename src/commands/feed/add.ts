import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";
import { saveDB } from "../../utils/save-DB";

export default class FeedAdd extends Command {
  public static enableJsonFlag = true
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
    json: Flags.boolean({
      description: "output as JSON",
    })
  };

  public async run(): Promise<{name: string, added: {value: string, added: boolean}[]}> {
    const { flags } = await this.parse(FeedAdd);
    const orbitdb = await startOrbitDB(true, !flags.json);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "feed");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }

    const db = await openDB(orbitdb, dbAdress, "feed", { showSpinner: !flags.json });
    let added: {value: string, added: boolean}[] = [];
    for (const data of flags.data) {
      if (!flags.json) ux.action.start(`Adding data: ${data} to feed '${flags.dbName}' database`);
      try {
        const hash = await db.add(data);
        if (!flags.json) ux.action.stop(`hash: ${hash}`);
        added.push({value: data, added: true});
      } catch (error) {
        if (!flags.json) ux.action.stop(`Error occured while adding entry: ${error}`);
        added.push({value: data, added: false});
      }
    }
    await saveDB(db, !flags.json);
    await db.close();
    await stopOrbitDB(orbitdb, !flags.json);
    return {name: flags.dbName, added: added};
  }
}
