import { Command, Flags, ux } from "@oclif/core";
import { rm } from "node:fs/promises";
import * as path from "node:path";
import { startOrbitDB } from "../..//services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";

export default class EventlogDrop extends Command {
  public static enableJsonFlag = true
  static description =
    "Delete a eventlog type database locally (This doesn't remove data on other nodes that have the removed database replicated.)";

  static examples = [
    "<%= config.bin %> <%= command.id %> --name=myEventlogDbLOL",
    "<%= config.bin %> <%= command.id %> --name=myEventlogDbLOL -y",
  ];

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    name: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
    // flag with no value (-y, --yes)
    yes: Flags.boolean({
      char: "y",
      description:
        "confirm drop (without this option you will be asked to confirm)",
    }),
    json: Flags.boolean({
      description: "output as JSON",
    })
  };

  public async run(): Promise<{ name: string; dropped: boolean }> {
    const { flags } = await this.parse(EventlogDrop);
    const orbitdb = await startOrbitDB(true, !flags.json);
    const name = await resolveDBIdByName(orbitdb, flags.name, "eventlog");
    const DBExists = await doesDBExists(orbitdb, name);

    if (!DBExists) {
      this.error(`database '${flags.name}' (or '${name}') does not exist`);
    }

    const db = await openDB(orbitdb, name, "eventlog", { showSpinner: !flags.json });

    if (!flags.yes) {
      const confirm = await ux.prompt(
        `Are you sure you want to drop the database '${name}' (y/n)?`,
      );
      if (confirm !== "y") {
        this.log('aborting (response was not "y")');
        await stopOrbitDB(orbitdb, !flags.json);
        return { "name": flags.name, "dropped": false };
      }
    }

    // this was in https://github.com/orbitdb/orbit-db-cli/blob/f70880de90e8d1005a936bea93736ef762f25321/src/commands/drop.js#L35C5-L36C1
    const dbCachePath = path.join(
      "./",
      db._cache.path +
        "/" +
        db.address.toString().replace("/orbitdb/", "") +
        ".orbitdb",
    );

    if (!flags.json) ux.action.start(`dropping database ${name}`);
    await db.drop();
    await db.close();
    await rm(dbCachePath, { recursive: true, force: true });
    if (!flags.json) ux.action.stop();
    await stopOrbitDB(orbitdb, !flags.json);
    return { "name": flags.name, "dropped": true };
  }
}
