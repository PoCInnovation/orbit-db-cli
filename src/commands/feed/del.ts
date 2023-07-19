import {Command, Flags} from '@oclif/core'
import {startOrbitDB} from '../../services/start-OrbitDB'
import {stopOrbitDB} from '../../services/stop-OrbitDB'
import {doesDBExists} from '../../utils/does-DBExists'
import {openDB} from '../../utils/open-DB'
import {resolveDBIdByName} from '../../utils/resolve-DBIdByName'

export default class Del extends Command {
  static description = 'Delete a file to a feed type database'

  static examples: Command.Example[] = [
    '<%= config.bin %> <%= command.id %> --name=myFeedDbName --file=myFile',
  ]

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    dbName: Flags.string({char: 'n', description: 'name of the database', required: true}),
    // flag with a value (-n VALUE, --name=VALUE)
    entries: Flags.integer({char: 'e', description: 'sequence number of the entry you want to delete', required: true, multiple: true}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Del)
    const orbitdb = await startOrbitDB(true)
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, 'feed')
    const DBExists = await doesDBExists(orbitdb, dbAdress)

    if (!DBExists) {
      this.error(`database '${flags.dbName}' (or '${dbAdress}') does not exist`)
    }

    const db = await openDB(orbitdb, dbAdress, 'feed')
    flags.entries.forEach(async entry => {
      await db.del(entry)
      this.log(`deleted entry number ${entry} from feed '${flags.dbName}' database`)
    })
    await db.close()
    await stopOrbitDB(orbitdb)
  }
}
