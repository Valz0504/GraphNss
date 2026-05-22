from fastapi import APIRouter, HTTPException

from app.schemas.grid_island import (
    IslandCountRequest,
    IslandCountResponse,
    IslandTraversalResponse,
    IslandTraversalStep,
)
from app.services.grid_island_algorithms import count_islands, simulate_island_traversal

router = APIRouter()


@router.post("/islands/count", response_model=IslandCountResponse)
async def count_islands_endpoint(req: IslandCountRequest):
    try:
        islands = count_islands(req.grid, algorithm=req.algorithm)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    rows = len(req.grid)
    cols = len(req.grid[0]) if rows else 0

    return IslandCountResponse(
        algorithm=req.algorithm,
        rows=rows,
        cols=cols,
        islands=islands,
    )


@router.post("/islands/simulate", response_model=IslandTraversalResponse)
async def simulate_islands_endpoint(req: IslandCountRequest):
    try:
        islands, steps = simulate_island_traversal(req.grid, algorithm=req.algorithm)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    rows = len(req.grid)
    cols = len(req.grid[0]) if rows else 0

    return IslandTraversalResponse(
        algorithm=req.algorithm,
        rows=rows,
        cols=cols,
        islands=islands,
        steps=[IslandTraversalStep(r=r, c=c, island=island) for (r, c, island) in steps],
    )
