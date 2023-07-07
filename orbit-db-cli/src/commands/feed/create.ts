import { Command, Flags } from '@oclif/core';
import { startOrbitDB } from '../../services/start-OrbitDB';
import { stopOrbitDB } from '../../services/stop-OrbitDB';
import { createDB } from '../../services/create-DB';


export default class Create extends Command {
  static description = 'Create an feed type database'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    name: Flags.string({ char: 'n', description: 'name of the database', required: true }),
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: 'f' }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Create);
    this.log(`starting orbitdb...`);
    const orbitdb = await startOrbitDB();
    this.log(`started orbitdb`);

    this.log(`creating database name: ${flags.name} ...`);
    const db = await createDB(orbitdb, flags.name, 'feed', flags.force);
    this.log(`created database: ${db.address}`);
    await stopOrbitDB(orbitdb);
  }
}
