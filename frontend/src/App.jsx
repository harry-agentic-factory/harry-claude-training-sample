import { useEffect, useState } from "react";
import { createTodo, deleteTodo, listTodos, toggleTodo } from "./api.js";

// Filtres UI → valeur `done` envoyée à l'API.
const FILTERS = {
  all: { label: "Toutes", done: undefined },
  active: { label: "Actives", done: false },
  done: { label: "Terminées", done: true },
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  async function refresh(f = filter) {
    try {
      setTodos(await listTodos(FILTERS[f].done));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    refresh(filter);
  }, [filter]);

  // Exécute une action API puis recharge la liste. Toute erreur remonte à l'utilisateur
  // (convention react-ui n°5 : pas d'erreur réseau muette).
  // NB : pas de `.then(refresh)` — refresh recevrait la réponse HTTP en guise de filtre.
  async function run(action) {
    try {
      await action();
    } catch (e) {
      setError(e.message);
      return false;
    }
    await refresh();
    return true;
  }

  async function onAdd(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    if (await run(() => createTodo(t))) setTitle("");
  }

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Mes tâches</h1>

      <form onSubmit={onAdd} style={{ display: "flex", gap: 8 }}>
        <input
          aria-label="Nouvelle tâche"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Une chose à faire…"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Ajouter</button>
      </form>

      {error && <p style={{ color: "crimson" }}>Erreur : {error}</p>}

      <div role="group" aria-label="Filtres" style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {Object.entries(FILTERS).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            style={{ fontWeight: filter === key ? 700 : 400 }}
          >
            {label}
          </button>
        ))}
      </div>

      <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
        {todos.map((t) => (
          <li key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => run(() => toggleTodo(t.id, !t.done))}
            />
            <span style={{ flex: 1, textDecoration: t.done ? "line-through" : "none" }}>
              {t.title}
            </span>
            <button onClick={() => run(() => deleteTodo(t.id))}>✕</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
