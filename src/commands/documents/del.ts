import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { openDB } from "../../utils/open-DB";
import { saveDB } from "../../utils/save-DB";

export default class DocStoreDel extends Command {
  public static enableJsonFlag = true
  static description = "Delete a file to a docstore type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myDocstoreDbName -k keyname",
  ];

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    dbName: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
    // flag with a value (-n VALUE, --name=VALUE)
    keys: Flags.string({
      char: "k",
      description: "specify the keys of the entries you want to delete",
      required: true,
      multiple: true,
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

  public async run(): Promise<{name: string, keys: {key: string, deleted: boolean}[]}> {
    const { flags } = await this.parse(DocStoreDel);
    const orbitdb = await startOrbitDB(true, !flags.json, flags.ipfs);

    const db = await openDB(orbitdb, flags.dbName, "documents", { showSpinner: !flags.json });

    let keysDel: {key: string, deleted: boolean}[] = [];
    for (const key of flags.keys) {
      if (!flags.json) ux.action.start(`Deleting entry: ${key} from docstore '${flags.dbName}' database`);
      try {
        await db.del(key);
        if (!flags.json) ux.action.stop();
        keysDel.push({key: key, deleted: true});
      } catch (error) {
        if (!flags.json) ux.action.stop(`Error occured while deleting entry: ${error}`);
        keysDel.push({key: key, deleted: false});
      }
    }

    await saveDB(db, !flags.json);
    await db.close();
    await stopOrbitDB(orbitdb, !flags.json);
    return {name: flags.dbName, keys: keysDel};
  }
}
