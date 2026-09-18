# Module 08 — Choisir le modèle
Fiche : §8 · Profils : tous · Durée : ~5 min

## Concept
`/model` en session, `--model` au lancement, `"model"` dans settings.json. Alias : `opus` (le plus
capable de la gamme Opus : archi, tâches longues), `sonnet` (quotidien, meilleur équilibre), `haiku`
(rapide / économe : tâches simples, sous-agents), `fable` (l'exceptionnel, coûteux).
`/effort` règle la profondeur de raisonnement indépendamment du modèle.

## Pas 1/1 — Le bon modèle pour la bonne tâche
**Exercice (tous)** : `/model haiku`, puis une question triviale (« que renvoie GET /health ? »).
Puis `/model sonnet` pour revenir au défaut du repo. Réponds-moi : quel modèle pour
(a) renommer une variable dans 3 fichiers, (b) concevoir l'architecture d'un nouveau service,
(c) 50 sous-agents qui classent des tickets ?
**Vérification** : je te pose la question de contrôle (attendu : a = sonnet ou haiku, b = opus, c = haiku).

## À retenir
Plus capable = plus cher et plus lent. sonnet au quotidien, opus quand ça compte, haiku pour le volume.
