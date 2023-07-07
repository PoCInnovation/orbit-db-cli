import { Command, Flags } from '@oclif/core';
import { startOrbitDB } from '../../services/start-OrbitDB';
import { stopOrbitDB } from '../../services/stop-OrbitDB';
import { createDB } from '../../services/create-DB';


export default class Create extends Command {
  static description = 'Create an feed type database'

  static examples = [
    '<%= config.bin %> <%= command.id %> --name=myFeedDbLOL',
    '<%= config.bin %> <%= command.id %> --name=myFeedDbLOL --force',
  ]

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    name: Flags.string({ char: 'n', description: 'name of the database', required: true }),
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: 'f', description: 'force overwrite if DB already exists' }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Create);
    const orbitdb = await startOrbitDB();

    this.log(`creating database name: ${flags.name} ...`);
    const db = await createDB(orbitdb, flags.name, 'feed', flags.force);
    this.log(`created database: ${db.address}`);
    await stopOrbitDB(orbitdb);
  }
}
