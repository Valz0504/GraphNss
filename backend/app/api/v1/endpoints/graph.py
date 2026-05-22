from fastapi import APIRouter, HTTPException

from app.schemas.graph import (
    BipartiteResponse,
    ComponentsResponse,
    ConnectivityResponse,
    CycleResponse,
    DiameterResponse,
    GirthResponse,
    GraphEdge,
    GraphRequest,
    LargestComponentResponse,
    PathRequest,
    PathResponse,
    TraversalRequest,
    TraversalResponse,
)
from app.services.graph_algorithms import (
    bfs_simulate,
    dfs_simulate,
    find_girth,
    find_path,
    graph_diameter,
    has_cycle,
    is_bipartite,
    largest_component,
    weakly_connected_components,
)

router = APIRouter()


@router.post("/dfs", response_model=TraversalResponse)
async def simulate_dfs(req: TraversalRequest):
    try:
        order, tree = dfs_simulate(req.edges, directed=req.directed, start=req.start)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    return TraversalResponse(
        algorithm="dfs",
        directed=req.directed,
        start=req.start,
        visited_order=order,
        tree_edges=[GraphEdge(u=u, v=v) for (u, v) in tree],
    )


@router.post("/bfs", response_model=TraversalResponse)
async def simulate_bfs(req: TraversalRequest):
    try:
        order, tree = bfs_simulate(req.edges, directed=req.directed, start=req.start)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    return TraversalResponse(
        algorithm="bfs",
        directed=req.directed,
        start=req.start,
        visited_order=order,
        tree_edges=[GraphEdge(u=u, v=v) for (u, v) in tree],
    )


@router.post("/path", response_model=PathResponse)
async def check_path(req: PathRequest):
    try:
        path = find_path(
            req.edges, directed=req.directed, source=req.source, target=req.target
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    return PathResponse(
        directed=req.directed,
        source=req.source,
        target=req.target,
        exists=path is not None,
        path=path,
    )


@router.post("/connectivity", response_model=ConnectivityResponse)
async def check_connectivity(req: GraphRequest):
    mode, components = weakly_connected_components(req.edges, directed=req.directed)
    is_connected = len(components) <= 1

    return ConnectivityResponse(
        directed=req.directed,
        mode=mode,
        is_connected=is_connected,
        components=components,
    )


@router.post("/components", response_model=ComponentsResponse)
async def find_components(req: GraphRequest):
    mode, components = weakly_connected_components(req.edges, directed=req.directed)

    return ComponentsResponse(
        directed=req.directed,
        mode=mode,
        components=components,
    )


# ── New feature endpoints ────────────────────────────────────────────────────


@router.post("/largest-component", response_model=LargestComponentResponse)
async def get_largest_component(req: GraphRequest):
    """Return the largest connected component in the graph."""
    mode, comp, total = largest_component(req.edges, directed=req.directed)

    return LargestComponentResponse(
        directed=req.directed,
        mode=mode,
        largest_component=comp,
        size=len(comp),
        total_components=total,
    )


@router.post("/bipartite", response_model=BipartiteResponse)
async def check_bipartite(req: GraphRequest):
    """Check whether the graph is bipartite (2-colorable)."""
    result, group_a, group_b = is_bipartite(req.edges, directed=req.directed)

    return BipartiteResponse(
        directed=req.directed,
        is_bipartite=result,
        group_a=group_a,
        group_b=group_b,
    )


@router.post("/diameter", response_model=DiameterResponse)
async def get_diameter(req: GraphRequest):
    """Compute the diameter (longest shortest path) of the graph."""
    diameter, connected = graph_diameter(req.edges, directed=req.directed)

    return DiameterResponse(
        directed=req.directed,
        diameter=diameter,
        is_connected=connected,
    )


@router.post("/cycle", response_model=CycleResponse)
async def detect_cycle(req: GraphRequest):
    """Detect whether the graph contains at least one cycle."""
    found, example = has_cycle(req.edges, directed=req.directed)

    return CycleResponse(
        directed=req.directed,
        has_cycle=found,
        example_cycle=example,
    )


@router.post("/girth", response_model=GirthResponse)
async def get_girth(req: GraphRequest):
    """Find the girth (length of the shortest cycle) of the graph."""
    girth = find_girth(req.edges, directed=req.directed)

    return GirthResponse(
        directed=req.directed,
        girth=girth,
    )
