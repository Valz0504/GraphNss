from fastapi import APIRouter

from app.api.v1.endpoints import graph, health

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(graph.router, prefix="/graph", tags=["graph"])
