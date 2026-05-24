from fastapi import APIRouter, HTTPException

from app.schemas.tsp import TspRequest, TspResponse
from app.services.tsp_algorithms import solve_tsp

router = APIRouter()


@router.post("/solve", response_model=TspResponse)
async def solve_tsp_endpoint(req: TspRequest) -> TspResponse:
    if len(req.cities) < 2:
        raise HTTPException(status_code=422, detail="Need at least 2 cities.")

    if req.algorithm == "held-karp" and len(req.cities) > 15:
        raise HTTPException(
            status_code=422,
            detail="Held-Karp supports at most 15 cities (exponential time complexity).",
        )

    return solve_tsp(req.cities, req.algorithm)
