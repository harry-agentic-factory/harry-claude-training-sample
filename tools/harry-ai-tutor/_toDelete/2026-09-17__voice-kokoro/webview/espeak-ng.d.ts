declare module "espeak-ng" {
  const ESpeakNg: (opts?: Record<string, unknown>) => Promise<{ FS: { readFile(path: string, opts: { encoding: "utf8" }): string } }>;
  export default ESpeakNg;
}
