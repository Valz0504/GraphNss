import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def _sample_edges():
    return [
        {"u": "1", "v": "2"},
        {"u": "1", "v": "3"},
        {"u": "2", "v": "4"},
        {"u": "3", "v": "4"},
    ]


def test_bfs_simulation_order(client):
    body = {
        "directed": False,
        "edges": _sample_edges(),
        "start": "1",
    }

    resp = client.post("/api/v1/graph/bfs", json=body)
    assert resp.status_code == 200

    data = resp.json()
    assert data["algorithm"] == "bfs"
    assert data["visited_order"] == ["1", "2", "3", "4"]


def test_dfs_simulation_order(client):
    body = {
        "directed": False,
        "edges": _sample_edges(),
        "start": "1",
    }

    resp = client.post("/api/v1/graph/dfs", json=body)
    assert resp.status_code == 200

    data = resp.json()
    assert data["algorithm"] == "dfs"
    assert data["visited_order"] == ["1", "2", "4", "3"]


def test_path_exists_and_path_returned(client):
    body = {
        "directed": False,
        "edges": _sample_edges(),
        "source": "1",
        "target": "4",
    }

    resp = client.post("/api/v1/graph/path", json=body)
    assert resp.status_code == 200

    data = resp.json()
    assert data["exists"] is True
    assert data["path"] == ["1", "2", "4"]


def test_connectivity_and_components(client):
    body = {
        "directed": False,
        "edges": [
            {"u": "1", "v": "2"},
            {"u": "3", "v": "4"},
        ],
    }

    resp = client.post("/api/v1/graph/connectivity", json=body)
    assert resp.status_code == 200

    data = resp.json()
    assert data["is_connected"] is False
    assert data["components"] == [["1", "2"], ["3", "4"]]
