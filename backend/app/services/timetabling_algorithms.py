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
]  # index 0-19: slot_idx = day_idx * 4 + (period - 1)

N_SLOTS = len(TIME_SLOTS)  # 20


def _build_conflict_graph(courses: list[Course]) -> dict[str, set[str]]:
    """Add edge when same lecturer_id OR same semester (not None)."""
    graph: dict[str, set[str]] = {c.id: set() for c in courses}
    for i, c1 in enumerate(courses):
        for c2 in courses[i + 1:]:
            conflict = c1.lecturer_id == c2.lecturer_id
            if not conflict and c1.semester is not None and c1.semester == c2.semester:
                conflict = True
            if conflict:
                graph[c1.id].add(c2.id)
                graph[c2.id].add(c1.id)
    return graph


def _find_slot(
    v: str,
    course_map: dict[str, Course],
    graph: dict[str, set[str]],
    slot: dict[str, int],
    unavailable_map: dict[str, set[int]],
) -> int:
    """
    Find the smallest slot index (0–19) for course v that:
      1. Is not already used by any conflicting neighbour.
      2. Is not in the lecturer's unavailable set.
    Falls back to N_SLOTS-1 if no valid slot exists (should not occur in
    well-formed inputs with ≤ 20 courses in a single clique).
    """
    neighbor_slots = {slot[nb] for nb in graph[v] if nb in slot}
    lec_unavail = unavailable_map.get(course_map[v].lecturer_id, set())
    s = 0
    while s < N_SLOTS and (s in neighbor_slots or s in lec_unavail):
        s += 1
    return min(s, N_SLOTS - 1)


def _dsatur(
    courses: list[Course],
    graph: dict[str, set[str]],
    unavailable_map: dict[str, set[int]],
) -> tuple[dict[str, int], list[tuple[str, int, int]]]:
    """
    DSATUR graph colouring where each colour IS a slot index (0–19).
    Non-conflicting courses may share the same slot.
    Returns (slot_map, assignment_order).
    """
    course_map = {c.id: c for c in courses}
    slot: dict[str, int] = {}
    saturation: dict[str, int] = {c.id: 0 for c in courses}
    degree: dict[str, int] = {c.id: len(graph[c.id]) for c in courses}
    uncolored = {c.id for c in courses}
    assignment_order: list[tuple[str, int, int]] = []

    while uncolored:
        v = max(uncolored, key=lambda x: (saturation[x], degree[x]))
        s = _find_slot(v, course_map, graph, slot, unavailable_map)
        slot[v] = s
        assignment_order.append((v, saturation[v], degree[v]))
        uncolored.remove(v)
        for nb in graph[v]:
            if nb in uncolored:
                nb_slots = {slot[nb2] for nb2 in graph[nb] if nb2 in slot}
                saturation[nb] = len(nb_slots)

    return slot, assignment_order


def _welsh_powell(
    courses: list[Course],
    graph: dict[str, set[str]],
    unavailable_map: dict[str, set[int]],
) -> tuple[dict[str, int], list[tuple[str, int, int]]]:
    """Welsh-Powell: sort by degree desc, greedy slot assignment."""
    course_map = {c.id: c for c in courses}
    sorted_courses = sorted(courses, key=lambda c: len(graph[c.id]), reverse=True)
    slot: dict[str, int] = {}
    assignment_order: list[tuple[str, int, int]] = []
    for c in sorted_courses:
        s = _find_slot(c.id, course_map, graph, slot, unavailable_map)
        slot[c.id] = s
        assignment_order.append((c.id, 0, len(graph[c.id])))
    return slot, assignment_order


def solve_timetabling(
    courses: list[Course], lecturers: list[Lecturer], algorithm: str
) -> TimetablingResponse:
    # ── 1. Conflict edge count on the ORIGINAL course list (for reporting) ──
    orig_graph = _build_conflict_graph(courses)
    orig_conflict_edges = sum(len(v) for v in orig_graph.values()) // 2

    unavailable_map: dict[str, set[int]] = {
        l.id: set(l.unavailable_slots) for l in lecturers
    }

    # ── 2. Expand: split every 4-SKS course into two 2-SKS halves ──
    # The two halves share lecturer_id → they will conflict with each other
    # AND with every course that conflicted with the original.
    expanded: list[Course] = []
    half_to_orig: dict[str, Course] = {}  # expanded_id → original course

    for c in courses:
        if c.sks == 4:
            ca = Course(id=f"{c.id}__a", name=c.name, sks=2,
                        lecturer_id=c.lecturer_id, semester=c.semester)
            cb = Course(id=f"{c.id}__b", name=c.name, sks=2,
                        lecturer_id=c.lecturer_id, semester=c.semester)
            expanded.extend([ca, cb])
            half_to_orig[ca.id] = c
            half_to_orig[cb.id] = c
        else:
            expanded.append(c)
            half_to_orig[c.id] = c

    # ── 3. Build conflict graph on expanded list and run colouring ──
    exp_graph = _build_conflict_graph(expanded)

    if algorithm == "welsh-powell":
        slot_map, assignment_order = _welsh_powell(expanded, exp_graph, unavailable_map)
    else:
        slot_map, assignment_order = _dsatur(expanded, exp_graph, unavailable_map)

    lec_map = {l.id: l.name for l in lecturers}

    # ── 4. Collect slot(s) per original course ──
    # For 4-SKS: two entries (from _a and _b); for others: one entry.
    slots_by_orig: dict[str, list[tuple[int, str, int, str]]] = {}
    for exp_id, orig in half_to_orig.items():
        s = slot_map[exp_id]
        day, period, label = TIME_SLOTS[s]
        slots_by_orig.setdefault(orig.id, []).append((s, day, period, label))

    # ── 5. Build steps (animation order), one per original course ──
    seen_steps: set[str] = set()
    steps: list[ScheduleStep] = []
    for exp_id, sat, deg in assignment_order:
        orig = half_to_orig[exp_id]
        if orig.id in seen_steps:
            continue
        seen_steps.add(orig.id)

        slots = slots_by_orig.get(orig.id, [])
        s1 = slots[0]
        s2 = slots[1] if len(slots) > 1 else None
        steps.append(ScheduleStep(
            course_id=orig.id,
            course_name=orig.name,
            lecturer_name=lec_map.get(orig.lecturer_id, "?"),
            slot_index=s1[0], slot_day=s1[1], slot_period=s1[2], slot_label=s1[3],
            degree=deg,
            saturation=sat,
            slot2_index=s2[0] if s2 else None,
            slot2_day=s2[1] if s2 else None,
            slot2_period=s2[2] if s2 else None,
            slot2_label=s2[3] if s2 else None,
        ))

    # ── 6. Build final schedule, one ScheduleEntry per original course ──
    schedule: list[ScheduleEntry] = []
    for c in courses:
        slots = slots_by_orig.get(c.id, [])
        if not slots:
            continue
        s1 = slots[0]
        s2 = slots[1] if len(slots) > 1 else None
        schedule.append(ScheduleEntry(
            course_id=c.id,
            course_name=c.name,
            lecturer_id=c.lecturer_id,
            lecturer_name=lec_map.get(c.lecturer_id, "?"),
            sks=c.sks,
            semester=c.semester,
            slot_index=s1[0], slot_day=s1[1], slot_period=s1[2], slot_label=s1[3],
            slot2_index=s2[0] if s2 else None,
            slot2_day=s2[1] if s2 else None,
            slot2_period=s2[2] if s2 else None,
            slot2_label=s2[3] if s2 else None,
        ))

    total_slots_used = len({s for slots in slots_by_orig.values() for s, *_ in slots})

    return TimetablingResponse(
        algorithm=algorithm,
        schedule=schedule,
        steps=steps,
        total_slots_used=total_slots_used,
        conflict_edges=orig_conflict_edges,
    )
