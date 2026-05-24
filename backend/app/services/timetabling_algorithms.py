from __future__ import annotations

from app.schemas.timetabling import (
    Course,
    Lecturer,
    ScheduleEntry,
    ScheduleStep,
    TimetablingResponse,
)

# 5 days × 4 periods = 20 slots
DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]
PERIODS = [
    (1, "07:00–09:40"),
    (2, "10:00–12:40"),
    (3, "13:00–15:40"),
    (4, "16:00–18:40"),
]
TIME_SLOTS: list[tuple[str, int, str]] = [
    (day, period, label)
    for day in DAYS
    for period, label in PERIODS
]  # index 0-19


def _build_conflict_graph(courses: list[Course]) -> dict[str, set[str]]:
    """Edges when same lecturer_id OR same semester (not None)."""
    graph: dict[str, set[str]] = {c.id: set() for c in courses}
    for i, c1 in enumerate(courses):
        for c2 in courses[i + 1 :]:
            conflict = c1.lecturer_id == c2.lecturer_id
            if not conflict and c1.semester is not None and c1.semester == c2.semester:
                conflict = True
            if conflict:
                graph[c1.id].add(c2.id)
                graph[c2.id].add(c1.id)
    return graph


def _dsatur(
    courses: list[Course], graph: dict[str, set[str]]
) -> tuple[dict[str, int], list[tuple[str, int, int]]]:
    """
    DSATUR graph coloring.
    Returns (color_map, assignment_order) where assignment_order is list of
    (course_id, saturation_at_assignment, degree).
    """
    color: dict[str, int] = {}
    saturation: dict[str, int] = {c.id: 0 for c in courses}
    degree: dict[str, int] = {c.id: len(graph[c.id]) for c in courses}
    uncolored = {c.id for c in courses}
    assignment_order: list[tuple[str, int, int]] = []

    while uncolored:
        v = max(uncolored, key=lambda x: (saturation[x], degree[x]))
        neighbor_colors = {color[nb] for nb in graph[v] if nb in color}
        c = 0
        while c in neighbor_colors:
            c += 1
        color[v] = c
        assignment_order.append((v, saturation[v], degree[v]))
        uncolored.remove(v)
        for nb in graph[v]:
            if nb in uncolored:
                nb_colors = {color[nb2] for nb2 in graph[nb] if nb2 in color}
                saturation[nb] = len(nb_colors)

    return color, assignment_order


def _welsh_powell(
    courses: list[Course], graph: dict[str, set[str]]
) -> tuple[dict[str, int], list[tuple[str, int, int]]]:
    """Welsh-Powell: sort by degree desc, greedy coloring."""
    sorted_courses = sorted(courses, key=lambda c: len(graph[c.id]), reverse=True)
    color: dict[str, int] = {}
    assignment_order: list[tuple[str, int, int]] = []
    for c in sorted_courses:
        neighbor_colors = {color[nb] for nb in graph[c.id] if nb in color}
        col = 0
        while col in neighbor_colors:
            col += 1
        color[c.id] = col
        assignment_order.append((c.id, 0, len(graph[c.id])))
    return color, assignment_order


def solve_timetabling(
    courses: list[Course], lecturers: list[Lecturer], algorithm: str
) -> TimetablingResponse:
    graph = _build_conflict_graph(courses)
    conflict_edges = sum(len(v) for v in graph.values()) // 2

    if algorithm == "welsh-powell":
        color_map, assignment_order = _welsh_powell(courses, graph)
    else:
        color_map, assignment_order = _dsatur(courses, graph)

    lec_map = {l.id: l.name for l in lecturers}
    course_map = {c.id: c for c in courses}

    total_colors = max(color_map.values(), default=0) + 1

    # Build steps in assignment order
    steps: list[ScheduleStep] = []
    for course_id, sat, deg in assignment_order:
        c = course_map[course_id]
        color = color_map[course_id]
        slot_idx = color % len(TIME_SLOTS)
        day, period, label = TIME_SLOTS[slot_idx]
        steps.append(
            ScheduleStep(
                course_id=course_id,
                course_name=c.name,
                lecturer_name=lec_map.get(c.lecturer_id, "?"),
                slot_index=slot_idx,
                slot_day=day,
                slot_period=period,
                slot_label=label,
                degree=deg,
                saturation=sat,
            )
        )

    # Build final schedule
    schedule: list[ScheduleEntry] = []
    for c in courses:
        color = color_map[c.id]
        slot_idx = color % len(TIME_SLOTS)
        day, period, label = TIME_SLOTS[slot_idx]
        schedule.append(
            ScheduleEntry(
                course_id=c.id,
                course_name=c.name,
                lecturer_id=c.lecturer_id,
                lecturer_name=lec_map.get(c.lecturer_id, "?"),
                sks=c.sks,
                semester=c.semester,
                slot_index=slot_idx,
                slot_day=day,
                slot_period=period,
                slot_label=label,
            )
        )

    return TimetablingResponse(
        algorithm=algorithm,
        schedule=schedule,
        steps=steps,
        total_slots_used=total_colors,
        conflict_edges=conflict_edges,
    )
