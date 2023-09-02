import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { openDB } from "../../utils/open-DB";

export default class DocstoreGet extends Command {
  public static enableJsonFlag = true
  static description = "Get a value by its key from a docstore type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myKeyValueDbName -k keyname",
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
    json: Flags.boolean({
      description: "output as JSON",
    })
  };

  public async run(): Promise<{name: string, docs: {_id: string, content: string}[]}> {
    const { flags } = await this.parse(DocstoreGet);
    const orbitdb = await startOrbitDB(true, !flags.json);

    const db = await openDB(orbitdb, flags.dbName, "documents", { showSpinner: !flags.json });

    if (!flags.json) ux.action.start(`Getting value: ${flags.key} from docstore '${flags.dbName}' database`);
    const values: {_id: string, content: string}[] = db.get(flags.key);
    if (values === undefined || values.length === 0) {
      if (!flags.json) ux.action.stop("Failed");
      this.error(`key ${flags.key} does not exist on db ${flags.dbName}`);
    }
    if (!flags.json) ux.action.stop();

    if (!flags.json) {
      for (const value of values) {
        this.log(`|--- ${value._id} --|\n${value.content}`);
      }
    }

    await db.close();
    await stopOrbitDB(orbitdb, !flags.json);
    return {name: flags.dbName, docs: values};
  }
}
