import {startOrbitDB} from '../../services/start-OrbitDB'
import {stopOrbitDB} from '../../services/stop-OrbitDB'
import {openDB} from '../../utils/open-DB'
import {Command, Flags} from '@oclif/core'

export default class FeedReplicate extends Command {
  static description = 'Replicate (sync) a feed type database';

  static examples = [
    '<%= config.bin %> <%= command.id %> --name=myFeedDbLOL',
  ]

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name of the database', required: true}),
    instance: Flags.string({char: 'i', description: 'address of another instance to connect to', required: true}),
  }

  public async run(): Promise<void> {
    // this.error('NotImplementedError');
    const {flags} = await this.parse(FeedReplicate)
    const orbitdb = await startOrbitDB(false)

    const {multiaddr} = await import('@multiformats/multiaddr')
    const addrs = multiaddr(flags.instance)
    await orbitdb._ipfs.swarm.connect(addrs)

    this.log(`opening database name: ${flags.name} ...`)
    const db = await openDB(orbitdb, flags.name, 'feed', {create: true, replicate: true, sync: true})
    await db._ipfs.swarm.connect(addrs)
    this.log(`opened database: ${db.address} and replicated it`)
    await stopOrbitDB(orbitdb) // this give the error: NotStartedError: not started
  }
}
