import path from "path";
import os from "os";

export class PathResolver {
  private _toResolve: string | null;

  public constructor() {
    this._toResolve = null;
  }

  public use(path: string) {
    this._toResolve = path;
    return this;
  }

  public resolve(): string | null {
    if (this._toResolve === null) {
      return null;
    }
    const replaced = this._toResolve?.replace("~", os.homedir());
    const result = path.resolve(replaced);
    return result;
  }
}
