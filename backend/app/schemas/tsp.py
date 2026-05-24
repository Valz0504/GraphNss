from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class TspCity(BaseModel):
    id: str = Field(..., description="Unique city identifier")
    name: str = Field(..., description="Display name of city")
    lat: float = Field(..., description="Latitude")
    lng: float = Field(..., description="Longitude")


class TspRequest(BaseModel):
    cities: list[TspCity] = Field(..., min_length=2)
    algorithm: Literal["nearest-neighbor", "two-opt", "held-karp"] = Field(
        default="nearest-neighbor"
    )


class TspStep(BaseModel):
    from_city: str = Field(..., description="Departure city id")
    to_city: str = Field(..., description="Arrival city id")
    distance_added: float = Field(..., description="Distance of this edge in km")
    cumulative_distance: float = Field(..., description="Total distance so far in km")


class TspResponse(BaseModel):
    algorithm: str
    tour: list[str] = Field(..., description="City ids in tour order")
    total_distance: float = Field(..., description="Total tour distance in km")
    steps: list[TspStep] = Field(..., description="Animation steps")
    city_count: int
