const DEFAULT_BASE_URL = "http://localhost:8000";

function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface Lecturer {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  sks: number;
  lecturer_id: string;
  semester: number | null;
}

export type TimetablingAlgorithm = "dsatur" | "welsh-powell";

export interface ScheduleStep {
  course_id: string;
  course_name: string;
  lecturer_name: string;
  slot_index: number;
  slot_day: string;
  slot_period: number;
  slot_label: string;
  degree: number;
  saturation: number;
}

export interface ScheduleEntry {
  course_id: string;
  course_name: string;
  lecturer_id: string;
  lecturer_name: string;
  sks: number;
  semester: number | null;
  slot_index: number;
  slot_day: string;
  slot_period: number;
  slot_label: string;
}

export interface TimetablingResponse {
  algorithm: string;
  schedule: ScheduleEntry[];
  steps: ScheduleStep[];
  total_slots_used: number;
  conflict_edges: number;
}

export function solveTimetabling(
  courses: Course[],
  lecturers: Lecturer[],
  algorithm: TimetablingAlgorithm,
): Promise<TimetablingResponse> {
  return postJson<TimetablingResponse>("/api/v1/timetabling/solve", {
    courses,
    lecturers,
    algorithm,
  });
}
