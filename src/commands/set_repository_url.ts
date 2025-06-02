import * as vscode from "vscode";
import * as defs from "../defs";

export async function func_set_repository_url(
  context: vscode.ExtensionContext
) {
  const new_url = await vscode.window.showInputBox({
    prompt: "Enter your new repository URL",
  });

  if (new_url && new_url) {
    const config = vscode.workspace.getConfiguration(defs.ext_name);
    config.update(
      defs.config_names.repositoryUrl,
      new_url,
      vscode.ConfigurationTarget.Global
    );
    vscode.window.showInformationMessage(
      `Snippets over Git:\nYour repository URL has been updated to -> ${new_url}`
    );
    return true;
  }
  vscode.window.showInformationMessage(
    `Snippets over Git:\nFailed to update your repository URL configuration`
  );
  return false;
}
