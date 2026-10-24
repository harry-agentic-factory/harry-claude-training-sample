---
description: Run a simulated trainee through /formation (sandbox, real tutor session, simulated student) and report wording feedback. Optional argument — module numbers such as "4 6 12", or "full".
argument-hint: "[module numbers | full]"
---
Run a simulation of the `/formation` training and report feedback.
Argument: `$ARGUMENTS`

1. Read `tools/simulation/README.md` first and follow its strategy and pitfalls. Do not improvise another setup.
2. Decide which modules to run. No argument: the modules changed on the current branch compared with `main`
   (`git diff --name-only main -- .claude/skills/formation-guide/modules`). A whole-path run only if the argument is `full`.
3. Tell the user the expected cost and the modules you will run **before** launching (README, "What it costs"). Do not
   add a cost cap, but never start a full run without saying it first.
4. One sandbox per run (`make-sandbox.sh`, with `--feature` for modules 11, 12 and 14), launched detached, in parallel.
   Wait with bounded polls, then `analyze.mjs` each run.
5. Report in the README's "Feedback report" order. Separate real defects from artefacts of the simulation, and check
   any factual claim against the files before calling it a defect.
6. Do not run the scenarios that read the user's global settings (S8, S9, S11 of `permission-matrix.mjs`) without asking.
