from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class GraphEdge(BaseModel):
    u: str = Field(..., min_length=1, description="Source node id")
    v: str = Field(..., min_length=1, description="Target node id")
    w: float | None = Field(default=None, description="Optional weight")


class GraphRequest(BaseModel):
    directed: bool = Field(default=False, description="Treat edges as directed")
    edges: list[GraphEdge] = Field(default_factory=list)


class TraversalRequest(GraphRequest):
    start: str = Field(..., min_length=1, description="Start node id")


class TraversalResponse(BaseModel):
    algorithm: Literal["dfs", "bfs"]
    directed: bool
    start: str
    visited_order: list[str]
    tree_edges: list[GraphEdge] = Field(default_factory=list)


class PathRequest(GraphRequest):
    source: str = Field(..., min_length=1)
    target: str = Field(..., min_length=1)


class PathResponse(BaseModel):
    directed: bool
    source: str
    target: str
    exists: bool
    path: list[str] | None = None


class ConnectivityResponse(BaseModel):
    directed: bool
    mode: Literal["undirected", "weak"]
    is_connected: bool
    components: list[list[str]] = Field(default_factory=list)


class ComponentsResponse(BaseModel):
    directed: bool
    mode: Literal["undirected", "weak"]
    components: list[list[str]] = Field(default_factory=list)


# ── New feature schemas ──────────────────────────────────────────────────────

class LargestComponentResponse(BaseModel):
    directed: bool
    mode: Literal["undirected", "weak"]
    largest_component: list[str] = Field(default_factory=list)
    size: int
    total_components: int


class BipartiteResponse(BaseModel):
    directed: bool
    is_bipartite: bool
    # Two groups when bipartite; empty lists when not bipartite or graph is empty
    group_a: list[str] = Field(default_factory=list)
    group_b: list[str] = Field(default_factory=list)


class DiameterResponse(BaseModel):
    directed: bool
    # None means the graph is disconnected (infinite diameter) or empty
    diameter: int | None
    is_connected: bool


class CycleResponse(BaseModel):
    directed: bool
    has_cycle: bool
    # One example cycle (node sequence) when found; empty when no cycle
    example_cycle: list[str] = Field(default_factory=list)


class GirthResponse(BaseModel):
    directed: bool
    # None means no cycle exists (girth = infinity)
    girth: int | None
