import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";
import { openDB } from "../../utils/open-DB";
import { saveDB } from "../../utils/save-DB";
import { Command, Flags } from "@oclif/core";

export default class CounterInc extends Command {
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
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(CounterInc);
    const orbitdb = await startOrbitDB(true);
    const name = await resolveDBIdByName(orbitdb, flags.name, "counter");
    const db = await openDB(orbitdb, name, "counter");

    if (flags.amount < 1) {
      this.error("Amount must be positiv")
    }

    await db.inc(flags.amount);
    await saveDB(db);
    this.log(`value is now ${db.value}`);
    await stopOrbitDB(orbitdb);
  }
}
