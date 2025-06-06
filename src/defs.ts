export const snippets_location_win = "%APPDATA%\\Code\\User\\snippets\\";
export const snippets_location_macos =
  "~/Library/Application Support/Code/User/snippets/";
export const snippets_location_linux = "~/.config/Code/User/snippets/";

export const ext_name = "snippets-over-git";

export const commands_names = {
  set_repository_url: `${ext_name}.set-repository-url`,
  syncnow: `${ext_name}.sync-now`,
  show_latest_commit_hash: `${ext_name}.show-latest-commit-hash`,
  doctor: `${ext_name}.doctor`,
};

export const provider_names = {
  show_general_info: `${ext_name}.show_general_info`,
};

export const output_channel_name = `Snippets over Git`;

export const terminal_name = `[Terminal] Snippets over Git`;

export const config_names = {
  repositoryUrl: "repositoryUrl",
  syncInterval: "syncInterval",
  latestCommitHash: "latestCommitHash",
  preInstallScriptPath: "preInstallScriptPath",
  subDirectory: "subDirectory",
};

export const _undefined = "@undefined";

export const _null = "@null";
