from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Literal


class Lecturer(BaseModel):
    id: str
    name: str
    unavailable_slots: list[int] = Field(default_factory=list)  # slot indices 0-19


class Course(BaseModel):
    id: str
    name: str
    sks: int = Field(ge=1, le=6)
    lecturer_id: str
    semester: int | None = None  # if set, same-semester courses conflict


class TimetablingRequest(BaseModel):
    courses: list[Course] = Field(..., min_length=2)
    lecturers: list[Lecturer] = Field(..., min_length=1)
    algorithm: Literal["dsatur", "welsh-powell"] = "dsatur"


class ScheduleStep(BaseModel):
    course_id: str
    course_name: str
    lecturer_name: str
    slot_index: int        # 0-19
    slot_day: str
    slot_period: int       # 1-4
    slot_label: str
    degree: int
    saturation: int
    # For 4-SKS courses: second weekly meeting
    slot2_index: int | None = None
    slot2_day: str | None = None
    slot2_period: int | None = None
    slot2_label: str | None = None


class ScheduleEntry(BaseModel):
    course_id: str
    course_name: str
    lecturer_id: str
    lecturer_name: str
    sks: int
    semester: int | None
    slot_index: int
    slot_day: str
    slot_period: int
    slot_label: str
    # For 4-SKS courses: second weekly meeting
    slot2_index: int | None = None
    slot2_day: str | None = None
    slot2_period: int | None = None
    slot2_label: str | None = None


class TimetablingResponse(BaseModel):
    algorithm: str
    schedule: list[ScheduleEntry]
    steps: list[ScheduleStep]
    total_slots_used: int
    conflict_edges: int
