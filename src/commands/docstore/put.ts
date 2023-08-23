import { Command, Flags, ux } from "@oclif/core";
import { readFile } from "fs";
import { startOrbitDB } from "../../services/start-OrbitDB";
import { stopOrbitDB } from "../../services/stop-OrbitDB";
import { doesDBExists } from "../../utils/does-DBExists";
import { openDB } from "../../utils/open-DB";
import { resolveDBIdByName } from "../../utils/resolve-DBIdByName";
import { saveDB } from "../../utils/save-DB";

export default class DocStorePut extends Command {
  static description = "Add a file to a docstore type database";

  static examples: Command.Example[] = [
    "<%= config.bin %> <%= command.id %> --name=myDocstoreDbName --key=theKey --document=filePath",
  ];

  static flags = {
    // flag with a value (-n VALUE, --name=VALUE)
    dbName: Flags.string({
      char: "n",
      description: "name of the database",
      required: true,
    }),
    // flag with a value (-k VALUE, --key=VALUE)
    key: Flags.string({
      char: "k",
      description: "key of the entry",
      required: true,
    }),
    // flag with a value (-f VALUE, --document=VALUE)
    document: Flags.file({
      char: "f",
      description: "document to add into key entry",
      exists: true,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(DocStorePut);
    const orbitdb = await startOrbitDB(true);
    const dbAdress = await resolveDBIdByName(orbitdb, flags.dbName, "docstore");
    const DBExists = await doesDBExists(orbitdb, dbAdress);

    if (!DBExists) {
      this.error(
        `database '${flags.dbName}' (or '${dbAdress}') does not exist`,
      );
    }
    const db = await openDB(orbitdb, dbAdress, "docstore");

    if (flags.document !== undefined) {
      try {
        ux.action.start(`Reading content of file: ${flags.document}`);
        const fileContent: Buffer = await new Promise((resolve, reject) => {
          readFile(flags.document ?? "", (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        });
        ux.action.stop();
        const doc = { _id: flags.key, content: fileContent.toString("utf-8") };
        ux.action.start(`Adding file content of '${flags.document}' to key '${flags.key}' of ${flags.dbName} database`);
        try {
          await db.put(doc);
          ux.action.stop();
        } catch (error) {
          ux.action.stop("Failed");
          this.error(`Error occured while adding file content of ${flags.document} to key ${flags.key}: ${error}`);
        }
      } catch (error) {
        ux.action.stop("Failed");
        this.error(`Error occured while reading file: ${error}`);
      }
    } else {
      ux.action.start(`Adding file content of '${flags.document}' to key '${flags.key}' of ${flags.dbName} database`);
      try {
        const doc = { _id: flags.key, content: null };
        await db.put(doc);
        ux.action.stop();
      } catch (error) {
        ux.action.stop("Failed");
        this.error(`An Error occured while adding key ${flags.key}: ${error}`);
      }
    }

    await saveDB(db);
    await db.close();
    await stopOrbitDB(orbitdb);
  }
}