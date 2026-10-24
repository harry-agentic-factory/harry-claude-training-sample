# Simulating a trainee

How to test the `/formation` tutor without a human: a **real tutor session** (headless Claude Code in a throwaway copy of
the repo) talks to a **simulated student** that answers in character and rates every tutor message. Built and tuned during
the "clarity pass" of October 2026; the numbers below come from those runs.

## When to use it

- After changing a module, `SKILL.md` or `/formation`: re-run only the modules you touched.
- Before a training session: a quick targeted pass on the modules that changed.
- It tests the **wording and the flow** (undefined terms, "where do I type?", message length). It does **not** replace a
  human walkthrough, see [Limits](#limits-of-a-headless-simulation).

## Quick start

```bash
# 1. a throwaway copy: fresh git history, no remote, clean tree (--feature adds the prerequisite of modules 11, 12, 14)
bash tools/simulation/make-sandbox.sh /tmp/sim-m04
# 2. one targeted run, detached so it survives a restart of your editor session
SANDBOX=/tmp/sim-m04/repo OUT_DIR=/tmp/sim-m04/out START_MODULE=4 MAX_TURNS=40 \
  nohup node tools/simulation/run-simulation.mjs > /tmp/sim-m04/run.log 2>&1 < /dev/null &
# 3. when it prints "done:"
node tools/simulation/analyze.mjs /tmp/sim-m04/out
```

Without `START_MODULE` the run follows the whole path from the welcome message. Run several modules in parallel, one
sandbox each (`/tmp/sim-m04`, `/tmp/sim-m06`…): sandboxes share nothing.

## How it works

1. **Tutor**: `claude -p "<message>" --resume <session>` in the sandbox, `--setting-sources project` (only the repo's own
   settings: no personal instructions or skills), `--permission-mode acceptEdits` and `Bash` allowed (a headless session
   cannot answer a permission prompt). The first message is `/formation`.
2. **Student**: a second headless call (Haiku, no tools) receives a persona, the last 8 exchanges and the tutor's latest
   message, and returns JSON: the message to type plus `clarte` (1-5), `confusion`, `reformulation`, `longueur`. The tutor
   never sees those notes.
3. **Loop**: the student's message is sent back to the tutor session. A targeted run jumps to the module with
   `/formation <n>` after the welcome exchange and stops when the module is finished.
4. **Isolation**: the environment is rebuilt from scratch (no `CLAUDE_*` or `VSCODE_*` variable, so the tutor sees a plain
   terminal), `open`/`xdg-open`/`code` are shims that log instead of opening anything, and the sandbox has no remote.

## What it costs

Measured on a subscription, in notional dollars:

| Run | Turns | Cost |
|---|---|---|
| Pilot | 3 | ~0.3 $ |
| One targeted module | 8-18 | ~1-4 $ |
| **Whole path (modules 00-17)** | ~100 | **~215 $** |

Modules 10 (`/implement`), 11 and 12 are the heavy ones. The first estimate for a full run (~10 $) was off by a factor 20:
do not launch a full run without saying so first. There is no cost cap in the scripts, only `MAX_TURNS`.

## Reading the results

`analyze.mjs` prints the global metrics, the metrics per module, the exit criteria and the turns to re-read.

- **The score is a weak signal**: the simulated student rates almost everything around 4. Read the written `confusion`
  lines instead. The count of turns with a confusion is not comparable between runs (the persona is told to ask questions).
- **Exit criteria** used for the clarity pass: no undefined term reported, no "where do I type?", no tutor message over
  220 words (code blocks excluded), every module of the path reached.
- **Baselines** (same student, before -> after the pass): module 07 clarity 3.00 -> 3.67 and longest message 724 -> 224
  words; module 04 3.93 -> 4.14; module 11 4.00 -> 4.14; module 12 3.65 -> 3.64 (limited by the simulation itself).

## Limits of a headless simulation

These are **artefacts**, not defects of the training: ignore them when reading the feedback.

- It cannot press Shift+Tab, answer a permission prompt, use `/exit`, open a file in an editor or look at a browser. The
  student says what it "saw". Modules 04, 06, 07 and 12 are therefore validated on wording only.
- `/status` is unavailable and `/context` returns a raw table.
- The sandbox is an **untrusted workspace**: the project's `permissions.allow` rules and hooks are ignored (the stderr says
  so). Hook-based exercises (module 06) cannot be validated this way. Test the hook script directly instead: pipe the tool
  JSON to its stdin, exit code 2 means blocked.
- The tutor sometimes quotes the sandbox path (`/private/tmp/...`) that a trainee would never see.

## Pitfalls learned

- **Detach long runs** with `nohup ... < /dev/null &`: a run started from the editor session dies when it is reloaded.
  Kill a stuck run by PID (`pkill -f "node .*run-simulation"`).
- **Jumping to a module whose prerequisite is missing** (11, 12, 14 need a feature file in `docs/features/`) makes the tutor
  propose a detour: build the sandbox with `--feature`.
- **A fake `HOME` loses the login**: keep the real `HOME` and isolate with `--setting-sources project`.
- **The project's protected-branch hook** reads the whole command line: `git push` and the word `main` in the same command
  is blocked even for a feature branch. Push first, create the PR in a second command.
- Check what the tutor claims against the files before blaming it: in one run the tutor was right about a setting and the
  analysis wrongly called it a hallucination.

## Feedback report

When asked "run a simulation and give me the feedback", report in this order and keep it short:

1. The numbers: turns, mean clarity, "too long" count, longest message, cost, modules reached.
2. Real defects, ranked by impact, each with the quoted confusion and the proposed rewording.
3. Artefacts of the simulation to ignore.
4. What was not covered, and what only a human can check.
5. A proposal: which fixes to apply, which modules to re-run.

## Loop engineering procedure

1. State the exit criteria first (above).
2. Run the modules changed since the last pass, in parallel, with `analyze.mjs`.
3. Fix the real defects in the modules and in `.claude/skills/formation-guide/SKILL.md`.
4. Re-run only those modules and compare with the baselines. Stop when the criteria hold, or after three rounds.
5. Verify every factual claim you add (tool lists, UI labels, settings behaviour) against the files or the docs.

## Permission behaviour, verified

`permission-matrix.mjs` runs 13 scenarios (Claude Code 2.1.309) that ask a headless session to write a control file and a
file under `.claude/skills/`. Results:

| Fact | Evidence |
|---|---|
| Writes under `.claude/` ask for confirmation in `default` and `acceptEdits` | S1, S4 |
| An `allow` rule, even an absolute-path one, does not remove that confirmation (it does for other paths) | S2b, S2c |
| `auto` lets the write through when the classifier approves it | S3 |
| `defaultMode: auto` is ignored in project and local settings | S5, S6 |
| `defaultMode: acceptEdits` is honoured from `settings.local.json` | S7 |
| `bypassPermissions` lets everything through | S10 |
| An explicit project `defaultMode` overrides the personal `auto` at session start | S8, S9 |
| Without a project `defaultMode`, the personal `auto` applies; a user without global settings starts in `default` | S11, S12 |

Not testable headless: hot reload of `defaultMode`, the destination of the "allow for this project (shared)" choice, and the
VS Code extension, which takes its starting mode from the `claudeCode.initialPermissionMode` VS Code setting (set to `auto`
there, the confirmations under `.claude/` stopped).

## Files

| File | Role |
|---|---|
| `make-sandbox.sh` | builds the throwaway repo copy |
| `run-simulation.mjs` | tutor/student loop |
| `analyze.mjs` | metrics, exit criteria, turns to re-read |
| `permission-matrix.mjs` | the permission scenarios above (S8, S9, S11 read your global settings) |
