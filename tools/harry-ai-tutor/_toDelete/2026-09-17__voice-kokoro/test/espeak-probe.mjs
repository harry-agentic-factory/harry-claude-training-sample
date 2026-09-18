import ESpeakNg from "espeak-ng";
const text = process.argv[2] ?? "Bienvenue Sam ! Module zéro, pas un sur trois : ta branche. On ne travaille jamais sur main.";
for (const variant of [["--ipa"], ["--ipa=3", '--sep=""'], ["--ipa", "--sep="]]) {
  const t0 = Date.now();
  const m = await ESpeakNg({ arguments: ["--phonout", "out.txt", "-q", "-b=1", ...variant, "-v", "fr-fr", text], print: () => {}, printErr: () => {} });
  const out = m.FS.readFile("out.txt", { encoding: "utf8" });
  console.log(variant.join(" "), "|", Date.now() - t0, "ms |", JSON.stringify(out.trim()));
}
