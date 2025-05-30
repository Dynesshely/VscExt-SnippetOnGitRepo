import * as vscode from "vscode";
import * as os from "os";
import { exec, execSync, spawn } from "child_process";
import { promisify } from "util";

import "../utils/platform";
import "../utils/cli";
import * as defs from "../defs";
import { func_set_repository_url } from "./set_repository_url";
import { PathResolver } from "../utils/path";
import { output_channel } from "../utils/output";
import { text } from "stream/consumers";
import { randomUUID } from "crypto";
import path from "path";

export async function func_sync_now(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration(defs.ext_name);
  const cn = defs.config_names;
  var git_repo_url = config.get<string>(cn.repositoryUrl, defs._undefined);
  while (git_repo_url === defs._undefined) {
    if ((await func_set_repository_url(context)) === false) {
      break;
    }
    git_repo_url = config.get<string>(cn.repositoryUrl, defs._undefined);
  }

  if (git_repo_url === defs._undefined) {
    return;
  }

  const pathResolvers = [
    new PathResolver().use(defs.snippets_location_win),
    new PathResolver().use(defs.snippets_location_linux),
    new PathResolver().use(defs.snippets_location_macos),
  ];
  const snippetsLocation = pathResolvers.selectByPlatforms(
    new Map(
      Object.entries({
        win32: 0,
        linux: 1,
        darwin: 2,
      })
    )
  );
  const src_dir = path.join(context.extensionPath, "resources");
  const scripts = path.join(src_dir, "scripts");
  const tmp_dir = `${os.tmpdir()}/${randomUUID()}`;

  output_channel().info_logln("[EXEC] Begin to sync your snippets ...");

  const terminal = vscode.window.createTerminal({
    name: defs.terminal_name,
  });

  const tasks: ((() => void) | string | number)[] = [
    "Checking git repo url",
    async () => {
      const command = `git ls-remote ${git_repo_url}`;
      // terminal.sendText(command, true);
      const cp = exec(command, (error, stdout, stderr) => {
        if (error) {
          output_channel().error_logln(`[EXEC] Error of: ${command}\n...`); // ${error}
          vscode.window.showInformationMessage(
            "Your git repo url is not valid"
          );
          return;
        } else {
          output_channel().info_logln("[EXEC] Valid url, fetching ...");
          // vscode.window.showInformationMessage("Valid git repo url");
        }
        output_channel().info_logln(`[EXEC] Stdout of: ${command}\n${stdout}`);
        if (stderr) {
          output_channel().error_logln(
            `[EXEC] Stderr of: ${command}\n${stderr}`
          );
        }
      });
      await new Promise((resolve) => {
        cp.on("close", resolve);
      });
      return cp.exitCode === 0;
    },
    "Downloading git repo",
    async () => {
      const platform_mapper = new Map<String, number>();
      platform_mapper.set("win32", 1);
      platform_mapper.set("linux", 0);
      platform_mapper.set("darwin", 0);
      const preInstallScriptPath = config.get<string>(
        cn.preInstallScriptPath,
        defs._null
      );
      const commands = [
        // Create temp directory & Change location
        'echo ">>> Initializing ..."',
        `mkdir ${tmp_dir}`,
        `cd ${tmp_dir}`,
        // Clone repository & Pre-Installation script
        'echo ">>> Fetching snippets ..."',
        `git clone ${git_repo_url} snippets --depth 1`,
        preInstallScriptPath === defs._null
          ? 'echo ">>> No pre-installation script to execute."'
          : `pwsh -c ./snippets/${preInstallScriptPath}`,
        // Expand and select only .code-snippets file
        'echo ">>> Expanding and selecting .code-snippets files ..."',
        "cd snippets",
        `cp "${path.join(scripts, "expand-and-select.ps1")}" ./`,
        "pwsh -c ./expand-and-select.ps1",
        "cd ..",
        // Remove `.git` folder
        [
          `rm -rf snippets/.git`,
          `Remove-Item snippets/.git -Force`,
        ].selectByPlatforms(platform_mapper),
        // Clean files
        [
          `rm -rf \"${snippetsLocation.resolve()}\"`,
          `Remove-Item \"${snippetsLocation.resolve()}\" -Force`,
        ].selectByPlatforms(platform_mapper),
        // Move files
        'echo ">>> Moving snippets ..."',
        [
          `mv ./snippets${config.get<string>(
            cn.subDirectory,
            "/"
          )} \"${snippetsLocation.resolve()}\"`,
          `Move-Item ./snippets${config.get<string>(
            cn.subDirectory,
            "/"
          )} \"${snippetsLocation.resolve()}\"`,
        ].selectByPlatforms(platform_mapper),
        // Clean
        'echo ">>> Cleaning ..."',
        "cd ../..",
        [
          `rm -rf \"${tmp_dir}\"`,
          `Remove-Item \"${tmp_dir}\" -Force`,
        ].selectByPlatforms(platform_mapper),
        // Done
        'echo ">>> Done."',
      ];
      terminal.sendText(commands.join_cmds(null), true);
      // vscode.window.showInformationMessage(`Cloned to: ${tmp_dir}`);
      // await new Promise((resolve) => setTimeout(resolve, 2000));
      // await vscode.window.showErrorMessage("Your code snippets synced !");
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
              "Err: You have input not valid git repo url or you have no access to this repo";
            break;
          }
        }
      }

      return proRes;
    }
  );
  if (result !== -1 && result.startsWith("Err")) {
    await vscode.window.showErrorMessage(`${result}`);
  }
}
