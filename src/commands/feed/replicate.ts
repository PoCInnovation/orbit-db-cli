import { startOrbitDB } from '../../services/start-OrbitDB';
import { stopOrbitDB } from '../../services/stop-OrbitDB';
import { openDB } from '../../utils/open-DB';
import { resolveDBIdByName } from '../../utils/resolve-DBIdByName';
import { Command, Flags } from '@oclif/core';


export default class FeedReplicate extends Command {
  static description = 'Replicate (sync) a feed type database';

  static examples = [
    '<%= config.bin %> <%= command.id %> --name=myFeedDbLOL',
    '<%= config.bin %> <%= command.id %> --name=myFeedDbLOL --force',
  ]

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    name: Flags.string({ char: 'n', description: 'name of the database', required: true }),
  }

  public async run(): Promise<void> {
    this.error('NotImplementedError');
    const { flags } = await this.parse(FeedReplicate);
    const orbitdb = await startOrbitDB(false);
    const name = await resolveDBIdByName(orbitdb, flags.name, 'feed');

    this.log(`opening database name: ${name} ...`);
    const db = await openDB(orbitdb, name, 'feed', true, true);
    this.log(`opened database: ${db.address} and replicated it`);
    await stopOrbitDB(orbitdb); // this give the error: NotStartedError: not started
  }
}
