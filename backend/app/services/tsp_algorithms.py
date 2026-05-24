from __future__ import annotations

import math
from typing import Literal

from app.schemas.tsp import TspCity, TspResponse, TspStep


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return distance in km between two lat/lng coordinates."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def _build_dist(cities: list[TspCity]) -> list[list[float]]:
    n = len(cities)
    dist = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                dist[i][j] = haversine(
                    cities[i].lat, cities[i].lng,
                    cities[j].lat, cities[j].lng,
                )
    return dist


def _tour_distance(tour: list[int], dist: list[list[float]]) -> float:
    total = 0.0
    n = len(tour)
    for k in range(n):
        total += dist[tour[k]][tour[(k + 1) % n]]
    return total


def _build_steps(tour: list[int], cities: list[TspCity], dist: list[list[float]]) -> list[TspStep]:
    steps: list[TspStep] = []
    cumulative = 0.0
    n = len(tour)
    for k in range(n):
        from_idx = tour[k]
        to_idx = tour[(k + 1) % n]
        edge_dist = dist[from_idx][to_idx]
        cumulative += edge_dist
        steps.append(TspStep(
            from_city=cities[from_idx].id,
            to_city=cities[to_idx].id,
            distance_added=round(edge_dist, 3),
            cumulative_distance=round(cumulative, 3),
        ))
    return steps


# ── Nearest Neighbor ────────────────────────────────────────────────────────

def _nearest_neighbor(cities: list[TspCity], dist: list[list[float]]) -> list[int]:
    n = len(cities)
    visited = [False] * n
    tour = [0]
    visited[0] = True
    for _ in range(n - 1):
        current = tour[-1]
        nearest = min(
            (j for j in range(n) if not visited[j]),
            key=lambda j: dist[current][j],
        )
        tour.append(nearest)
        visited[nearest] = True
    return tour


# ── 2-Opt ───────────────────────────────────────────────────────────────────

def _two_opt(tour: list[int], dist: list[list[float]]) -> list[int]:
    n = len(tour)
    improved = True
    while improved:
        improved = False
        for i in range(1, n - 1):
            for j in range(i + 1, n):
                before = dist[tour[i - 1]][tour[i]] + dist[tour[j]][tour[(j + 1) % n]]
                after = dist[tour[i - 1]][tour[j]] + dist[tour[i]][tour[(j + 1) % n]]
                if after < before - 1e-10:
                    tour[i: j + 1] = tour[i: j + 1][::-1]
                    improved = True
    return tour


# ── Held-Karp (exact DP, O(n² 2^n)) ─────────────────────────────────────────

def _held_karp(cities: list[TspCity], dist: list[list[float]]) -> list[int]:
    n = len(cities)
    INF = float("inf")
    # dp[mask][i] = min cost to reach city i having visited cities in mask (starting at 0)
    dp = [[INF] * n for _ in range(1 << n)]
    parent = [[-1] * n for _ in range(1 << n)]

    dp[1][0] = 0.0

    for mask in range(1, 1 << n):
        if not (mask & 1):  # must always include city 0
            continue
        for i in range(n):
            if not (mask & (1 << i)) or dp[mask][i] == INF:
                continue
            for j in range(n):
                if mask & (1 << j):
                    continue
                new_mask = mask | (1 << j)
                new_cost = dp[mask][i] + dist[i][j]
                if new_cost < dp[new_mask][j]:
                    dp[new_mask][j] = new_cost
                    parent[new_mask][j] = i

    full = (1 << n) - 1
    best_cost = INF
    last = -1
    for i in range(1, n):
        cost = dp[full][i] + dist[i][0]
        if cost < best_cost:
            best_cost = cost
            last = i

    # Reconstruct
    tour: list[int] = []
    mask = full
    current = last
    while current != -1:
        tour.append(current)
        prev = parent[mask][current]
        mask ^= 1 << current
        current = prev
    tour.reverse()
    return tour


# ── Public entry point ───────────────────────────────────────────────────────

def solve_tsp(
    cities: list[TspCity],
    algorithm: Literal["nearest-neighbor", "two-opt", "held-karp"],
) -> TspResponse:
    dist = _build_dist(cities)

    if algorithm == "nearest-neighbor":
        tour = _nearest_neighbor(cities, dist)

    elif algorithm == "two-opt":
        tour = _nearest_neighbor(cities, dist)
        tour = _two_opt(tour, dist)

    else:  # held-karp
        tour = _held_karp(cities, dist)

    total = _tour_distance(tour, dist)
    steps = _build_steps(tour, cities, dist)

    return TspResponse(
        algorithm=algorithm,
        tour=[cities[i].id for i in tour],
        total_distance=round(total, 3),
        steps=steps,
        city_count=len(cities),
    )
