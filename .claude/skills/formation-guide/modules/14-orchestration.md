# Module 14 — Orchestration & la plateforme SDLC « Harry »
Fiche : §14 · Profils : tous · Durée : ~15 min

## Concept
Une feature, on l'a déroulée à la main. Un vrai chantier = N stories **avec dépendances** (le front
consomme le contrat du back). Il faut **cadrer / découper** (`/scope` → `/refine` → un DAG de
stories) puis **orchestrer** : un Workflow déterministe lance les agents dans le bon ordre, parallélise
l'indépendant, pose des gates humaines. Harry = la session qui orchestre ; les agents exécutent.
Engine open source : `harry-sdlc-local` (hors de ce repo).

## Pas 1/1 — Ton PRD en DAG
**Exercice (tous)** : reprends ta feature du module 10 (`docs/features/<slug>.md`). Demande :
> Découpe cette feature en 2 à 4 stories (back / front / autre), déclare leurs dépendances, et ajoute une section « Dépendances (DAG) » au fichier, en texte ou en mermaid. Ne code pas.

po : c'est ton métier — challenge le découpage (une story = livrable seule ? testable seule ?).
Puis réponds : quelles stories peuvent tourner **en parallèle** ?
**Vérification** : je vérifie que le fichier contient une section Dépendances avec ≥ 2 stories et ≥ 1 dépendance
explicite.

## À retenir
Sans DAG, une flotte d'agents fait les choses dans le désordre. Le cadrage (scope → refine) rend
l'autonomie sûre — et c'est un travail de PO / techlead, pas de l'IA.
