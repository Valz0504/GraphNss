from fastapi import APIRouter

from app.api.v1.endpoints import graph, grid_island, health

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(graph.router, prefix="/graph", tags=["graph"])
api_router.include_router(
    grid_island.router, prefix="/grid-island", tags=["grid-island"]
)

