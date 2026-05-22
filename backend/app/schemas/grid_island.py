from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, model_validator


class IslandCountRequest(BaseModel):
    algorithm: Literal["bfs", "dfs"] = Field(
        default="bfs", description="Traversal strategy used for flood fill"
    )
    grid: list[list[int]] = Field(
        ..., description="2D grid: 0=water, 1=land. Rectangular matrix."
    )

    @model_validator(mode="after")
    def _validate_grid(self):
        if not self.grid:
            raise ValueError("Grid tidak boleh kosong")

        rows = len(self.grid)
        cols = len(self.grid[0]) if rows > 0 else 0

        if cols == 0:
            raise ValueError("Grid tidak boleh memiliki kolom 0")

        if rows > 200 or cols > 200:
            raise ValueError("Grid maksimal 200x200")

        for r, row in enumerate(self.grid):
            if len(row) != cols:
                raise ValueError("Grid harus berbentuk persegi panjang (rectangular)")
            for c, cell in enumerate(row):
                if cell not in (0, 1):
                    raise ValueError(
                        f"Grid hanya boleh berisi 0/1 (invalid di [{r}][{c}]={cell})"
                    )

        return self


class IslandCountResponse(BaseModel):
    algorithm: Literal["bfs", "dfs"]
    rows: int
    cols: int
    islands: int


class IslandTraversalStep(BaseModel):
    r: int = Field(..., ge=0, description="Row index (0-based)")
    c: int = Field(..., ge=0, description="Column index (0-based)")
    island: int = Field(..., ge=1, description="Island index (1-based)")


class IslandTraversalResponse(BaseModel):
    algorithm: Literal["bfs", "dfs"]
    rows: int
    cols: int
    islands: int
    steps: list[IslandTraversalStep] = Field(default_factory=list)
