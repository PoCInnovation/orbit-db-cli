import { Command, Flags } from "@oclif/core";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { createDB } from "../../utils/create-DB";

export default class EventlogCreate extends Command {
  public static enableJsonFlag = true
  static description = "Create an eventlog type database";

  static examples = [
    "<%= config.bin %> <%= command.id %> --name=myEventlogDbLOL",
    "<%= config.bin %> <%= command.id %> --name=myEventlogDbLOL --force",
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
    })
  };

  public async run(): Promise<{name: string, created: boolean}> {
    const { flags } = await this.parse(EventlogCreate);
    const orbitdb = await startOrbitDB(true, !flags.json);

    const db = await createDB(orbitdb, flags.name, "eventlog", {
      overwrite: flags.force,
      showSpinner: !flags.json
    });
    db.close();
    await stopOrbitDB(orbitdb, !flags.json);
    return {name: flags.name, created: true};
  }
}
