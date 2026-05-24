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

export interface TspCity {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface TspStep {
  from_city: string;
  to_city: string;
  distance_added: number;
  cumulative_distance: number;
}

export type TspAlgorithm = "nearest-neighbor" | "two-opt" | "held-karp";

export interface TspResponse {
  algorithm: string;
  tour: string[];
  total_distance: number;
  steps: TspStep[];
  city_count: number;
}

export function solveTsp(cities: TspCity[], algorithm: TspAlgorithm): Promise<TspResponse> {
  return postJson<TspResponse>("/api/v1/tsp/solve", { cities, algorithm });
}
