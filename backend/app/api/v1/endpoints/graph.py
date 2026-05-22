from fastapi import APIRouter, HTTPException

from app.schemas.graph import (
    ComponentsResponse,
    ConnectivityResponse,
    GraphEdge,
    GraphRequest,
    PathRequest,
    PathResponse,
    TraversalRequest,
    TraversalResponse,
)
from app.services.graph_algorithms import (
    bfs_simulate,
    dfs_simulate,
    find_path,
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
