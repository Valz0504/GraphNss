import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.mark.parametrize("algorithm", ["bfs", "dfs"])
@pytest.mark.parametrize(
    "grid,expected",
    [
        (
            [
                [1, 1, 0, 0],
                [1, 0, 0, 1],
                [0, 0, 1, 1],
                [0, 1, 1, 0],
            ],
            2,
        ),
        (
            [
                [1, 0, 1],
                [0, 1, 0],
                [1, 0, 1],
            ],
            5,
        ),
    ],
)
def test_island_count(client, algorithm, grid, expected):
    body = {"algorithm": algorithm, "grid": grid}
    resp = client.post("/api/v1/grid-island/islands/count", json=body)
    assert resp.status_code == 200

    data = resp.json()
    assert data["algorithm"] == algorithm
    assert data["islands"] == expected


def test_invalid_grid_returns_400(client):
    body = {"algorithm": "bfs", "grid": [[1, 0], [1]]}
    resp = client.post("/api/v1/grid-island/islands/count", json=body)
    assert resp.status_code == 422


def test_island_simulation_steps_bfs(client):
    grid = [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
    ]
    body = {"algorithm": "bfs", "grid": grid}

    resp = client.post("/api/v1/grid-island/islands/simulate", json=body)
    assert resp.status_code == 200

    data = resp.json()
    assert data["algorithm"] == "bfs"
    assert data["islands"] == 1

    steps = data["steps"]
    coords = [(s["r"], s["c"]) for s in steps]

    assert coords == [
        (0, 0),
        (1, 0),
        (0, 1),
        (2, 0),
        (0, 2),
        (2, 1),
        (1, 2),
        (2, 2),
    ]
    assert all(s["island"] == 1 for s in steps)


def test_island_simulation_steps_dfs(client):
    grid = [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
    ]
    body = {"algorithm": "dfs", "grid": grid}

    resp = client.post("/api/v1/grid-island/islands/simulate", json=body)
    assert resp.status_code == 200

    data = resp.json()
    assert data["algorithm"] == "dfs"
    assert data["islands"] == 1

    steps = data["steps"]
    coords = [(s["r"], s["c"]) for s in steps]

    assert coords == [
        (0, 0),
        (1, 0),
        (2, 0),
        (2, 1),
        (2, 2),
        (1, 2),
        (0, 2),
        (0, 1),
    ]
    assert all(s["island"] == 1 for s in steps)


def test_island_simulation_includes_island_indices(client):
    grid = [
        [1, 0, 0, 0],
        [0, 0, 0, 1],
    ]
    body = {"algorithm": "bfs", "grid": grid}

    resp = client.post("/api/v1/grid-island/islands/simulate", json=body)
    assert resp.status_code == 200

    data = resp.json()
    assert data["islands"] == 2
    island_ids = {s["island"] for s in data["steps"]}
    assert island_ids == {1, 2}
