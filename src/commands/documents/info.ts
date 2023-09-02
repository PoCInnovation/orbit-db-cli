import { Command, Flags } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { openDB } from "../../utils/open-DB";

export default class DocStoreInfo extends Command {
  public static enableJsonFlag = true
  static description = "Show informations about a docstore type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myDocstoreDbName",
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

  public async run(): Promise<{name: string, type: string, address: string, owner: string; dataFile: string; entries: number; writeAccess: boolean}> {
    const { flags } = await this.parse(DocStoreInfo);
    const orbitdb = await startOrbitDB(true, !flags.json);

    const db = await openDB(orbitdb, flags.dbName, "documents", { showSpinner: !flags.json });
    const dbInfo = {
      name: db.dbname,
      type: db._type,
      address: db.address.toString(),
      owner: db.id,
      dataFile: `./${db._cache.path}`,
      entries: db._oplog.length,
      writeAccess: db.access.write,
    }
    this.log("--- Database informations ---\n");
    this.log(`Name: ${dbInfo.name}`);
    this.log(`Type: ${dbInfo.type}`);
    this.log(`Adress: ${dbInfo.address}`);
    this.log(`Owner: ${dbInfo.owner}`);
    this.log(`Data file: ${dbInfo.dataFile}`);
    this.log(`Value: ${dbInfo.entries}`);
    this.log(`Write-Access: ${dbInfo.writeAccess}`);

    await db.close();
    await stopOrbitDB(orbitdb, !flags.json);
    return dbInfo
  }
}
