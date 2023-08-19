import { Command, Flags } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { createDB } from "../../utils/create-DB";

export default class DocStoreCreate extends Command {
  static description = "Create a Docstore type database";

  static examples = [
    "<%= config.bin %> <%= command.id %> --name=myDocstoreDbLOL",
    "<%= config.bin %> <%= command.id %> --name=myDocstoreDbLOL --force",
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
    const { flags } = await this.parse(DocStoreCreate);
    const orbitdb = await startOrbitDB(true);

    const db = await createDB(orbitdb, flags.name, "docstore", {
      overwrite: flags.force,
    });
    db.close();
    await stopOrbitDB(orbitdb);
  }
}
