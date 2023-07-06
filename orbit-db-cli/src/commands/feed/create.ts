import { Command, Flags } from '@oclif/core';
import { defaultDatabaseDir } from '../../services/config';
import { startOrbitDB } from '../../services/start-OrbitDB';


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
    const { args, flags } = await this.parse(Create);
    this.log(`starting orbitdb...`);
    const orbitdb = await startOrbitDB();
    this.log(`started orbitdb`);

    this.log(`creating database: ${orbitdb.address} ...`);
    const db = orbitdb.create(flags.name, 'feed', {
      overwrite: flags.force,
      directory: defaultDatabaseDir
    });
    this.log(`created database: ${db.address}`);
  }
}
