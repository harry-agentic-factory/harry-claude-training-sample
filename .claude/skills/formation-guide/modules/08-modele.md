# Module 08 — Choisir le modèle
Fiche : §8 · Profils : tous · Durée : ~5 min

## Concept
On change de modèle avec `/model` (ou `"model"` dans `settings.json`). En pratique : **haiku** = rapide et
économe (tâches simples, volume), **sonnet** = le quotidien, **opus** = le plus capable (architecture,
tâches longues). `/effort` règle la profondeur de raisonnement. Plus capable = plus cher et plus lent.

## Pas 1/1 — Le bon modèle pour la bonne tâche
**Cas concret** : renommer une variable ne demande pas le même modèle que concevoir l'architecture d'un
service.

**Exercice** : tape `/model haiku`, pose une question triviale (« que renvoie GET /health ? »), puis
`/model sonnet` pour revenir au défaut. Réponds-moi : quel modèle pour (a) renommer une variable dans
3 fichiers, (b) concevoir l'architecture d'un nouveau service, (c) 50 sous-agents qui classent des tickets ?

**Vérification** : attendu a = sonnet ou haiku, b = opus, c = haiku.

## À retenir
sonnet au quotidien, opus quand ça compte, haiku pour le volume.
