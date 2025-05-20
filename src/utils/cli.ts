declare global {
  interface Array<T> {
    join_cmds(connector: null | string): string;
  }
}

Array.prototype.join_cmds = function (
  this: Array<string>,
  connector: null | string = null
): string {
  if (connector === null) {
    connector = " && ";
  }
  return this.join(connector);
};
