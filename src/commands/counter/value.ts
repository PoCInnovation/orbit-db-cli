import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";
import { openDB } from "../../utils/open-DB";
import { Command, Flags } from "@oclif/core";
import { doesDBExists } from "../../utils/does-DBExists";

export default class CounterValue extends Command {
  static description = "Print value of a counter db";

  static examples = [
    "<%= config.bin %> <%= command.id %> --name=myCounterDbLOL",
  ];

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    name: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(CounterValue);
    const orbitdb = await startOrbitDB(true);
    const name = await resolveDBIdByName(orbitdb, flags.name, "counter");
    const DBExists = await doesDBExists(orbitdb, name);

    if (!DBExists) {
      this.error(`database '${flags.name}' (or '${name}') does not exist`);
    }

    const db = await openDB(orbitdb, name, "counter");

    this.log(`${db.value}`);
    await stopOrbitDB(orbitdb);
  }
}
