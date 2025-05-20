import * as os from "os";

declare global {
  interface Array<T> {
    selectByPlatforms(platforms: Map<String, number>): T;
  }
}

Array.prototype.selectByPlatforms = function <T>(
  this: Array<T>,
  platforms: Map<String, number>
) {
  const index = platforms.get(os.platform().toString()) as number;
  return this[index];
};
