import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { createDB } from "../../utils/create-DB";
import { Command, Flags } from "@oclif/core";

export default class CounterCreate extends Command {
  public static enableJsonFlag = true
  static description = "Create a counter type database";

  static examples = [
    "<%= config.bin %> <%= command.id %> --name=myCounterDbLOL",
    "<%= config.bin %> <%= command.id %> --name=myCounterDbLOL --force",
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

    json: Flags.boolean({
      description: "output as JSON",
    }),
  };

  public async run(): Promise<{name: string, created: boolean}> {
    const { flags } = await this.parse(CounterCreate);
    const orbitdb = await startOrbitDB(true, !flags.json);

    const db = await createDB(orbitdb, flags.name, "counter", {
      overwrite: flags.force,
      showSpinner: !flags.json
    });
    db.close();
    await stopOrbitDB(orbitdb, !flags.json);
    return {"name": flags.name, "created": true};
  }
}
