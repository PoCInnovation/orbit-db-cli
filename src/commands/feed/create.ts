import {Args, Command /*, Flags*/} from '@oclif/core'
import { IPFS, create } from 'ipfs-core'
// const orbitdb = require('orbit-db');


const getConfig = (repo: string) => {
  return {
    repo: process.env.IPFS_PATH || `${repo}/ipfs`,
    start: false,
    // EXPERIMENTAL: {
    //   pubsub: true,
    // },
    config: {
      Addresses: {
        API: '/ip4/127.0.0.1/tcp/0',
        Gateway: '/ip4/0.0.0.0/tcp/0',
        Swarm: [
          '/ip4/0.0.0.0/tcp/0',
          // '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
        ],
      },
    },
    Discovery: {
      MDNS: {
        Enabled: true,
        Interval: 1,
      },
    },
  }
}

export default class Feed extends Command {
  static description = 'feed related commands'

  static examples = [
    '$ orbitdb feed create toto',
  ]

  static flags = {
    // flag with a value (-n, --name=VALUE)
    // name: Flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    // force: Flags.boolean({char: 'f'}),
  }

  static args = {
    databaseName: Args.string({description: 'name of the database to create'}),
  }

  public async run(): Promise<void> {
    const {args} = await this.parse(Feed)

    this.log(`feed create ${args.databaseName}`)
    try {
      const node: IPFS = await create(getConfig(`${process.env.HOME}/.orbitdb`));
      for await (const file of node.ls(`${process.env.HOME}/.orbitdb/ipfs`, undefined)) {
        this.log(file.name)
      }
    } catch (error) {
      console.log(error)
      return
    }
  }
}
