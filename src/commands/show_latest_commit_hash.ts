import * as vscode from "vscode";
import * as defs from "../defs";

export function func_show_latest_commit_hash(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration(defs.ext_name);
  const latest_commit_hash = config.get<string>(
    defs.config_names.latestCommitHash,
    defs._undefined
  );
  vscode.window.showInformationMessage(
    `Latest Commit Hash: ${latest_commit_hash}`
  );
}
