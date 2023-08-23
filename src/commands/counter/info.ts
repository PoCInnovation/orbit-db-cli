import { Command, Flags } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";

export default class CounterInfo extends Command {
  public static enableJsonFlag = true
  static description = "Show informations about a counter type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myCounterDbName --file=myFile",
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
  };

  public async run(): Promise<{name: string, type: string, address: string, owner: string; dataFile: string; value: number; writeAccess: boolean}> {
    const { flags } = await this.parse(CounterInfo);
    const orbitdb = await startOrbitDB(true, !flags.json);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "counter");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }

    const db = await openDB(orbitdb, dbAdress, "counter", { showSpinner: !flags.json });
    const dbInfo = {
      name: db.dbname,
      type: db._type,
      address: db.address.toString(),
      owner: db.id,
      dataFile: `./${db._cache.path}`,
      value: db.value(),
      writeAccess: db.access.write,
    }
    this.log("--- Database informations ---\n");
    this.log(`Name: ${dbInfo.name}`);
    this.log(`Type: ${dbInfo.type}`);
    this.log(`Adress: ${dbInfo.address}`);
    this.log(`Owner: ${dbInfo.owner}`);
    this.log(`Data file: ${dbInfo.dataFile}`);
    this.log(`Value: ${dbInfo.value}`);
    this.log(`Write-Access: ${dbInfo.writeAccess}`);

    await db.close();
    await stopOrbitDB(orbitdb, !flags.json);
    return dbInfo
  }
}
