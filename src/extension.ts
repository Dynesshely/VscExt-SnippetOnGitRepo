import * as vscode from "vscode";

import * as defs from "./defs";
import { Output } from "./utils/output";
import { build_cmd, build_provider } from "./composer";
import { func_doctor } from "./commands/doctor";
import { func_set_repository_url } from "./commands/set_repository_url";
import { func_sync_now } from "./commands/sync_now";
import { func_show_latest_commit_hash } from "./commands/show_latest_commit_hash";

export function activate(context: vscode.ExtensionContext) {
  const output = new Output(context);
  output.info_logln(`[EXT_] Ext activated ! (${defs.ext_name})`);

  build_cmd(
    context,
    defs.commands_names.set_repository_url,
    async () => await func_set_repository_url(context)
  );
  build_cmd(
    context,
    defs.commands_names.syncnow,
    async () => await func_sync_now(context)
  );
  build_cmd(context, defs.commands_names.show_latest_commit_hash, () =>
    func_show_latest_commit_hash(context)
  );
  build_cmd(context, defs.commands_names.doctor, () => func_doctor(context));
  build_provider(
    context,
    defs.provider_names.show_general_info,
    new (class implements vscode.TextDocumentContentProvider {
      provideTextDocumentContent(uri: vscode.Uri): string {
        return decodeURIComponent(atob(uri.query));
      }
    })()
  );
}

export function deactivate() {}
