from __future__ import annotations

from collections import deque
from typing import Literal


NEIGHBORS_4: list[tuple[int, int]] = [
    (-1, 0),  # up
    (1, 0),  # down
    (0, -1),  # left
    (0, 1),  # right
]


def count_islands(grid: list[list[int]], *, algorithm: Literal["bfs", "dfs"]) -> int:
    """Count islands (connected components of land=1) using 4-neighborhood.

    Notes:
    - 4-direction adjacency: up, down, left, right.
    - Works for any rectangular grid. Validation is expected to happen at the API layer.
    """

    if not grid or not grid[0]:
        return 0

    rows = len(grid)
    cols = len(grid[0])

    visited = [[False] * cols for _ in range(rows)]

    def neighbors(r: int, c: int):
        for dr, dc in NEIGHBORS_4:
            nr = r + dr
            nc = c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                yield nr, nc

    islands = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != 1:
                continue
            if visited[r][c]:
                continue

            islands += 1
            visited[r][c] = True

            if algorithm == "bfs":
                q: deque[tuple[int, int]] = deque([(r, c)])
                while q:
                    cr, cc = q.popleft()
                    for nr, nc in neighbors(cr, cc):
                        if visited[nr][nc] or grid[nr][nc] != 1:
                            continue
                        visited[nr][nc] = True
                        q.append((nr, nc))
            else:
                stack: list[tuple[int, int]] = [(r, c)]
                while stack:
                    cr, cc = stack.pop()
                    for nr, nc in neighbors(cr, cc):
                        if visited[nr][nc] or grid[nr][nc] != 1:
                            continue
                        visited[nr][nc] = True
                        stack.append((nr, nc))

    return islands


def simulate_island_traversal(
    grid: list[list[int]], *, algorithm: Literal["bfs", "dfs"]
) -> tuple[int, list[tuple[int, int, int]]]:
    """Simulate island-count traversal and return ordered steps.

    Returns:
    - islands: total islands found
    - steps: list of (r, c, island_index)
    """

    if not grid or not grid[0]:
        return 0, []

    rows = len(grid)
    cols = len(grid[0])
    visited = [[False] * cols for _ in range(rows)]

    def neighbors(r: int, c: int):
        for dr, dc in NEIGHBORS_4:
            nr = r + dr
            nc = c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                yield nr, nc

    islands = 0
    steps: list[tuple[int, int, int]] = []

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != 1:
                continue
            if visited[r][c]:
                continue

            islands += 1
            visited[r][c] = True

            if algorithm == "bfs":
                q: deque[tuple[int, int]] = deque([(r, c)])
                while q:
                    cr, cc = q.popleft()
                    steps.append((cr, cc, islands))

                    for nr, nc in neighbors(cr, cc):
                        if visited[nr][nc] or grid[nr][nc] != 1:
                            continue
                        visited[nr][nc] = True
                        q.append((nr, nc))
            else:
                stack: list[tuple[int, int]] = [(r, c)]
                while stack:
                    cr, cc = stack.pop()
                    steps.append((cr, cc, islands))

                    # Push in reverse so the first neighbor in NEIGHBORS_4 is processed first.
                    for nr, nc in reversed(list(neighbors(cr, cc))):
                        if visited[nr][nc] or grid[nr][nc] != 1:
                            continue
                        visited[nr][nc] = True
                        stack.append((nr, nc))

    return islands, steps
