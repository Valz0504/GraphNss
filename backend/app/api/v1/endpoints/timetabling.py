from fastapi import APIRouter, HTTPException

from app.schemas.timetabling import TimetablingRequest, TimetablingResponse
from app.services.timetabling_algorithms import solve_timetabling

router = APIRouter()


@router.post("/solve", response_model=TimetablingResponse)
async def solve_timetabling_endpoint(req: TimetablingRequest) -> TimetablingResponse:
    if len(req.courses) < 2:
        raise HTTPException(status_code=422, detail="Minimal 2 mata kuliah.")
    if len(req.lecturers) < 1:
        raise HTTPException(status_code=422, detail="Minimal 1 dosen.")
    lec_ids = {l.id for l in req.lecturers}
    for c in req.courses:
        if c.lecturer_id not in lec_ids:
            raise HTTPException(
                status_code=422,
                detail=f"Dosen '{c.lecturer_id}' untuk mata kuliah '{c.name}' tidak ditemukan.",
            )
    return solve_timetabling(req.courses, req.lecturers, req.algorithm)
