# Parcours par profil

| Module | Titre | dev | po | techlead | Durée dev / po (min) |
|---|---|:-:|:-:|:-:|---|
| 00 | Préparation | ✅ 3 pas | ✅ 3 pas | ✅ 3 pas | 15 / 15 |
| 01 | Un LLM, un copilot | ✅ | ✅ | ✅ | 10 / 10 |
| 02 | Les acteurs | ○ | ✅ | ○ | 5 / 5 |
| 03 | Se connecter | ✅ | ✅ | ✅ | 5 / 5 |
| 04 | Les modes | ✅ 2 pas | ✅ pas 1 | ✅ 2 pas | 15 / 10 |
| 05 | CLAUDE.md & memory | ✅ 2 pas | ✅ 2 pas | ✅ 2 pas | 15 / 15 |
| 06 | settings / hooks / rules | ✅ 3 pas | ✅ pas 1 + question | ✅ 3 pas (+ rule) | 25 / 10 |
| 07 | Session | ✅ | ✅ | ✅ | 10 / 10 |
| 08 | Modèle | ✅ | ✅ | ✅ | 5 / 5 |
| 09 | Brain | ✅ pas 1 | ✅ pas 1 | ✅ 2 pas | 10 / 10 (techlead 20) |
| 10 | Commands | ✅ 4 pas | ✅ pas 1-2 | ✅ 4 pas | 45 / 25 |
| 11 | Agents | ✅ 2 pas | ✅ pas 1 | ✅ 2 pas | 15 / 10 |
| 12 | Skills | ✅ | ○ question | ✅ | 15 / 5 |
| 13 | MCP | ✅ | ✅ | ✅ | 15 / 15 |
| 14 | Orchestration | ✅ | ✅ | ✅ | 15 / 15 |
| 15 | Ce qu'on oublie | ✅ | ○ | ✅ | 10 / 10 |
| 16 | L'humain | ✅ | ✅ | ✅ | 5 / 5 |
| 17 | Repo & bilan | ✅ | ✅ | ✅ | 5 / 5 |

✅ = dans le parcours · ○ = optionnel (proposé, jamais imposé).

Totaux indicatifs, hors pauses et échanges avec le formateur :
**dev ≈ 4 h** · **po ≈ 2 h 45** · **techlead ≈ 4 h 30**.

## Ordre et prérequis
Ordre numérique. Prérequis durs : **00** avant tout ; **00 pas 3** (app lancée) avant 11 et 13 ;
**10** (feature cadrée) avant 11, 12 et 14, qui la réutilisent.

## Mode formateur (synchro)
Le formateur annonce « tout le monde tape `/formation 11` » : chacun saute au module 11 quel que soit
son état. Le tuteur enregistre les modules sautés dans `sautes` et les propose au `bilan` ou en
auto-formation après la session.

## Mode auto-formation
`/formation` puis `suivant` à son rythme, sur plusieurs sessions (`claude --continue`). Le tuteur
reprend où le stagiaire s'est arrêté.
