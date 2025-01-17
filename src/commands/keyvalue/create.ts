import { Command, Flags } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { createDB } from "../../utils/create-DB";

export default class KeyValueCreate extends Command {
  static description = "Create a KeyValue type database";

  static examples = [
    "<%= config.bin %> <%= command.id %> --name=myKeyValueDbLOL",
    "<%= config.bin %> <%= command.id %> --name=myKeyValueDbLOL --force",
  ];

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    name: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
    // flag with no value (-f, --force)
    force: Flags.boolean({
      char: "f",
      description: "force overwrite if DB already exists",
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(KeyValueCreate);
    const orbitdb = await startOrbitDB(true);

    this.log(`creating database name: ${flags.name} ...`);
    const db = await createDB(orbitdb, flags.name, "keyvalue", {
      overwrite: flags.force,
    });
    this.log(`created database: ${db.address}`);
    await stopOrbitDB(orbitdb);
  }
}
