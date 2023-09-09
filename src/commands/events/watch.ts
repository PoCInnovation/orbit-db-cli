import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { openDB } from "../../utils/open-DB";

export default class EventsWatch extends Command {
  static description = "open database of type events and watch it";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myEventsDbName --data=lol",
  ];

  static flags = {
    dbName: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(EventsWatch);
    const orbitdb = await startOrbitDB(false, true);

    const db = await openDB(orbitdb, flags.dbName, "events", { showSpinner: true, pinIpfsBlocks: true });

    db.events.on("close", () => {
      this.log("db closed");
    })
    db.events.on("drop", () => {
      this.log("db dropped");
    })
    db.events.on("join", (peerId: any, heads: any[]) => {
      this.log(`peer ${peerId} joined with ${heads.length} heads`);
    })
    db.events.on("leave", (peerId: any) => {
      this.log(`peer ${peerId} left`);
    })
    db.events.on("update", (entry: any) => {
      this.log(`entry updated: ${JSON.stringify(entry)}`);
    })

    console.log(`=> IPFS ID :: ${(await orbitdb.ipfs.id()).id}`);
    for (const index in (await orbitdb.ipfs.id()).addresses) {
      console.log(`=> IPFS Address :: ${(await orbitdb.ipfs.id()).addresses[index]}`);
    }
    console.log(`=> DB Address :: ${db.address}`);

    await ux.prompt("Press enter to exit", {required: false});

    await db.close();
    await stopOrbitDB(orbitdb, true);
  }
}
