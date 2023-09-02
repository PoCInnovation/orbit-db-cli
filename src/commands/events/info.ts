import { Command, Flags } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { openDB } from "../../utils/open-DB";

export default class EventlogInfo extends Command {
  public static enableJsonFlag = true
  static description = "Show informations about an eventlog type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myEventlogDbName --file=myFile",
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

  public async run(): Promise<{name: string, type: string, address: string, peers: Set<string>; entries: number; writeAccess: boolean}> {
    const { flags } = await this.parse(EventlogInfo);
    const orbitdb = await startOrbitDB(true, !flags.json);

    const db = await openDB(orbitdb, flags.dbName, "events", { showSpinner: !flags.json });
    let peersString = ''
    db.sync.peers.forEach((peer: string) => {
      peersString += ', ' + peer
    })
    peersString = peersString.substring(2)
    const dbInfo = {
      name: db.name,
      type: db._type,
      address: db.address.toString(),
      peers: db.sync.peers,
      entries: (await db.log.values()).length,
      writeAccess: db.access.write,
    }
    this.log("\n--- Database informations ---");
    this.log(`Name: ${dbInfo.name}`);
    this.log(`Type: events`);
    this.log(`Adress: ${dbInfo.address}`);
    this.log(`Peers: ${peersString}`);
    this.log(`Number of items: ${dbInfo.entries}`);
    this.log(`Write-Access: ${dbInfo.writeAccess}`);
    this.log("--- End ---\n");

    await db.close();
    await stopOrbitDB(orbitdb, !flags.json);
    return dbInfo
  }
}
