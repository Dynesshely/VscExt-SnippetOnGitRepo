import * as vscode from "vscode";
import * as os from "os";

import "../utils/path";
import * as defs from "../defs";
import * as main from "../extension";
import { output_channel } from "../utils/output";
import { PathResolver } from "../utils/path";

export function func_doctor(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration(
    "dynesshely-vscext-snippet-on-git-repo"
  );
  const paths = [
    new PathResolver()
      .use(defs.snippets_location_win)
      .resolve()
      ?.wrap_if_not_on("~~", "win32"),
    new PathResolver()
      .use(defs.snippets_location_linux)
      .resolve()
      ?.wrap_if_not_on("~~", "linux"),
    new PathResolver()
      .use(defs.snippets_location_macos)
      .resolve()
      ?.wrap_if_not_on("~~", "darwin"),
    os.tmpdir(),
  ];
  const content = [
    "## Doctor Result",
    "",
    "### Platform",
    "",
    `- OS Architecture: \`${os.arch()}\``,
    `- OS Release: \`${os.release()}\``,
    `- OS Version: \`${os.version()}\``,
    `- OS Platform: \`${os.platform()}\``,
    `- OS Total Memory: \`${os.totalmem() / 1024 / 1024 / 1024} GB\``,
    "",
    `### Config`,
    "",
    "```json",
    `${JSON.stringify(config, null, 2)}`,
    "```",
    "",
    `### Path`,
    "",
    `- Snippets location [WIN]:`,
    `  - \`${paths[0]}\``,
    `- Snippets location [LNX]:`,
    `  - \`${paths[1]}\``,
    `- Snippets location [MAC]:`,
    `  - \`${paths[2]}\``,
    `- System temp directory:`,
    `  - \`${paths[3]}\``,
    "",
  ].join("\n");
  const uri = vscode.Uri.parse(
    `${
      defs.provider_names.show_general_info
    }://example/path/to/doctor-result.md?${btoa(encodeURIComponent(content))}`
  );
  vscode.workspace.openTextDocument(uri).then((doc) => {
    vscode.window.showTextDocument(doc, { preview: false });
  });
}
