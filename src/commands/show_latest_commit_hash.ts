import * as vscode from "vscode";

export function func_show_latest_commit_hash(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration(
    "dynesshely-vscext-snippet-on-git-repo"
  );
  const latest_commit_hash = config.get<string>(
    "latestCommitHash",
    "@undefined"
  );
  vscode.window.showInformationMessage(
    `Latest Commit Hash: ${latest_commit_hash}`
  );
}
