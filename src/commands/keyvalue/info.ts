import { Command, Flags } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";
import { saveDB } from "../../utils/save-DB";

export default class KeyValueInfo extends Command {
  static description = "Show informations about a keyvalue type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myKeyValueDbName --file=myFile",
  ];

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    dbName: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(KeyValueInfo);
    const orbitdb = await startOrbitDB(true);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "keyvalue");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }

    const db = await openDB(orbitdb, dbAdress, "keyvalue");
    this.log("--- Database informations ---\n");
    this.log(`Name: ${db.dbname}`);
    this.log(`Type: ${db._type}`);
    this.log(`Adress: ${db.address.toString()}`);
    this.log(`Owner: ${db.id}`);
    this.log(`Data file: ./${db._cache.path}`);
    this.log(`Entries: ${db._oplog.length}`);
    this.log(`Write-Access: ${db.access.write}`);

    await saveDB(db);
    await db.close();
    await stopOrbitDB(orbitdb);
  }
}
