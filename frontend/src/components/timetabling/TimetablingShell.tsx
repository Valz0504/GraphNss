"use client";

import { Fragment, useRef, useState } from "react";

import ConsolePanel from "@/components/basic-graph/ConsolePanel";
import type { ConsoleLine } from "@/components/basic-graph/types";
import {
  solveTimetabling,
  type Course,
  type Lecturer,
  type ScheduleEntry,
  type TimetablingAlgorithm,
} from "@/lib/timetablingApi";

/* ─── Time slot grid (5 days × 4 periods) ─── */
const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const PERIODS = [
  { period: 1, label: "07:00–09:40" },
  { period: 2, label: "10:00–12:40" },
  { period: 3, label: "13:00–15:40" },
  { period: 4, label: "16:00–18:40" },
];

/* ─── 16 distinct card colors (cycled by lecturer index) ─── */
const LECTURER_PALETTE = [
  { bg: "rgba(239,68,68,0.15)",   border: "rgba(239,68,68,0.45)",   text: "#f87171"  },
  { bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.45)",  text: "#60a5fa"  },
  { bg: "rgba(34,197,94,0.15)",   border: "rgba(34,197,94,0.45)",   text: "#4ade80"  },
  { bg: "rgba(234,179,8,0.15)",   border: "rgba(234,179,8,0.45)",   text: "#facc15"  },
  { bg: "rgba(168,85,247,0.15)",  border: "rgba(168,85,247,0.45)",  text: "#c084fc"  },
  { bg: "rgba(249,115,22,0.15)",  border: "rgba(249,115,22,0.45)",  text: "#fb923c"  },
  { bg: "rgba(20,184,166,0.15)",  border: "rgba(20,184,166,0.45)",  text: "#2dd4bf"  },
  { bg: "rgba(236,72,153,0.15)",  border: "rgba(236,72,153,0.45)",  text: "#f472b6"  },
  { bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.45)",  text: "#818cf8"  },
  { bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.45)",  text: "#34d399"  },
  { bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.45)",  text: "#fbbf24"  },
  { bg: "rgba(244,114,182,0.15)", border: "rgba(244,114,182,0.45)", text: "#f9a8d4"  },
];

/* ─── Preset: SIF ITB-style semester data ─── */
const PRESET_LECTURERS: Lecturer[] = [
  { id: "l1", name: "Dr. Ahmad Fauzi" },
  { id: "l2", name: "Dr. Budi Raharjo" },
  { id: "l3", name: "Dr. Citra Dewi" },
  { id: "l4", name: "Dr. Dewi Anggraini" },
  { id: "l5", name: "Dr. Eko Santoso" },
  { id: "l6", name: "Dr. Fajar Nugroho" },
];

const PRESET_COURSES: Course[] = [
  // Semester 1
  { id: "c1",  name: "Algoritma Pemrograman",          sks: 3, lecturer_id: "l1", semester: 1 },
  { id: "c2",  name: "Matematika 1",                   sks: 3, lecturer_id: "l2", semester: 1 },
  { id: "c3",  name: "Fisika Dasar",                   sks: 2, lecturer_id: "l3", semester: 1 },
  { id: "c4",  name: "Pengantar Teknik Informatika",   sks: 2, lecturer_id: "l4", semester: 1 },
  // Semester 3
  { id: "c5",  name: "Algoritma & Struktur Data",      sks: 3, lecturer_id: "l1", semester: 3 },
  { id: "c6",  name: "Matematika Diskrit",             sks: 3, lecturer_id: "l2", semester: 3 },
  { id: "c7",  name: "Basis Data",                     sks: 3, lecturer_id: "l5", semester: 3 },
  { id: "c8",  name: "Rekayasa Perangkat Lunak",       sks: 3, lecturer_id: "l6", semester: 3 },
  // Semester 5
  { id: "c9",  name: "Kecerdasan Buatan",              sks: 3, lecturer_id: "l1", semester: 5 },
  { id: "c10", name: "Jaringan Komputer",              sks: 3, lecturer_id: "l3", semester: 5 },
  { id: "c11", name: "Pemrograman Web",                sks: 3, lecturer_id: "l5", semester: 5 },
  { id: "c12", name: "Sistem Operasi",                 sks: 3, lecturer_id: "l6", semester: 5 },
  // Semester 7
  { id: "c13", name: "Pembelajaran Mesin",             sks: 3, lecturer_id: "l4", semester: 7 },
  { id: "c14", name: "Keamanan Siber",                 sks: 3, lecturer_id: "l2", semester: 7 },
  { id: "c15", name: "Grafika Komputer",               sks: 3, lecturer_id: "l3", semester: 7 },
  { id: "c16", name: "Interaksi Manusia-Komputer",     sks: 2, lecturer_id: "l5", semester: 7 },
];

let idCounter = 100;
function genId() { return `x${++idCounter}`; }

/* ─── Course card in the timetable ─── */
function CourseCard({
  entry,
  lecturerIndex,
  visible,
}: {
  entry: ScheduleEntry;
  lecturerIndex: number;
  visible: boolean;
}) {
  const palette = LECTURER_PALETTE[lecturerIndex % LECTURER_PALETTE.length]!;
  return (
    <div
      className="rounded-md px-2 py-1.5 text-left transition-all"
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.85)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      <p className="truncate text-[11px] font-semibold leading-tight" style={{ color: palette.text }}>
        {entry.course_name}
      </p>
      <p className="mt-0.5 truncate text-[10px] leading-tight" style={{ color: "var(--text-muted)" }}>
        {entry.lecturer_name}
      </p>
      <div className="mt-1 flex items-center gap-1.5">
        <span
          className="rounded px-1 text-[9px] font-bold"
          style={{ background: palette.border, color: palette.text }}
        >
          {entry.sks} SKS
        </span>
        {entry.semester && (
          <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
            Sem {entry.semester}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Timetable grid ─── */
function TimetableGrid({
  schedule,
  visibleIds,
  lecturerColorMap,
}: {
  schedule: ScheduleEntry[];
  visibleIds: Set<string>;
  lecturerColorMap: Map<string, number>;
}) {
  // Build lookup: (day, period) → entries[]
  const cellMap = new Map<string, ScheduleEntry[]>();
  for (const entry of schedule) {
    const key = `${entry.slot_day}|${entry.slot_period}`;
    if (!cellMap.has(key)) cellMap.set(key, []);
    cellMap.get(key)!.push(entry);
  }

  return (
    <div className="w-full">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `76px repeat(5, 1fr)`,
          gap: 1,
        }}
      >
        {/* Header row */}
        <div
          className="flex items-center justify-center rounded-tl-lg px-2 py-2.5 text-[11px] font-semibold"
          style={{ background: "var(--bg-surface)", color: "var(--text-muted)" }}
        />
        {DAYS.map((day) => (
          <div
            key={day}
            className="flex items-center justify-center px-2 py-2.5 text-[12px] font-bold"
            style={{ background: "var(--bg-surface)", color: "var(--text-base)", borderBottom: "1px solid var(--border)" }}
          >
            {day}
          </div>
        ))}

        {/* Data rows */}
        {PERIODS.map(({ period, label }) => (
          <Fragment key={period}>
            {/* Period label */}
            <div
              className="flex flex-col items-center justify-center gap-0.5 px-2 py-3 text-center"
              style={{ background: "var(--bg-surface)", borderRight: "1px solid var(--border)" }}
            >
              <span className="text-[11px] font-bold" style={{ color: "var(--text-subtle)" }}>
                Sesi {period}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</span>
            </div>

            {/* Day cells */}
            {DAYS.map((day) => {
              const entries = cellMap.get(`${day}|${period}`) ?? [];
              return (
                <div
                  key={`${day}-${period}`}
                  className="flex flex-col gap-1 p-1.5"
                  style={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    minHeight: 60,
                  }}
                >
                  {entries.map((e) => (
                    <CourseCard
                      key={e.course_id}
                      entry={e}
                      lecturerIndex={lecturerColorMap.get(e.lecturer_id) ?? 0}
                      visible={visibleIds.has(e.course_id)}
                    />
                  ))}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/* ─── Sidebar ─── */
function TimetablingSidebar({
  lecturers,
  courses,
  isBusy,
  canSolve,
  newLecturerName,
  newCourseName,
  newCourseSks,
  newCourseLecturerId,
  newCourseSemester,
  onNewLecturerNameChange,
  onNewCourseNameChange,
  onNewCourseSksChange,
  onNewCourseLecturerIdChange,
  onNewCourseSemesterChange,
  onAddLecturer,
  onDeleteLecturer,
  onAddCourse,
  onDeleteCourse,
  onLoadPreset,
  onSolve,
  onReset,
  onClearAll,
  onClose,
}: {
  lecturers: Lecturer[];
  courses: Course[];
  isBusy: boolean;
  canSolve: boolean;
  newLecturerName: string;
  newCourseName: string;
  newCourseSks: number;
  newCourseLecturerId: string;
  newCourseSemester: number | null;
  onNewLecturerNameChange: (v: string) => void;
  onNewCourseNameChange: (v: string) => void;
  onNewCourseSksChange: (v: number) => void;
  onNewCourseLecturerIdChange: (v: string) => void;
  onNewCourseSemesterChange: (v: number | null) => void;
  onAddLecturer: () => void;
  onDeleteLecturer: (id: string) => void;
  onAddCourse: () => void;
  onDeleteCourse: (id: string) => void;
  onLoadPreset: () => void;
  onSolve: () => void;
  onReset: () => void;
  onClearAll: () => void;
  onClose?: () => void;
}) {
  const inputStyle: React.CSSProperties = {
    background: "var(--bg-raised)",
    color: "var(--text-base)",
    border: "1px solid var(--border)",
    outline: "none",
  };

  return (
    <div
      className="flex h-full flex-col overflow-y-auto"
      style={{ width: 320, background: "var(--bg-surface)", borderLeft: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-6 w-6 items-center justify-center rounded"
            style={{ background: "rgba(245,158,11,0.15)" }}
          >
            <span className="text-[13px]" style={{ color: "#fbbf24" }}>▦</span>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text-base)" }}>Timetabling</p>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Graph Coloring — Penjadwalan Kuliah</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-lg leading-none" style={{ color: "var(--text-muted)" }}>✕</button>
        )}
      </div>

      <div className="flex flex-col gap-5 px-5 py-4">

        {/* ── Preset ── */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Preset
          </p>
          <button
            disabled={isBusy}
            onClick={onLoadPreset}
            className="w-full rounded-lg py-2 text-[12px] font-semibold transition-all hover:brightness-110"
            style={{
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.35)",
              color: "#fbbf24",
              opacity: isBusy ? 0.5 : 1,
              cursor: isBusy ? "not-allowed" : "pointer",
            }}
          >
            Muat Data Contoh
          </button>
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Dosen ── */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Dosen ({lecturers.length})
          </p>

          {/* Add lecturer */}
          <div className="flex gap-2">
            <input
              disabled={isBusy}
              value={newLecturerName}
              onChange={(e) => onNewLecturerNameChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onAddLecturer(); }}
              placeholder="Nama dosen…"
              className="flex-1 min-w-0 rounded-lg px-2.5 py-1.5 text-[12px]"
              style={inputStyle}
            />
            <button
              disabled={isBusy || !newLecturerName.trim()}
              onClick={onAddLecturer}
              className="shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all"
              style={{
                background: "rgba(220,38,38,0.15)",
                color: "var(--primary-light)",
                border: "1px solid rgba(220,38,38,0.3)",
                opacity: isBusy || !newLecturerName.trim() ? 0.4 : 1,
                cursor: isBusy || !newLecturerName.trim() ? "not-allowed" : "pointer",
              }}
            >
              +
            </button>
          </div>

          {/* Lecturer list */}
          {lecturers.length > 0 && (
            <div className="flex flex-col gap-1" style={{ maxHeight: 150, overflowY: "auto" }}>
              {lecturers.map((lec, idx) => {
                const palette = LECTURER_PALETTE[idx % LECTURER_PALETTE.length]!;
                return (
                  <div
                    key={lec.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                    style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: palette.text }}
                    />
                    <span className="flex-1 min-w-0 truncate text-[12px]" style={{ color: "var(--text-base)" }}>
                      {lec.name}
                    </span>
                    <button
                      disabled={isBusy}
                      onClick={() => onDeleteLecturer(lec.id)}
                      className="shrink-0 text-[11px] hover:brightness-150"
                      style={{ color: "var(--text-muted)", opacity: isBusy ? 0.4 : 1 }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Mata Kuliah ── */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Mata Kuliah ({courses.length})
          </p>

          {/* Add course form */}
          <div className="flex flex-col gap-1.5">
            <input
              disabled={isBusy}
              value={newCourseName}
              onChange={(e) => onNewCourseNameChange(e.target.value)}
              placeholder="Nama mata kuliah…"
              className="w-full rounded-lg px-2.5 py-1.5 text-[12px]"
              style={inputStyle}
            />
            <div className="flex gap-1.5">
              <select
                disabled={isBusy}
                value={newCourseSks}
                onChange={(e) => onNewCourseSksChange(Number(e.target.value))}
                className="rounded-lg px-2 py-1.5 text-[12px]"
                style={{ ...inputStyle, width: 72 }}
              >
                {[1, 2, 3, 4, 6].map((n) => <option key={n} value={n}>{n} SKS</option>)}
              </select>
              <select
                disabled={isBusy || lecturers.length === 0}
                value={newCourseLecturerId}
                onChange={(e) => onNewCourseLecturerIdChange(e.target.value)}
                className="flex-1 min-w-0 rounded-lg px-2 py-1.5 text-[12px]"
                style={inputStyle}
              >
                {lecturers.length === 0
                  ? <option value="">— tambah dosen dulu —</option>
                  : lecturers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)
                }
              </select>
              <select
                disabled={isBusy}
                value={newCourseSemester ?? ""}
                onChange={(e) => onNewCourseSemesterChange(e.target.value ? Number(e.target.value) : null)}
                className="rounded-lg px-2 py-1.5 text-[12px]"
                style={{ ...inputStyle, width: 72 }}
              >
                <option value="">Sem —</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>Sem {n}</option>)}
              </select>
            </div>
            <button
              disabled={isBusy || !newCourseName.trim() || !newCourseLecturerId}
              onClick={onAddCourse}
              className="w-full rounded-lg py-1.5 text-[12px] font-semibold transition-all"
              style={{
                background: "rgba(220,38,38,0.15)",
                color: "var(--primary-light)",
                border: "1px solid rgba(220,38,38,0.3)",
                opacity: isBusy || !newCourseName.trim() || !newCourseLecturerId ? 0.4 : 1,
                cursor: isBusy || !newCourseName.trim() || !newCourseLecturerId ? "not-allowed" : "pointer",
              }}
            >
              + Tambah Mata Kuliah
            </button>
          </div>

          {/* Course list */}
          {courses.length > 0 && (
            <div className="flex flex-col gap-1" style={{ maxHeight: 200, overflowY: "auto" }}>
              {courses.map((c) => {
                const lecIdx = lecturers.findIndex((l) => l.id === c.lecturer_id);
                const palette = LECTURER_PALETTE[(lecIdx >= 0 ? lecIdx : 0) % LECTURER_PALETTE.length]!;
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                    style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: palette.text }} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[11px] font-medium" style={{ color: "var(--text-base)" }}>
                        {c.name}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {c.sks} SKS{c.semester ? ` · Sem ${c.semester}` : ""}
                      </p>
                    </div>
                    <button
                      disabled={isBusy}
                      onClick={() => onDeleteCourse(c.id)}
                      className="shrink-0 text-[11px] hover:brightness-150"
                      style={{ color: "var(--text-muted)", opacity: isBusy ? 0.4 : 1 }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Action buttons ── */}
        <div className="flex flex-col gap-2">
          <button
            disabled={!canSolve}
            onClick={onSolve}
            className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all"
            style={{
              background: canSolve
                ? "linear-gradient(135deg, var(--primary), var(--primary-dark))"
                : "var(--bg-overlay)",
              color: canSolve ? "#fff" : "var(--text-muted)",
              cursor: canSolve ? "pointer" : "not-allowed",
              boxShadow: canSolve ? "0 4px 14px rgba(220,38,38,0.4)" : "none",
            }}
          >
            {isBusy ? "Menjadwalkan…" : "Jadwalkan Otomatis"}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onReset}
              className="flex-1 rounded-lg py-1.5 text-xs font-medium hover:brightness-110"
              style={{ background: "var(--bg-raised)", color: "var(--text-subtle)", border: "1px solid var(--border)" }}
            >
              Reset Jadwal
            </button>
            <button
              onClick={onClearAll}
              className="flex-1 rounded-lg py-1.5 text-xs font-medium hover:brightness-110"
              style={{ background: "var(--bg-raised)", color: "var(--text-subtle)", border: "1px solid var(--border)" }}
            >
              Hapus Semua
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Shell ─── */
export default function TimetablingShell() {
  const [lecturers,  setLecturers]  = useState<Lecturer[]>([]);
  const [courses,    setCourses]    = useState<Course[]>([]);
  const [schedule,   setSchedule]   = useState<ScheduleEntry[]>([]);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [isBusy,     setIsBusy]     = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // New-entry form state
  const [newLecturerName,      setNewLecturerName]      = useState("");
  const [newCourseName,        setNewCourseName]        = useState("");
  const [newCourseSks,         setNewCourseSks]         = useState(3);
  const [newCourseLecturerId,  setNewCourseLecturerId]  = useState("");
  const [newCourseSemester,    setNewCourseSemester]    = useState<number | null>(null);

  const [lines, setLines] = useState<ConsoleLine[]>([
    { type: "info",  text: "Timetabling siap." },
    { type: "muted", text: "Tambah dosen & mata kuliah, atau muat data contoh, lalu tekan Jadwalkan Otomatis." },
  ]);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function appendLine(line: ConsoleLine) {
    setLines((prev) => [...prev, line]);
  }

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  // Build lecturer → palette index map
  const lecturerColorMap = new Map(lecturers.map((l, i) => [l.id, i]));

  /* ── Handlers ── */
  function handleAddLecturer() {
    const name = newLecturerName.trim();
    if (!name) return;
    setLecturers((prev) => [...prev, { id: genId(), name }]);
    setNewLecturerName("");
    if (!newCourseLecturerId) {
      // auto-select first lecturer
    }
  }

  function handleDeleteLecturer(id: string) {
    setLecturers((prev) => prev.filter((l) => l.id !== id));
    setCourses((prev) => prev.filter((c) => c.lecturer_id !== id));
  }

  function handleAddCourse() {
    const name = newCourseName.trim();
    if (!name || !newCourseLecturerId) return;
    setCourses((prev) => [
      ...prev,
      { id: genId(), name, sks: newCourseSks, lecturer_id: newCourseLecturerId, semester: newCourseSemester },
    ]);
    setNewCourseName("");
  }

  function handleDeleteCourse(id: string) {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setSchedule((prev) => prev.filter((e) => e.course_id !== id));
    setVisibleIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }

  function handleLoadPreset() {
    clearTimers();
    setIsBusy(false);
    setLecturers(PRESET_LECTURERS);
    setCourses(PRESET_COURSES);
    setSchedule([]);
    setVisibleIds(new Set());
    setNewCourseLecturerId("l1");
    setLines([
      { type: "info",  text: "Data contoh dimuat." },
      { type: "muted", text: `${PRESET_LECTURERS.length} dosen · ${PRESET_COURSES.length} mata kuliah · 4 semester` },
      { type: "muted", text: "Tekan Jadwalkan Otomatis untuk menjalankan graph coloring." },
    ]);
  }

  function handleReset() {
    clearTimers();
    setIsBusy(false);
    setSchedule([]);
    setVisibleIds(new Set());
    setLines([{ type: "muted", text: "Jadwal direset." }]);
  }

  function handleClearAll() {
    clearTimers();
    setIsBusy(false);
    setLecturers([]);
    setCourses([]);
    setSchedule([]);
    setVisibleIds(new Set());
    setNewCourseLecturerId("");
    setLines([
      { type: "info",  text: "Timetabling siap." },
      { type: "muted", text: "Tambah dosen & mata kuliah, atau muat data contoh." },
    ]);
  }

  async function handleSolve() {
    if (courses.length < 2 || isBusy) return;

    clearTimers();
    setSchedule([]);
    setVisibleIds(new Set());
    setIsBusy(true);

    setLines([
      { type: "info",  text: "Algoritma : DSATUR (Graph Coloring)" },
      { type: "muted", text: `${courses.length} mata kuliah · ${lecturers.length} dosen` },
      { type: "muted", text: "─────────────────────────────" },
    ]);

    try {
      const res = await solveTimetabling(courses, lecturers, "dsatur");

      setSchedule(res.schedule);
      appendLine({ type: "muted", text: `Conflict edges : ${res.conflict_edges}` });
      appendLine({ type: "muted", text: `Slot digunakan : ${res.total_slots_used} dari 20 tersedia` });
      appendLine({ type: "muted", text: "─────────────────────────────" });

      // Animate step by step
      res.steps.forEach((step, i) => {
        const t = setTimeout(() => {
          setVisibleIds((prev) => { const n = new Set(prev); n.add(step.course_id); return n; });
          setLines((prev) => [
            ...prev,
            {
              type: "output",
              text: `${step.course_name} → ${step.slot_day} ${step.slot_label}`,
            },
          ]);

          if (i === res.steps.length - 1) {
            setLines((prev) => [
              ...prev,
              { type: "muted", text: "─────────────────────────────" },
              { type: "info",  text: `Penjadwalan selesai! ${res.schedule.length} mata kuliah dijadwalkan.` },
            ]);
            setIsBusy(false);
          }
        }, i * 500);
        timersRef.current.push(t);
      });
    } catch (err) {
      appendLine({ type: "error", text: `Error: ${String(err)}` });
      setIsBusy(false);
    }
  }

  const canSolve = courses.length >= 2 && lecturers.length >= 1 && !isBusy;

  const sidebarProps = {
    lecturers,
    courses,
    isBusy,
    canSolve,
    newLecturerName,
    newCourseName,
    newCourseSks,
    newCourseLecturerId,
    newCourseSemester,
    onNewLecturerNameChange: setNewLecturerName,
    onNewCourseNameChange:   setNewCourseName,
    onNewCourseSksChange:    setNewCourseSks,
    onNewCourseLecturerIdChange: (v: string) => { setNewCourseLecturerId(v); },
    onNewCourseSemesterChange:   setNewCourseSemester,
    onAddLecturer:    handleAddLecturer,
    onDeleteLecturer: handleDeleteLecturer,
    onAddCourse:      handleAddCourse,
    onDeleteCourse:   handleDeleteCourse,
    onLoadPreset:     handleLoadPreset,
    onSolve:          handleSolve,
    onReset:          handleReset,
    onClearAll:       handleClearAll,
  };

  return (
    <div className="relative flex h-full overflow-hidden">

      {/* ── Main: Timetable + Console ── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Timetable area */}
        <div className="relative flex-1 overflow-hidden">
          {schedule.length === 0 ? (
            /* Empty state */
            <div className="flex h-full items-center justify-center px-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24" }}
                >
                  ▦
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-base)" }}>
                    Belum ada jadwal
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    Muat data contoh atau tambah dosen & mata kuliah,<br />lalu tekan Jadwalkan Otomatis
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Timetable grid */
            <div className="absolute inset-0 overflow-auto p-4">
              {/* Stats bar */}
              <div className="mb-3 flex items-center gap-4 flex-wrap">
                <span
                  className="rounded-lg px-3 py-1 text-[11px] font-semibold"
                  style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)", color: "var(--primary-light)" }}
                >
                  {schedule.length} Mata Kuliah
                </span>
                <span
                  className="rounded-lg px-3 py-1 text-[11px] font-semibold"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}
                >
                  {new Set(schedule.map((e) => `${e.slot_day}|${e.slot_period}`)).size} Slot Dipakai
                </span>
                <span
                  className="rounded-lg px-3 py-1 text-[11px] font-semibold"
                  style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa" }}
                >
                  DSATUR
                </span>
              </div>

              <TimetableGrid
                schedule={schedule}
                visibleIds={visibleIds}
                lecturerColorMap={lecturerColorMap}
              />
            </div>
          )}
        </div>

        <ConsolePanel lines={lines} />
      </main>

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex">
        <TimetablingSidebar {...sidebarProps} />
      </div>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40"
            style={{ top: "var(--navbar-h)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="lg:hidden fixed inset-y-0 right-0 z-50 overflow-y-auto"
            style={{
              top: "var(--navbar-h)",
              width: "min(320px, 90vw)",
              animation: "slideInRight 0.25s cubic-bezier(0.16,1,0.3,1) forwards",
            }}
          >
            <TimetablingSidebar {...sidebarProps} onClose={() => setDrawerOpen(false)} />
          </aside>
        </>
      )}

      {/* ── Mobile toggle button ── */}
      {!drawerOpen && (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden fixed bottom-6 right-5 z-30 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            boxShadow: "0 4px 20px rgba(220,38,38,0.5)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="15" y2="18" />
          </svg>
          Kontrol
        </button>
      )}

    </div>
  );
}
