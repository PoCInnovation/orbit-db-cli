import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { openDB } from "../../utils/open-DB";

export default class KeyValueGet extends Command {
  public static enableJsonFlag = true
  static description = "Get a value by its key from a keyvalue type database";

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
    }),
    ipfs: Flags.string({
      char: "i",
      description: "ipfs address of the peer",
      required: false
    })
  };

  public async run(): Promise<{name: string, value: string}> {
    const { flags } = await this.parse(KeyValueGet);
    const orbitdb = await startOrbitDB(true, !flags.json, flags.ipfs);

    const db = await openDB(orbitdb, flags.dbName, "keyvalue", { showSpinner: !flags.json });

    if (!flags.json) ux.action.start(`Getting value: ${flags.key} from keyvalue '${flags.dbName}' database`);
    const value = db.get(flags.key);
    if (value === undefined) {
      if (!flags.json) ux.action.stop("Failed");
      this.error(`key ${flags.key} does not exist on db ${flags.dbName}`);
    }
    if (!flags.json) ux.action.stop();
    this.log(`${value}`);

    await db.close();
    await stopOrbitDB(orbitdb, !flags.json);
    return {name: flags.name, value: value};
  }
}
