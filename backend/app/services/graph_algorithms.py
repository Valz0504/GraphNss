from __future__ import annotations

import heapq
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


# ── New feature algorithms ───────────────────────────────────────────────────


def largest_component(
    edges: list[GraphEdge], *, directed: bool
) -> tuple[Literal["undirected", "weak"], list[str], int]:
    """Return the largest connected component (weakly connected if directed).

    Returns (mode, largest_component_nodes, total_components).
    """
    mode, components = weakly_connected_components(edges, directed=directed)
    if not components:
        return mode, [], 0

    biggest = max(components, key=len)
    return mode, biggest, len(components)


def is_bipartite(
    edges: list[GraphEdge], *, directed: bool
) -> tuple[bool, list[str], list[str]]:
    """Check if the graph is bipartite using BFS 2-coloring.

    Works on the underlying undirected graph (ignores edge direction).
    Returns (is_bipartite, group_a_nodes, group_b_nodes).
    """
    if not edges:
        return True, [], []

    # Always treat as undirected for bipartite check
    adj = build_adjacency(edges, directed=False)

    color: dict[str, int] = {}  # 0 or 1

    for start in sorted(adj.keys()):
        if start in color:
            continue

        color[start] = 0
        q: deque[str] = deque([start])

        while q:
            u = q.popleft()
            for v in adj[u]:
                if v not in color:
                    color[v] = 1 - color[u]
                    q.append(v)
                elif color[v] == color[u]:
                    # Odd cycle detected — not bipartite
                    return False, [], []

    group_a = sorted(node for node, c in color.items() if c == 0)
    group_b = sorted(node for node, c in color.items() if c == 1)
    return True, group_a, group_b


def graph_diameter(
    edges: list[GraphEdge], *, directed: bool
) -> tuple[int | None, bool]:
    """Compute the diameter of the graph.

    The diameter is the maximum shortest-path distance over all pairs of nodes.
    Returns (diameter, is_connected).
    - diameter is None when the graph is disconnected or empty.
    - is_connected reflects whether all nodes are reachable from one another.
    """
    if not edges:
        return None, True  # trivially "connected" (empty)

    adj = build_adjacency(edges, directed=directed)
    nodes = list(adj.keys())

    max_dist = 0
    # BFS from every node
    for src in nodes:
        dist: dict[str, int] = {src: 0}
        q: deque[str] = deque([src])

        while q:
            u = q.popleft()
            for v in adj[u]:
                if v not in dist:
                    dist[v] = dist[u] + 1
                    q.append(v)

        if len(dist) < len(nodes):
            # Not all nodes reachable → disconnected
            return None, False

        local_max = max(dist.values())
        if local_max > max_dist:
            max_dist = local_max

    return max_dist, True


def has_cycle(
    edges: list[GraphEdge], *, directed: bool
) -> tuple[bool, list[str]]:
    """Detect whether the graph contains at least one cycle.

    For directed graphs: uses DFS with recursion-stack tracking.
    For undirected graphs: uses DFS with parent-tracking.

    Returns (has_cycle, example_cycle_nodes).
    example_cycle_nodes is a list of nodes forming one cycle (empty if no cycle).
    """
    if not edges:
        return False, []

    adj = build_adjacency(edges, directed=directed)

    if directed:
        color: dict[str, int] = {n: 0 for n in adj}  # 0=white, 1=gray, 2=black
        parent_d: dict[str, str | None] = {n: None for n in adj}

        def _dfs_d(start: str) -> list[str]:
            stack: list[str] = [start]
            path_stack: list[str] = []  # tracks recursion path

            while stack:
                u = stack[-1]
                if color[u] == 0:
                    color[u] = 1
                    path_stack.append(u)

                found_unvisited = False
                for v in adj[u]:
                    if color[v] == 0:
                        parent_d[v] = u
                        stack.append(v)
                        found_unvisited = True
                        break
                    elif color[v] == 1:
                        # Back edge — reconstruct cycle
                        cycle: list[str] = [v]
                        cur: str | None = u
                        while cur is not None and cur != v:
                            cycle.append(cur)
                            cur = parent_d.get(cur)
                        cycle.append(v)
                        cycle.reverse()
                        return cycle

                if not found_unvisited:
                    color[u] = 2
                    stack.pop()
                    if path_stack and path_stack[-1] == u:
                        path_stack.pop()

            return []

        for node in sorted(adj.keys()):
            if color[node] == 0:
                cycle = _dfs_d(node)
                if cycle:
                    return True, cycle

        return False, []

    else:
        visited: set[str] = set()

        for start in sorted(adj.keys()):
            if start in visited:
                continue

            # BFS with parent tracking — avoids false positives from iterative DFS
            q_bfs: deque[tuple[str, str | None]] = deque([(start, None)])
            parent_ud: dict[str, str | None] = {start: None}
            visited.add(start)

            while q_bfs:
                u, par = q_bfs.popleft()
                for v in adj[u]:
                    if v not in visited:
                        visited.add(v)
                        parent_ud[v] = u
                        q_bfs.append((v, u))
                    elif v != par:
                        # Back edge detected — reconstruct cycle
                        cycle_ud: list[str] = [v]
                        cur_ud: str | None = u
                        while cur_ud is not None and cur_ud != v:
                            cycle_ud.append(cur_ud)
                            cur_ud = parent_ud.get(cur_ud)
                        cycle_ud.append(v)
                        cycle_ud.reverse()
                        return True, cycle_ud

        return False, []


def find_girth(
    edges: list[GraphEdge], *, directed: bool
) -> int | None:
    """Find the girth of the graph (length of the shortest cycle).

    Uses BFS from every node and looks for the shortest cycle.
    Returns None if the graph has no cycles (girth = infinity).
    """
    if not edges:
        return None

    adj = build_adjacency(edges, directed=directed)
    nodes = list(adj.keys())
    min_cycle: int | None = None

    for src in nodes:
        # BFS tracking distance and parent to detect shortest cycles
        dist: dict[str, int] = {src: 0}
        parent_g: dict[str, str | None] = {src: None}
        q: deque[str] = deque([src])

        while q:
            u = q.popleft()
            for v in adj[u]:
                if v not in dist:
                    dist[v] = dist[u] + 1
                    parent_g[v] = u
                    q.append(v)
                elif parent_g[u] != v:
                    # Found a back edge (or cross edge) forming a cycle
                    cycle_len = dist[u] + dist[v] + 1
                    if min_cycle is None or cycle_len < min_cycle:
                        min_cycle = cycle_len

    return min_cycle


# ── Weighted / MST algorithms ──────────────────────────────────────────────


def _build_weighted_adj(
    edges: list[GraphEdge],
    *,
    directed: bool,
    default_weight: float = 1.0,
) -> dict[str, list[tuple[str, float]]]:
    """Build a weighted adjacency list.

    If an edge has no weight (w is None), `default_weight` is used instead.
    """
    adj: dict[str, list[tuple[str, float]]] = {}

    for e in edges:
        w = e.w if e.w is not None else default_weight
        adj.setdefault(e.u, []).append((e.v, w))
        adj.setdefault(e.v, [])
        if not directed:
            adj[e.v].append((e.u, w))

    return adj


def dijkstra(
    edges: list[GraphEdge],
    *,
    directed: bool,
    source: str,
    target: str,
) -> tuple[bool, list[str], float | None]:
    """Find the shortest weighted path from *source* to *target* using Dijkstra.

    Edges without a weight (w=None) are treated as weight=1.

    Returns (exists, path_nodes, cost).
    - `exists` is False when no path is reachable.
    - `path_nodes` is the ordered list of node IDs on the shortest path.
    - `cost` is the total path weight (None when unreachable).
    """
    if not edges:
        return False, [], None

    adj = _build_weighted_adj(edges, directed=directed)

    if source not in adj:
        raise ValueError(f"Node sumber '{source}' tidak ditemukan di graf")
    if target not in adj:
        raise ValueError(f"Node target '{target}' tidak ditemukan di graf")

    if source == target:
        return True, [source], 0.0

    # dist[node] = best known cost from source
    dist: dict[str, float] = {source: 0.0}
    prev: dict[str, str | None] = {source: None}

    # Min-heap: (cost, node)
    heap: list[tuple[float, str]] = [(0.0, source)]

    while heap:
        cost_u, u = heapq.heappop(heap)

        if cost_u > dist.get(u, float("inf")):
            continue  # stale entry

        if u == target:
            break

        for v, w in adj.get(u, []):
            new_cost = cost_u + w
            if new_cost < dist.get(v, float("inf")):
                dist[v] = new_cost
                prev[v] = u
                heapq.heappush(heap, (new_cost, v))

    if target not in dist:
        return False, [], None

    # Reconstruct path
    path: list[str] = []
    cur: str | None = target
    while cur is not None:
        path.append(cur)
        cur = prev.get(cur)
    path.reverse()

    return True, path, dist[target]


def prim_mst(
    edges: list[GraphEdge],
) -> tuple[list[GraphEdge], float, int, bool]:
    """Compute a Minimum Spanning Tree using Prim's algorithm.

    Always treats the graph as undirected (MST is only defined for undirected graphs).
    Edges without a weight are treated as weight=1.

    Returns (mst_edges, total_weight, node_count, is_spanning).
    - `mst_edges` are the edges that form the MST.
    - `total_weight` is the sum of their weights.
    - `node_count` is the number of nodes in the largest spanning component found.
    - `is_spanning` is True when the MST spans all nodes (i.e., graph is connected).
    """
    if not edges:
        return [], 0.0, 0, True

    adj = _build_weighted_adj(edges, directed=False)
    all_nodes = list(adj.keys())
    n = len(all_nodes)

    visited: set[str] = set()
    mst_edge_list: list[GraphEdge] = []
    total_w: float = 0.0

    # Start from the lexicographically smallest node for determinism
    start = min(all_nodes)
    visited.add(start)

    # Heap entries: (weight, from_node, to_node)
    heap: list[tuple[float, str, str]] = []
    for neighbor, w in adj[start]:
        heapq.heappush(heap, (w, start, neighbor))

    while heap and len(visited) < n:
        w, u, v = heapq.heappop(heap)
        if v in visited:
            continue
        visited.add(v)
        mst_edge_list.append(GraphEdge(u=u, v=v, w=w))
        total_w += w
        for neighbor, nw in adj[v]:
            if neighbor not in visited:
                heapq.heappush(heap, (nw, v, neighbor))

    return mst_edge_list, total_w, len(visited), len(visited) == n


def kruskal_mst(
    edges: list[GraphEdge],
) -> tuple[list[GraphEdge], float, int, bool]:
    """Compute a Minimum Spanning Tree using Kruskal's algorithm.

    Always treats the graph as undirected (MST is only defined for undirected graphs).
    Edges without a weight are treated as weight=1.

    Uses a Union-Find (Disjoint Set Union) data structure.

    Returns (mst_edges, total_weight, node_count, is_spanning).
    """
    if not edges:
        return [], 0.0, 0, True

    all_nodes: set[str] = set()
    for e in edges:
        all_nodes.add(e.u)
        all_nodes.add(e.v)

    n = len(all_nodes)

    # Union-Find helpers
    parent: dict[str, str] = {node: node for node in all_nodes}
    rank: dict[str, int] = {node: 0 for node in all_nodes}

    def find(x: str) -> str:
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # path compression
            x = parent[x]
        return x

    def union(x: str, y: str) -> bool:
        rx, ry = find(x), find(y)
        if rx == ry:
            return False  # already in the same set
        if rank[rx] < rank[ry]:
            rx, ry = ry, rx
        parent[ry] = rx
        if rank[rx] == rank[ry]:
            rank[rx] += 1
        return True

    # Sort edges by weight (ascending), break ties by node names for determinism
    sorted_edges = sorted(
        edges,
        key=lambda e: (e.w if e.w is not None else 1.0, e.u, e.v),
    )

    mst_edge_list: list[GraphEdge] = []
    total_w: float = 0.0

    for e in sorted_edges:
        w = e.w if e.w is not None else 1.0
        if union(e.u, e.v):
            mst_edge_list.append(GraphEdge(u=e.u, v=e.v, w=w))
            total_w += w
            if len(mst_edge_list) == n - 1:
                break  # MST is complete

    # is_spanning: all nodes belong to the same component
    roots = {find(node) for node in all_nodes}
    is_spanning = len(roots) == 1

    return mst_edge_list, total_w, n, is_spanning
