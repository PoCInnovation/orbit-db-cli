import { Command, Flags, ux } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { openDB } from "../../utils/open-DB";

export default class EventsWatch extends Command {
  static description = "open database of type events and watch it";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myEventsDbName",
  ];

  static flags = {
    dbName: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
    ipfs: Flags.string({
      char: "i",
      description: "ipfs address of the peer",
      required: false
    })
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(EventsWatch);
    const orbitdb = await startOrbitDB(false, true, flags.ipfs);

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

    this.log(`=> IPFS ID :: ${(await orbitdb.ipfs.id()).id}`);
    for (const index in (await orbitdb.ipfs.id()).addresses) {
      this.log(`=> IPFS Address :: ${(await orbitdb.ipfs.id()).addresses[index]}`);
    }
    this.log(`=> DB Address :: ${db.address}`);

    this.log("Enter 'exit' to quit this program; 'help' for more info");
    while (true) {
      const res = await ux.prompt(">> ", {required: false});
      if (res === "exit") {
        break;
      }
      switch (res) {
        case "name":
          this.log(`${db.name}`)
          break;
        case "type":
          this.log(`events`)
          break;
        case "address":
          this.log(`${db.address.toString()}`)
          break;
        case "peers":
          let peersString = ''
          db.sync.peers.forEach((peer: string) => {
            peersString += ', ' + peer
          })
          peersString = peersString.substring(2)
          this.log(`${peersString}`)
          break;
        case "entries":
          this.log(`${(await db.log.values()).length}`)
          break;
        case "write-access":
          this.log(`${db.access.write}`)
          break;
        case "help":
          this.log('commands: help, name, type, address, peers, entries, exit')
          break;
        default:
          this.log("unknown command; type 'help' for more info");
          break;
      }
    }

    await db.close();
    await stopOrbitDB(orbitdb, true);
  }
}
