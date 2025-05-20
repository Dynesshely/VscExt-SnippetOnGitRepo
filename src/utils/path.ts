import path from "path";
import os from "os";
import fs from "fs";

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

  public recurse(
    processor: (path: string, depth: number, isDirectory: boolean) => void
  ): void {
    if (!this._toResolve) {
      return;
    }

    const toProcess: string[] = [this._toResolve];
    const levelEndTag = "$$$%%%(Level+Ended)%%%$$$";
    var depth = 0;

    while (toProcess.length > 0) {
      const first = toProcess.shift();
      if (first === levelEndTag) {
        ++depth;
        continue;
      }
      try {
        const dir = first as string;
        const subitems = fs.readdirSync(dir);
        for (const item of subitems) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            toProcess.push(fullPath);
            processor(item, depth, true);
          } else {
            processor(item, depth, false);
          }
        }
        toProcess.push(levelEndTag);
      } catch {}
    }
  }

  public recurseToText(): string {
    if (!this._toResolve) {
      return "";
    }

    const generateSimpleDirectoryTree = (
      dirPath: string,
      prefix: string = ""
    ): string => {
      const items = fs.readdirSync(dirPath);
      let tree = "";

      items.forEach((item, index) => {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);
        const isLast = index === items.length - 1;

        if (stats.isDirectory()) {
          tree += `${prefix}+ ${item}\n`;
          tree += generateSimpleDirectoryTree(fullPath, `${prefix}  `);
        } else {
          tree += `${prefix}- ${item}\n`;
        }
      });

      return tree;
    };

    return generateSimpleDirectoryTree(this.resolve() as string, "  ");
  }
}
