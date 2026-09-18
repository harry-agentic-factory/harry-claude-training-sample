"""Tests d'API (support pour la skill python-api et l'agent reviewer)."""
from __future__ import annotations

import os
import tempfile

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    # Base SQLite jetable par test.
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    monkeypatch.setenv("TODO_DB_PATH", path)

    # Import différé pour que DB_PATH lise la variable d'env.
    from app.database import init_db
    from app.main import app

    init_db()
    with TestClient(app) as c:
        yield c
    os.unlink(path)


def test_create_then_list(client: TestClient) -> None:
    r = client.post("/todos", json={"title": "Écrire la fiche"})
    assert r.status_code == 201
    assert r.json()["done"] is False

    r = client.get("/todos")
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_toggle_done(client: TestClient) -> None:
    todo_id = client.post("/todos", json={"title": "Relire"}).json()["id"]
    r = client.patch(f"/todos/{todo_id}", json={"done": True})
    assert r.json()["done"] is True


def test_delete_missing_returns_404(client: TestClient) -> None:
    assert client.delete("/todos/999").status_code == 404


def test_delete_returns_204_and_removes(client: TestClient) -> None:
    todo_id = client.post("/todos", json={"title": "À supprimer"}).json()["id"]
    assert client.delete(f"/todos/{todo_id}").status_code == 204
    assert client.get("/todos").json() == []


def test_filter_by_done(client: TestClient) -> None:
    # 2 tâches, une seule terminée.
    a = client.post("/todos", json={"title": "active"}).json()["id"]
    b = client.post("/todos", json={"title": "faite"}).json()["id"]
    client.patch(f"/todos/{b}", json={"done": True})

    # CA1 : sans filtre → les deux.
    assert len(client.get("/todos").json()) == 2
    # CA2 : actives → seulement la non terminée.
    actives = client.get("/todos?done=false").json()
    assert [t["id"] for t in actives] == [a]
    # CA3 : terminées → seulement la terminée.
    faites = client.get("/todos?done=true").json()
    assert [t["id"] for t in faites] == [b]
