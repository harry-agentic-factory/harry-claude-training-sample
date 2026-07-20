---
paths:
  - "backend/**/*.py"
---
# Règle — Sécurité SQL (anti-injection)

- **Toujours** passer les valeurs par des **paramètres** (`?` + tuple), jamais par f-string / concaténation.
  - ✅ `conn.execute("SELECT * FROM todos WHERE done = ?", (int(done),))`
  - ❌ `conn.execute(f"SELECT * FROM todos WHERE done = {done}")`
- Les noms de colonnes/tables ne viennent **jamais** d'une entrée utilisateur.
- Toute écriture DB passe par `app/database.get_conn()` (commit auto, fermeture) — pas de `sqlite3.connect`
  ouvert à la main dans un router.
- Une modification de schéma = une migration idempotente (ici `init_db()` ; plus tard, un vrai outil).
