import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";
import { openDB } from "../../utils/open-DB";
import { Command, Flags } from "@oclif/core";
import { doesDBExists } from "../../utils/does-DBExists";

export default class CounterValue extends Command {
  public static enableJsonFlag = true
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
    json: Flags.boolean({
      description: "output as JSON",
    }),
  };

  public async run(): Promise<{ name: string, value: number}> {
    const { flags } = await this.parse(CounterValue);
    const orbitdb = await startOrbitDB(true, !flags.json);
    const name = await resolveDBIdByName(orbitdb, flags.name, "counter");
    const DBExists = await doesDBExists(orbitdb, name);

    if (!DBExists) {
      this.error(`database '${flags.name}' (or '${name}') does not exist`);
    }

    const db = await openDB(orbitdb, name, "counter", { showSpinner: !flags.json });

    const valueNow = db.value;
    this.log(`${valueNow}`);
    await stopOrbitDB(orbitdb, !flags.json);
    return {"name": flags.name, "value": valueNow};
  }
}
