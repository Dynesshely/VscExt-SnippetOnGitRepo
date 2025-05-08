import * as vscode from "vscode";

export async function func_set_repository_url(
  context: vscode.ExtensionContext
) {
  const new_url = await vscode.window.showInputBox({
    prompt: "Enter your new repository URL",
  });

  if (new_url && new_url) {
    const config = vscode.workspace.getConfiguration(
      "dynesshely-vscext-snippet-on-git-repo"
    );
    config.update("repositoryUrl", new_url, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(
      `Vsc-Ext SnippetOnGitRepo:\nYour repository URL has been updated to -> ${new_url}`
    );
    return true;
  }
  vscode.window.showInformationMessage(
    `Vsc-Ext SnippetOnGitRepo:\nFailed to update your repository URL configuration`
  );
  return false;
}
