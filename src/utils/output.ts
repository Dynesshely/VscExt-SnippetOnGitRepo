import * as vscode from "vscode";
import * as os from "os";

import * as defs from "../defs";

var output: Output | null;

export class Output {
  private oc: vscode.OutputChannel;

  public constructor(context: vscode.ExtensionContext) {
    const output_channel = vscode.window.createOutputChannel(
      defs.output_channel_name
    );
    context.subscriptions.push(output_channel);

    this.oc = output_channel;

    output = this;
  }

  public write(value: string): void {
    this.oc.append(value);
  }

  public writeln(value: string): void {
    this.oc.appendLine(value);
  }

  public infoln(value: string): void {
    this.writeln(`\x1b[36m${value}\x1b[0m`);
  }

  public errorln(value: string): void {
    this.writeln(`\x1b[31m${value}\x1b[0m`);
  }

  private _wrap(value: string, level: string | null) {
    const optional_space = level === null ? "" : " ";
    return `${new Date().toISOString()}${optional_space}${level} ${value}`;
  }

  public log(value: string, level: string | null): void {
    this.write(this._wrap(value, level));
  }

  public logln(value: string, level: string | null): void {
    this.writeln(this._wrap(value, level) + "\n");
  }

  public info_logln(value: string): void {
    this.logln(value, "[INF]");
  }

  public error_logln(value: string): void {
    this.logln(value, "[ERR]");
  }
}

export function output_channel(context?: vscode.ExtensionContext): Output {
  if (output === null && context !== null) {
    output = new Output(context!);
  }

  if (output !== null) {
    return output;
  } else {
    throw Error(
      "You can not call this function without initialize a Output or pass context argument"
    );
  }
}

declare global {
  interface String {
    wrap_if_not_on(trailling: string, platform: string): string | null;
  }
}

String.prototype.wrap_if_not_on = function (
  this: string | null,
  trailling: string,
  platform: string
): string | null {
  if (os.platform() !== platform) {
    return `${trailling}${this}${trailling}`;
  } else {
    return this;
  }
};
