# Module 14 — Orchestration
Fiche : §14 · Profils : tous · Durée : ~15 min

## Concept
Un vrai chantier, ce sont plusieurs **stories avec dépendances** : le front attend le contrat du back. Il faut
d'abord **cadrer et découper** (`/scope` → `/refine`, qui produit un schéma montrant qui dépend de qui, appelé **DAG**), puis
**orchestrer** : lancer les agents dans le bon ordre, en parallèle quand c'est indépendant, avec des validations
humaines. Harry est la session qui orchestre ; les agents exécutent.

## Pas 1/1 — Ton PRD en DAG
**Cas concret** : ta feature touche l'API et l'interface. Qui commence ? Que peut-on faire en même temps ?

**Exercice** : reprends ta feature du module 10 (`docs/features/<slug>.md`) et demande :
> Découpe cette feature en 2 à 4 stories (back / front / autre), déclare leurs dépendances, et ajoute une section « Dépendances (DAG) » au fichier, en texte ou en mermaid. Ne code pas.

po : challenge le découpage (une story est-elle livrable seule ? testable seule ?). Puis dis-moi quelles
stories peuvent tourner **en parallèle**.

**Vérification** : le fichier contient une section Dépendances avec au moins 2 stories et 1 dépendance
explicite.

Fichier clé : `docs/features/<slug>.md`.

## À retenir
Sans DAG, des agents en parallèle travaillent dans le désordre. Le cadrage rend l'autonomie sûre : c'est un
travail de PO ou de techlead, pas de l'IA.
