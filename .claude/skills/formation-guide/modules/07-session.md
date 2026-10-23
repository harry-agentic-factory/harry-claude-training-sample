# Module 07 — Session : quitter et reprendre
Fiche : §7 · Profils : tous · Durée : ~10 min

## Concept
Une **session** est une conversation sauvegardée : tu peux la fermer et la rouvrir plus tard sans rien perdre. Pour la
rouvrir : `claude --continue` (la dernière) ou `claude --resume` (au choix). Deux commandes utiles : `/context` (de quoi
est remplie la conversation) et `/compact` (la résume pour faire de la place). Ce qui doit durer longtemps vit dans des
**fichiers**, pas dans la conversation.

## Pas 1/2 — Voir le remplissage de la conversation
<!-- tuteur : quand le stagiaire tape `/context`, ne recopie PAS le tableau brut. Résume en 2 lignes : le pourcentage utilisé et ce qui pèse le plus. indices — 1) « /context commence par une barre oblique. » 2) « Cherche le pourcentage d'espace utilisé. » -->
**Cas concret** : après une longue session, Claude te semble moins précis. Tu veux savoir s'il manque de place.

**Exercice** : tape `/context` dans la conversation.

**Vérification** : tu me donnes le pourcentage utilisé et ce qui pèse le plus.

## Pas 2/2 — Quitter et reprendre
<!-- tuteur : c'est le seul moment du parcours où le stagiaire doit sortir de la conversation et relancer Claude Code dans un terminal. Dis-le clairement, une fois. -->
**Cas concret** : tu t'arrêtes en milieu de journée et tu reviens après le déjeuner, ou le lendemain.

**Exercice** : tape `/exit` pour quitter Claude Code. Dans ton terminal, relance au même endroit :
```
claude --continue
```
Puis tape `/formation` : je te reconnais et je te propose de reprendre ici.

**Vérification** : à la reprise, je te salue par ton prénom et je te propose de continuer.

Fichier clé : `.formation/progress.json` (c'est lui qui retient ta place, pas la conversation).

## À retenir
La conversation persiste, mais l'état d'un travail long doit être écrit dans un fichier.
