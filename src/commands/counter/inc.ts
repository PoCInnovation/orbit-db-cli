import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";
import { openDB } from "../../utils/open-DB";
import { saveDB } from "../../utils/save-DB";
import { Command, Flags } from "@oclif/core";
import { doesDBExists } from "../../utils/does-DBExists";

export default class CounterInc extends Command {
  public static enableJsonFlag = true
  static description = "Increment a counter type database";

  static examples = [
    "<%= config.bin %> <%= command.id %> --name=myCounterDbLOL --amount=10",
  ];

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    name: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
    // flag with a value (-n VALUE, --name=VALUE)
    amount: Flags.integer({
      char: "a",
      description: "amount added to current value (>= 1)",
      default: 1,
    }),
    json: Flags.boolean({
      description: "output as JSON",
    }),
  };

  public async run(): Promise<{name: string, value: number}> {
    const { flags } = await this.parse(CounterInc);
    const orbitdb = await startOrbitDB(true, !flags.json);
    const name = await resolveDBIdByName(orbitdb, flags.name, "counter");
    const DBExists = await doesDBExists(orbitdb, name);

    if (!DBExists) {
      this.error(`database '${flags.name}' (or '${name}') does not exist`);
    }

    const db = await openDB(orbitdb, name, "counter", { showSpinner: !flags.json });

    if (flags.amount < 1) {
      this.error("Amount must be positiv");
    }

    await db.inc(flags.amount);
    await saveDB(db, !flags.json);
    const valueNow = db.value();
    this.log(`value is now ${valueNow}`);
    await stopOrbitDB(orbitdb, !flags.json);
    return {"name": flags.name, "value": valueNow};
  }
}
