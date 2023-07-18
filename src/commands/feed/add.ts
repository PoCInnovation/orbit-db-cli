import { Command, Flags } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";

export default class Add extends Command {
  static description = 'Add a file to a feed type database'

  static examples: Command.Example[] = [
    '<%= config.bin %> <%= command.id %> --name=myFeedDbName --file=myFile',
  ]

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    dbName: Flags.string({ char: 'n', description: 'name of the database', required: true }),
    // flag with a value (-n VALUE, --name=VALUE)
    file: Flags.file({ char: 'f', description: 'file to add into db', required: true, exists: true, multiple: true })
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Add)
    const orbitdb = await startOrbitDB(true)

    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, 'feed')
    const DBExists = await doesDBExists(orbitdb, flags.dbName)

    if (!DBExists) {
      this.error(`database '${flags.name}' (or '${dbAdress}') does not exist`)
    }

    const db = await openDB(orbitdb, flags.dbName, 'feed')
    flags.file.forEach(async (file) => {
      await db.add(file)
    })
    await db.close()
    await stopOrbitDB(orbitdb)
  }
}