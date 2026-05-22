from __future__ import annotations

from collections import deque
from typing import Literal

from app.schemas.graph import GraphEdge


def _nodes_from_edges(edges: list[GraphEdge]) -> set[str]:
    nodes: set[str] = set()
    for e in edges:
        nodes.add(e.u)
        nodes.add(e.v)
    return nodes


def build_adjacency(edges: list[GraphEdge], *, directed: bool) -> dict[str, list[str]]:
    """Build adjacency list.

    Notes:
    - Neighbor lists are sorted for deterministic output.
    - Duplicate neighbors are removed.
    - All nodes that appear in any edge endpoint are present as keys.
    """

    adj: dict[str, set[str]] = {}

    for e in edges:
        adj.setdefault(e.u, set()).add(e.v)
        adj.setdefault(e.v, set())
        if not directed:
            adj[e.v].add(e.u)

    # sort for deterministic output
    return {node: sorted(neigh) for node, neigh in adj.items()}


def bfs_simulate(edges: list[GraphEdge], *, directed: bool, start: str) -> tuple[list[str], list[tuple[str, str]]]:
    adj = build_adjacency(edges, directed=directed)
    if start not in adj:
        raise ValueError(f"Start node '{start}' tidak ditemukan di graf")

    visited: set[str] = {start}
    q: deque[str] = deque([start])

    order: list[str] = []
    tree_edges: list[tuple[str, str]] = []

    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            if v in visited:
                continue
            visited.add(v)
            tree_edges.append((u, v))
            q.append(v)

    return order, tree_edges


def dfs_simulate(edges: list[GraphEdge], *, directed: bool, start: str) -> tuple[list[str], list[tuple[str, str]]]:
    adj = build_adjacency(edges, directed=directed)
    if start not in adj:
        raise ValueError(f"Start node '{start}' tidak ditemukan di graf")

    visited: set[str] = set()
    order: list[str] = []
    tree_edges: list[tuple[str, str]] = []

    parent: dict[str, str] = {}
    stack: list[str] = [start]

    while stack:
        u = stack.pop()
        if u in visited:
            continue
        visited.add(u)
        order.append(u)

        # Push neighbors in reverse so the smallest neighbor is processed first.
        for v in reversed(adj[u]):
            if v in visited:
                continue
            if v not in parent and v != start:
                parent[v] = u
                tree_edges.append((u, v))
            stack.append(v)

    return order, tree_edges


def find_path(
    edges: list[GraphEdge], *, directed: bool, source: str, target: str
) -> list[str] | None:
    adj = build_adjacency(edges, directed=directed)

    if source not in adj:
        raise ValueError(f"Node sumber '{source}' tidak ditemukan di graf")
    if target not in adj:
        raise ValueError(f"Node target '{target}' tidak ditemukan di graf")

    if source == target:
        return [source]

    visited: set[str] = {source}
    parent: dict[str, str] = {}
    q: deque[str] = deque([source])

    while q:
        u = q.popleft()
        for v in adj[u]:
            if v in visited:
                continue
            visited.add(v)
            parent[v] = u
            if v == target:
                q.clear()
                break
            q.append(v)

    if target not in visited:
        return None

    # Reconstruct path
    path: list[str] = [target]
    cur = target
    while cur != source:
        cur = parent[cur]
        path.append(cur)
    path.reverse()
    return path


def weakly_connected_components(
    edges: list[GraphEdge], *, directed: bool
) -> tuple[Literal["undirected", "weak"], list[list[str]]]:
    """Return components ignoring direction.

    If directed=False, this is the standard connected components.
    If directed=True, this is weakly connected components.
    """

    mode: Literal["undirected", "weak"] = "weak" if directed else "undirected"

    nodes = _nodes_from_edges(edges)
    if not nodes:
        return mode, []

    adj = build_adjacency(edges, directed=False)

    visited: set[str] = set()
    components: list[list[str]] = []

    for start in sorted(adj.keys()):
        if start in visited:
            continue

        comp: list[str] = []
        q: deque[str] = deque([start])
        visited.add(start)

        while q:
            u = q.popleft()
            comp.append(u)
            for v in adj[u]:
                if v in visited:
                    continue
                visited.add(v)
                q.append(v)

        components.append(sorted(comp))

    # Deterministic ordering of components
    components.sort(key=lambda c: (c[0] if c else ""))
    return mode, components
