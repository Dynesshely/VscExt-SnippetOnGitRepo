import * as vscode from "vscode";
import { exec, execSync, spawn } from "child_process";
import { promisify } from "util";

import * as defs from "../defs";
import { func_set_repository_url } from "./set_repository_url";
import { output_channel } from "../utils/output";

export async function func_sync_now(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration(defs.ext_name);
  var git_repo_url = config.get<string>("repositoryUrl", defs._undefined);
  while (git_repo_url === defs._undefined) {
    if ((await func_set_repository_url(context)) === false) {
      break;
    }
    git_repo_url = config.get<string>("repositoryUrl", defs._undefined);
  }

  if (git_repo_url === defs._undefined) {
    return;
  }

  const tasks: ((() => void) | string | number)[] = [
    "Checking git repo url",
    async () => {
      const command = `git ls-remote ${git_repo_url}`;
      const cp = exec(command, (error, stdout, stderr) => {
        if (error) {
          output_channel().errorln(`[ERR!] Error of: ${command}\n...`); // ${error}
          vscode.window.showInformationMessage(
            "Your git repo url is not valid"
          );
          return;
        } else {
          // vscode.window.showInformationMessage("Valid git repo url");
        }
        output_channel().infoln(`[EXEC] Stdout of: ${command}\n${stdout}`);
        if (stderr) {
          output_channel().errorln(`[EXEC] Stderr of: ${command}\n${stderr}`);
        }
      });
      await new Promise((resolve) => {
        cp.on("close", resolve);
      });
      return cp.exitCode === 0;
    },
    "Downloading git repo",
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return true;
    },
  ];

  const result = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      title: "Syncing your snippets",
      cancellable: true,
    },
    async (progress, token) => {
      progress.report({ increment: 0 });

      var proRes = "Your code snippets synced!";

      for (let i = 0; i < tasks.length; i += 2) {
        if (token.isCancellationRequested) {
          await vscode.window.showInformationMessage(
            "Snippets Sync Canceled !"
          );
          return -1;
        }

        progress.report({
          increment: (2 / tasks.length) * 100,
          message: `(${(i + 2) / 2}/${tasks.length / 2}) ${tasks[i]}`,
        });

        if (typeof tasks[i + 1] === "function") {
          if (await (tasks[i + 1] as Function)()) {
            continue;
          } else {
            proRes =
              "You have input not valid git repo url or you have no access to this repo";
            break;
          }
        }
      }

      return proRes;
    }
  );
  if (result !== -1) {
    await vscode.window.showInformationMessage(`${result}`);
  }
}
