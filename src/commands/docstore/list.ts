import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";

export default class DocStoreList extends Command {
  public static enableJsonFlag = true
  static description = "Get all keys from a docstore type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myKeyValueDbName",
  ];

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    dbName: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
    json: Flags.boolean({
      description: "output as JSON",
    })
  };

  public async run(): Promise<{entries: string[]}> {
    const { flags } = await this.parse(DocStoreList);
    const orbitdb = await startOrbitDB(true, !flags.json);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "docstore");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }
    const db = await openDB(orbitdb, dbAdress, "docstore", { showSpinner: !flags.json });

    if (!flags.json) ux.action.start(`Getting all keys from docstore '${flags.dbName}' database`);
    const values: {_id: string, content: string}[] = db.get("");
    if (values === undefined || values.length === 0) {
      if (!flags.json) ux.action.stop("No keys found");
      return {entries: []};
    }
    if (!flags.json) ux.action.stop();

    const entries = values.map((value) => value._id);
    if (!flags.json) {
      entries.forEach((key) => {
        this.log(`${key}`);
      })
    }

    await db.close();
    await stopOrbitDB(orbitdb, !flags.json);
    return {entries: entries};
  }
}
