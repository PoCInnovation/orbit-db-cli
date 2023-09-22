import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { openDB } from "../../utils/open-DB";

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
    }),
    ipfs: Flags.string({
      char: "i",
      description: "ipfs address of the peer",
      required: false
    })
  };

  public async run(): Promise<{entries: string[]}> {
    const { flags } = await this.parse(DocStoreList);
    const orbitdb = await startOrbitDB(true, !flags.json, flags.ipfs);

    const db = await openDB(orbitdb, flags.dbName, "documents", { showSpinner: !flags.json });

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
