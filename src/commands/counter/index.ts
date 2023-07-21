import { Command } from "@oclif/core";

export default class Counter extends Command {
  static description = "counter related commands (see examples below)";

  static examples = ["<%= config.bin %> <%= command.id %> --help"];

  static flags = {};

  static args = {};

  public async run(): Promise<void> {
    this.error("try 'counter --help' for more information");
  }
}
