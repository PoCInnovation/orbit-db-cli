import {startOrbitDB} from '../../services/start-OrbitDB'
import {stopOrbitDB} from '../../services/stop-OrbitDB'
import {openDB} from '../../utils/open-DB'
import {Command, Flags, ux} from '@oclif/core'

export default class FeedShell extends Command {
  static description = 'Spawn a "shell" connected to a feed type database';

  static examples = [
    '<%= config.bin %> <%= command.id %> --name=myFeedDbLOL',
  ]

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name of the database', required: true}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(FeedShell)
    const orbitdb = await startOrbitDB(false)

    this.log(`opening database name: ${flags.name} ...`)
    const db = await openDB(orbitdb, flags.name, 'feed', {create: true, replicate: true, sync: true})
    this.log(`opened database: ${db.address} and ready`)
    this.log("PeedId: ", (await orbitdb._ipfs.id()).addresses)
    let command = ""
    while (command !== "exit") {
      command = await ux.prompt(">> ")
      switch (command) {
        case "help":
          this.log("Available commands:")
          this.log("-> exit\texit the shell")
          this.log("-> help\tshow this help")
          this.log("-> add\tadd a new entry")
          this.log("-> list\tnumber of entries")
          this.log("")
          break
        case "exit":
          break
        case "add":
          const value = await ux.prompt("value: ")
          await db.add(value)
          break
        case "list":
          const nbList = await ux.prompt("number of item to show: ")
          const entries = db
            .iterator({ limit: Number(nbList), reverse: true })
            .collect();
          for (const entry of entries) {
            this.log(`${JSON.stringify(entry.payload.value, null, 2)}`)
          }
          break
        default:
          this.log("Unknown command")
          break
      }
    }
    await stopOrbitDB(orbitdb) // this give the error: NotStartedError: not started
  }
}
