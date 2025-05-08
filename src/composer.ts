import * as vscode from "vscode";

export function build_cmd(
  context: vscode.ExtensionContext,
  name: string,
  callback: (...args: any[]) => any,
  thisArg?: any
) {
  const cmd = vscode.commands.registerCommand(name, callback, thisArg);
  context.subscriptions.push(cmd);
}

export function build_provider(
  context: vscode.ExtensionContext,
  name: string,
  provider: vscode.TextDocumentContentProvider
) {
  const disposable = vscode.workspace.registerTextDocumentContentProvider(
    name,
    provider
  );
  context.subscriptions.push(disposable);
}
