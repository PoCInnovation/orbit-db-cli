import { Command } from "@oclif/core";

export default class KeyValue extends Command {
  static description =
    "Docstore type database related commands (see examples below)";

  static examples = ["<%= config.bin %> <%= command.id %> --help"];

  static flags = {};

  static args = {};

  public async run(): Promise<void> {
    this.error("try with flag '--help' for more information");
  }
}
