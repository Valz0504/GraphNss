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
const DAYS      = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const DAYS_SHORT = ["Se", "Sl", "Ra", "Ka", "Ju"];
const PERIODS = [
  { period: 1, label: "07:00–09:40" },
  { period: 2, label: "10:00–12:40" },
  { period: 3, label: "13:00–15:40" },
  { period: 4, label: "16:00–18:40" },
];
const N_SLOTS = 20; // 5 days × 4 periods

/** slot index = dayIdx * 4 + (period - 1), range 0–19 */
function slotIdx(dayIdx: number, period: number) { return dayIdx * 4 + (period - 1); }

/* ─── 12 distinct card colors (cycled by lecturer index) ─── */
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

/* ════════════════════════════════════════
   Preset — Teknik Informatika ITB
════════════════════════════════════════ */
const IF_LECTURERS_CLEAN: Lecturer[] = [
  { id: "l01", name: "Yani Widyani" },
  { id: "l02", name: "Rinaldi" },
  { id: "l03", name: "Fariska Z. Ruskanda" },
  { id: "l04", name: "Robithoh Annur" },
  { id: "l05", name: "M. Zuhri Catur Candra" },
  { id: "l06", name: "Wikan Danar Sunindyo" },
  { id: "l07", name: "Rila Mandala" },
  { id: "l08", name: "Judhi Santoso" },
  { id: "l09", name: "Tricya E. Widagdo" },
  { id: "l10", name: "Adi Mulyanto" },
  { id: "l11", name: "Agung Dewandaru" },
  { id: "l12", name: "Windy Gambetta" },
  { id: "l13", name: "Fitra Arifiansyah" },
  { id: "l14", name: "Dody Dharma" },
  { id: "l15", name: "Ayu Purwarianti" },
  { id: "l16", name: "Saiful Akbar" },
];

const IF_COURSES: Course[] = [
  // ── Semester 1 ─────────────────────────────
  { id: "c01", name: "IF1210 · Dasar Pemrograman",          sks: 3, lecturer_id: "l01", semester: 1 }, // Yani → konflik lintas sem w/ IF3250
  { id: "c02", name: "IF1220 · Matematika Diskrit",         sks: 3, lecturer_id: "l02", semester: 1 }, // Rinaldi → konflik lintas sem w/ IF2211
  { id: "c03", name: "IF1221 · Struktur Diskrit",           sks: 2, lecturer_id: "l03", semester: 1 }, // Fariska → konflik lintas sem w/ IF3270
  { id: "c04", name: "IF1230 · Orkom & Arsitektur",         sks: 3, lecturer_id: "l04", semester: 1 }, // Robithoh → konflik lintas sem w/ IF2230
  // ── Semester 3 ─────────────────────────────
  { id: "c05", name: "IF2010 · Algoritma & Struktur Data",  sks: 3, lecturer_id: "l05", semester: 3 }, // Zuhri → konflik lintas sem w/ IF4050
  { id: "c06", name: "IF2050 · Rekayasa Perangkat Lunak",   sks: 3, lecturer_id: "l06", semester: 3 },
  { id: "c07", name: "IF2211 · Strategi Algoritma",         sks: 3, lecturer_id: "l02", semester: 3 }, // Rinaldi → konflik w/ IF1220
  { id: "c08", name: "IF2224 · Pemodelan & Simulasi",       sks: 4, lecturer_id: "l08", semester: 3 }, // Judhi → konflik lintas sem w/ IF3211
  { id: "c09", name: "IF2230 · Jaringan Komputer",          sks: 3, lecturer_id: "l04", semester: 3 }, // Robithoh → konflik w/ IF1230
  { id: "c10", name: "IF2240 · Sistem Operasi",             sks: 3, lecturer_id: "l09", semester: 3 }, // Tricya → konflik lintas sem w/ IF4092
  // ── Semester 5 ─────────────────────────────
  { id: "c11", name: "IF3141 · Interaksi Manusia-Komputer", sks: 3, lecturer_id: "l12", semester: 5 },
  { id: "c12", name: "IF3151 · Komputer & Masyarakat",      sks: 3, lecturer_id: "l10", semester: 5 }, // Adi → konflik lintas sem w/ IF4091
  { id: "c13", name: "IF3210 · Teori Komputasi",            sks: 2, lecturer_id: "l11", semester: 5 }, // Agung → konflik lintas sem w/ IF4063
  { id: "c14", name: "IF3211 · Teori Graf Algoritmik",      sks: 2, lecturer_id: "l08", semester: 5 }, // Judhi → konflik w/ IF2224
  { id: "c15", name: "IF3250 · Proyek Perangkat Lunak",     sks: 4, lecturer_id: "l01", semester: 5 }, // Yani → konflik w/ IF1210
  { id: "c16", name: "IF3270 · Pembelajaran Mesin",         sks: 3, lecturer_id: "l15", semester: 5 },
  // ── Semester 7 ─────────────────────────────
  { id: "c17", name: "IF4010 · Keamanan Informasi",         sks: 3, lecturer_id: "l14", semester: 7 }, // Dody → konflik internal sem7 w/ IF4062
  { id: "c18", name: "IF4042 · Kriptografi",                sks: 3, lecturer_id: "l07", semester: 7 },
  { id: "c19", name: "IF4044 · Komputasi Paralel",          sks: 3, lecturer_id: "l16", semester: 7 },
  { id: "c20", name: "IF4050 · Pemrosesan Informasi",       sks: 3, lecturer_id: "l05", semester: 7 }, // Zuhri → konflik w/ IF2010
  { id: "c21", name: "IF4062 · Pemrosesan Citra",           sks: 3, lecturer_id: "l14", semester: 7 }, // Dody → konflik w/ IF4010
  { id: "c22", name: "IF4063 · Cloud Computing",            sks: 3, lecturer_id: "l11", semester: 7 }, // Agung → konflik w/ IF3210
  { id: "c23", name: "IF4091 · Wawasan Teknologi",          sks: 2, lecturer_id: "l10", semester: 7 }, // Adi → konflik w/ IF3151
  { id: "c24", name: "IF4092 · Kerja Praktik",              sks: 4, lecturer_id: "l09", semester: 7 }, // Tricya → konflik w/ IF2240
];

/* ════════════════════════════════════════
   Preset — Matematika ITB
════════════════════════════════════════ */
const MA_LECTURERS: Lecturer[] = [
  { id: "m01", name: "Saladin Uttunggadewa" },     // MA1101, MA2251
  { id: "m02", name: "Pritta Etriana Putri" },     // MA1103, MA3011
  { id: "m03", name: "Hilda Assiyatun" },          // MA1201
  { id: "m04", name: "Aditya Purwa Santika" },     // MA1203, MA4051, MA4052
  { id: "m05", name: "Jalina Widjaja" },           // MA1204, MA3041
  { id: "m06", name: "Irawati" },                  // MA2021
  { id: "m07", name: "Dewi Handayani" },           // MA2072, MA3271
  { id: "m08", name: "Agus Yodi Gunawan" },        // MA2074
  { id: "m09", name: "Rudy Kusdiantara" },         // MA4071, MA4072
  { id: "m10", name: "Nuning Nuraini" },           // MA2271
  { id: "m11", name: "RR. Kurnia Novita Sari" },  // MA2281, MA3081, MA4282
  { id: "m12", name: "Aleams Barra" },             // MA3022
  { id: "m13", name: "Yudi Soeharyadi" },          // MA3231
  { id: "m14", name: "Hendra Gunawan" },           // MA2231, MA4031
  { id: "m15", name: "Denny Ivanal Hakim" },       // MA4091, MA4093
];

const MA_COURSES: Course[] = [
  // ── Semester 1 ─────────────────────────────
  { id: "n01", name: "MA1101 · Kalkulus I",              sks: 4, lecturer_id: "m01", semester: 1 }, // Saladin → konflik w/ MA2251
  { id: "n02", name: "MA1103 · Kalkulus II",             sks: 4, lecturer_id: "m02", semester: 1 }, // Pritta → konflik w/ MA3011
  { id: "n03", name: "MA1201 · Aljabar Linier",          sks: 4, lecturer_id: "m03", semester: 1 },
  { id: "n04", name: "MA1203 · Pengantar Sains Data",    sks: 4, lecturer_id: "m04", semester: 1 }, // Aditya → konflik w/ MA4051, MA4052
  { id: "n05", name: "MA1204 · Persamaan Diferensial",   sks: 3, lecturer_id: "m05", semester: 1 }, // Jalina → konflik w/ MA3041
  // ── Semester 3 ─────────────────────────────
  { id: "n06", name: "MA2021 · Analisis Real I",         sks: 3, lecturer_id: "m06", semester: 3 },
  { id: "n07", name: "MA2072 · Statistika Dasar",        sks: 3, lecturer_id: "m07", semester: 3 }, // Dewi → konflik w/ MA3271
  { id: "n08", name: "MA2074 · Pemodelan Matematika",    sks: 3, lecturer_id: "m08", semester: 3 },
  { id: "n09", name: "MA2231 · Teori Grup",              sks: 4, lecturer_id: "m14", semester: 3 }, // Hendra → konflik w/ MA4031
  { id: "n10", name: "MA2251 · Fungsi Kompleks",         sks: 4, lecturer_id: "m01", semester: 3 }, // Saladin → konflik w/ MA1101
  { id: "n11", name: "MA2271 · Teori Bilangan",          sks: 4, lecturer_id: "m10", semester: 3 },
  { id: "n12", name: "MA2281 · Statistika Matematika",   sks: 2, lecturer_id: "m11", semester: 3 }, // RR.Kurnia → konflik w/ MA3081, MA4282
  // ── Semester 5 ─────────────────────────────
  { id: "n13", name: "MA3011 · Analisis Real II",        sks: 2, lecturer_id: "m02", semester: 5 }, // Pritta → konflik w/ MA1103
  { id: "n14", name: "MA3022 · Aljabar Abstrak",         sks: 4, lecturer_id: "m12", semester: 5 },
  { id: "n15", name: "MA3041 · Geometri",                sks: 4, lecturer_id: "m05", semester: 5 }, // Jalina → konflik w/ MA1204
  { id: "n16", name: "MA3081 · Teori Probabilitas",      sks: 4, lecturer_id: "m11", semester: 5 }, // RR.Kurnia → konflik w/ MA2281, MA4282
  { id: "n17", name: "MA3231 · Teori Ring",              sks: 4, lecturer_id: "m13", semester: 5 },
  { id: "n18", name: "MA3271 · Analisis Numerik",        sks: 4, lecturer_id: "m07", semester: 5 }, // Dewi → konflik w/ MA2072
  // ── Semester 7 ─────────────────────────────
  { id: "n19", name: "MA4031 · Analisis Fungsional",     sks: 4, lecturer_id: "m14", semester: 7 }, // Hendra → konflik w/ MA2231
  { id: "n20", name: "MA4051 · Komputasi Saintifik I",   sks: 4, lecturer_id: "m04", semester: 7 }, // Aditya → konflik w/ MA1203, MA4052
  { id: "n21", name: "MA4052 · Komputasi Saintifik II",  sks: 4, lecturer_id: "m04", semester: 7 }, // Aditya → konflik w/ MA4051
  { id: "n22", name: "MA4071 · Teori Optimisasi",        sks: 4, lecturer_id: "m09", semester: 7 }, // Rudy → konflik w/ MA4072
  { id: "n23", name: "MA4072 · Optimisasi Stokastik",    sks: 4, lecturer_id: "m09", semester: 7 }, // Rudy → konflik w/ MA4071
  { id: "n24", name: "MA4282 · Kriptografi Terapan",     sks: 4, lecturer_id: "m11", semester: 7 }, // RR.Kurnia → konflik w/ MA2281, MA3081
  { id: "n25", name: "MA4091 · Tugas Akhir I",           sks: 1, lecturer_id: "m15", semester: 7 }, // Denny → konflik w/ MA4093
  { id: "n26", name: "MA4093 · Topik Khusus",            sks: 3, lecturer_id: "m15", semester: 7 }, // Denny → konflik w/ MA4091
];

/* ─── Default unavailable slots per lecturer ───────────────────────────────
   slot = dayIdx * 4 + (period - 1)
   day:  0=Senin 1=Selasa 2=Rabu 3=Kamis 4=Jumat
   per:  0=P1(07-09) 1=P2(10-12) 2=P3(13-15) 3=P4(16-18)
─────────────────────────────────────────────────────────────────────────── */
function s(day: number, per: number) { return day * 4 + per; }

const IF_DEFAULT_AVAILABILITY = new Map<string, Set<number>>([
  // l01 Yani        – tidak bisa Senin sore & Jumat sore
  ["l01", new Set([s(0,2), s(0,3), s(4,2), s(4,3)])],
  // l02 Rinaldi     – tidak bisa Selasa pagi & Rabu P4
  ["l02", new Set([s(1,0), s(2,3)])],
  // l03 Fariska     – tidak bisa Senin P1 & Kamis sore
  ["l03", new Set([s(0,0), s(3,2), s(3,3)])],
  // l04 Robithoh    – tidak bisa Rabu P1-P2
  ["l04", new Set([s(2,0), s(2,1)])],
  // l05 Zuhri       – tidak bisa Selasa sore & Kamis P1
  ["l05", new Set([s(1,2), s(1,3), s(3,0)])],
  // l06 Wikan       – tidak bisa Senin P2 & Jumat pagi
  ["l06", new Set([s(0,1), s(4,0), s(4,1)])],
  // l07 Rila        – tidak bisa Rabu sore
  ["l07", new Set([s(2,2), s(2,3)])],
  // l08 Judhi       – tidak bisa Kamis P2-P3 & Selasa P4
  ["l08", new Set([s(3,1), s(3,2), s(1,3)])],
  // l09 Tricya      – tidak bisa Jumat P2-P4
  ["l09", new Set([s(4,1), s(4,2), s(4,3)])],
  // l10 Adi         – tidak bisa Senin P1 & P4 & Rabu P2
  ["l10", new Set([s(0,0), s(0,3), s(2,1)])],
  // l11 Agung       – tidak bisa Selasa P1-P2 & Kamis P4
  ["l11", new Set([s(1,0), s(1,1), s(3,3)])],
  // l12 Windy       – tidak bisa Rabu P1 & Jumat P1 & P4
  ["l12", new Set([s(2,0), s(4,0), s(4,3)])],
  // l13 Fitra       – tidak bisa Senin P3 & Kamis P2-P3
  ["l13", new Set([s(0,2), s(3,1), s(3,2)])],
  // l14 Dody        – tidak bisa Selasa P2-P3
  ["l14", new Set([s(1,1), s(1,2)])],
  // l15 Ayu         – tidak bisa Senin P1-P2 & Selasa P1
  ["l15", new Set([s(0,0), s(0,1), s(1,0)])],
  // l16 Saiful      – tidak bisa Rabu P2-P3 & Jumat P3
  ["l16", new Set([s(2,1), s(2,2), s(4,2)])],
]);

const MA_DEFAULT_AVAILABILITY = new Map<string, Set<number>>([
  // m01 Saladin     – tidak bisa Senin sore
  ["m01", new Set([s(0,2), s(0,3)])],
  // m02 Pritta      – tidak bisa Selasa P1-P2
  ["m02", new Set([s(1,0), s(1,1)])],
  // m03 Hilda       – tidak bisa Rabu P3 & Jumat P4
  ["m03", new Set([s(2,2), s(4,3)])],
  // m04 Aditya      – tidak bisa Kamis P1 & P4 & Jumat P1
  ["m04", new Set([s(3,0), s(3,3), s(4,0)])],
  // m05 Jalina      – tidak bisa Senin P1 & Jumat sore
  ["m05", new Set([s(0,0), s(4,2), s(4,3)])],
  // m06 Irawati     – tidak bisa Selasa sore
  ["m06", new Set([s(1,2), s(1,3)])],
  // m07 Dewi        – tidak bisa Rabu P1-P2 & Kamis P4
  ["m07", new Set([s(2,0), s(2,1), s(3,3)])],
  // m08 Agus        – tidak bisa Kamis P2-P3
  ["m08", new Set([s(3,1), s(3,2)])],
  // m09 Rudy        – tidak bisa Jumat P1-P3
  ["m09", new Set([s(4,0), s(4,1), s(4,2)])],
  // m10 Nuning      – tidak bisa Senin P2 & Selasa P4
  ["m10", new Set([s(0,1), s(1,3)])],
  // m11 RR.Kurnia   – tidak bisa Rabu P2 & P4
  ["m11", new Set([s(2,1), s(2,3)])],
  // m12 Aleams      – tidak bisa Kamis P1 & Jumat P4
  ["m12", new Set([s(3,0), s(4,3)])],
  // m13 Yudi        – tidak bisa Senin sore & Rabu P1
  ["m13", new Set([s(0,2), s(0,3), s(2,0)])],
  // m14 Hendra      – tidak bisa Selasa P2 & Kamis P3-P4
  ["m14", new Set([s(1,1), s(3,2), s(3,3)])],
  // m15 Denny       – tidak bisa Senin P1 & Jumat P2-P3
  ["m15", new Set([s(0,0), s(4,1), s(4,2)])],
]);

let idCounter = 100;
function genId() { return `x${++idCounter}`; }

/* ─── Course card in the timetable ─── */
function CourseCard({
  entry,
  lecturerIndex,
  visible,
  meetingNum = 1,
}: {
  entry: ScheduleEntry;
  lecturerIndex: number;
  visible: boolean;
  meetingNum?: 1 | 2;
}) {
  const palette = LECTURER_PALETTE[lecturerIndex % LECTURER_PALETTE.length]!;
  const [code, title] = entry.course_name.split("·").map((s) => s.trim());
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
      <p className="text-[9px] font-bold tracking-wide leading-tight" style={{ color: palette.text }}>
        {code ?? entry.course_name}
      </p>
      {title && (
        <p className="truncate text-[10px] font-medium leading-tight mt-0.5" style={{ color: palette.text, opacity: 0.85 }}>
          {title}
        </p>
      )}
      <p className="mt-1 truncate text-[9px] leading-tight" style={{ color: palette.text, opacity: 0.65 }}>
        {entry.lecturer_name}
      </p>
      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
        <span
          className="rounded px-1 text-[9px] font-bold"
          style={{ background: palette.border, color: palette.text }}
        >
          {entry.sks} SKS
        </span>
        {entry.sks === 4 && (
          <span className="rounded px-1 text-[9px] font-semibold"
            style={{ background: "rgba(0,0,0,0.12)", color: palette.text, opacity: 0.75 }}>
            P{meetingNum}/2
          </span>
        )}
        {entry.semester && (
          <span className="text-[9px]" style={{ color: palette.text, opacity: 0.6 }}>
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
  // Each cell holds { entry, meetingNum } so we can label "Sesi ke-2" on 4-SKS cards
  const cellMap = new Map<string, Array<{ entry: ScheduleEntry; meetingNum: 1 | 2 }>>();
  for (const entry of schedule) {
    const key1 = `${entry.slot_day}|${entry.slot_period}`;
    if (!cellMap.has(key1)) cellMap.set(key1, []);
    cellMap.get(key1)!.push({ entry, meetingNum: 1 });
    // 4-SKS second meeting
    if (entry.slot2_day && entry.slot2_period != null) {
      const key2 = `${entry.slot2_day}|${entry.slot2_period}`;
      if (!cellMap.has(key2)) cellMap.set(key2, []);
      cellMap.get(key2)!.push({ entry, meetingNum: 2 });
    }
  }

  return (
    <div className="w-full">
      <div style={{ display: "grid", gridTemplateColumns: `76px repeat(5, 1fr)`, gap: 1 }}>
        {/* Header row */}
        <div className="flex items-center justify-center rounded-tl-lg px-2 py-2.5 text-[11px] font-semibold"
          style={{ background: "var(--bg-surface)", color: "var(--text-muted)" }} />
        {DAYS.map((day) => (
          <div key={day} className="flex items-center justify-center px-2 py-2.5 text-[12px] font-bold"
            style={{ background: "var(--bg-surface)", color: "var(--text-base)", borderBottom: "1px solid var(--border)" }}>
            {day}
          </div>
        ))}
        {/* Data rows */}
        {PERIODS.map(({ period, label }) => (
          <Fragment key={period}>
            <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-3 text-center"
              style={{ background: "var(--bg-surface)", borderRight: "1px solid var(--border)" }}>
              <span className="text-[11px] font-bold" style={{ color: "var(--text-subtle)" }}>Sesi {period}</span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</span>
            </div>
            {DAYS.map((day) => {
              const entries = cellMap.get(`${day}|${period}`) ?? [];
              return (
                <div key={`${day}-${period}`} className="flex flex-col gap-1 p-1.5"
                  style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", minHeight: 60 }}>
                  {entries.map(({ entry: e, meetingNum }) => (
                    <CourseCard key={`${e.course_id}-${meetingNum}`} entry={e}
                      meetingNum={meetingNum}
                      lecturerIndex={lecturerColorMap.get(e.lecturer_id) ?? 0}
                      visible={visibleIds.has(e.course_id)} />
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

/* ─── Availability Grid ─── */
function AvailabilityGrid({
  unavailable,
  onToggle,
}: {
  unavailable: Set<number>;
  onToggle: (slot: number) => void;
}) {
  return (
    <div className="mt-1.5 rounded-lg overflow-hidden"
      style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "22px repeat(5, 1fr)", gap: 1, padding: "6px 6px 4px" }}>
        {/* Day headers */}
        <div />
        {DAYS_SHORT.map((d) => (
          <div key={d} className="text-center text-[9px] font-bold pb-1" style={{ color: "var(--text-muted)" }}>{d}</div>
        ))}
        {/* Period rows */}
        {PERIODS.map(({ period }) => (
          <Fragment key={period}>
            <div className="flex items-center justify-center text-[9px] font-bold" style={{ color: "var(--text-muted)" }}>
              P{period}
            </div>
            {DAYS.map((_, di) => {
              const slot = slotIdx(di, period);
              const blocked = unavailable.has(slot);
              return (
                <button key={di} type="button" onClick={() => onToggle(slot)}
                  title={`${DAYS[di]} Sesi ${period}: ${blocked ? "Tidak tersedia" : "Tersedia"}`}
                  className="h-6 rounded-sm transition-all hover:brightness-125 active:scale-90"
                  style={{
                    background: blocked ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.15)",
                    border: `1px solid ${blocked ? "rgba(239,68,68,0.5)" : "rgba(34,197,94,0.3)"}`,
                  }}
                />
              );
            })}
          </Fragment>
        ))}
      </div>
      <div className="flex items-center gap-4 px-2 py-1.5" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm" style={{ background: "rgba(34,197,94,0.4)", border: "1px solid rgba(34,197,94,0.5)" }} />
          <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>Tersedia</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm" style={{ background: "rgba(239,68,68,0.4)", border: "1px solid rgba(239,68,68,0.5)" }} />
          <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>Tidak tersedia</span>
        </div>
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
  presetDept,
  lecturerAvailability,
  editingAvailId,
  newLecturerName,
  newCourseName,
  newCourseSks,
  newCourseLecturerId,
  newCourseSemester,
  onPresetDeptChange,
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
  onToggleSlot,
  onSetEditingAvailId,
  onClose,
}: {
  lecturers: Lecturer[];
  courses: Course[];
  isBusy: boolean;
  canSolve: boolean;
  presetDept: "IF" | "MA";
  lecturerAvailability: Map<string, Set<number>>;
  editingAvailId: string | null;
  newLecturerName: string;
  newCourseName: string;
  newCourseSks: number;
  newCourseLecturerId: string;
  newCourseSemester: number | null;
  onPresetDeptChange: (d: "IF" | "MA") => void;
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
  onToggleSlot: (lecturerId: string, slot: number) => void;
  onSetEditingAvailId: (id: string | null) => void;
  onClose?: () => void;
}) {
  const inputStyle: React.CSSProperties = {
    background: "var(--bg-raised)",
    color: "var(--text-base)",
    border: "1px solid var(--border)",
    outline: "none",
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto"
      style={{ width: 320, background: "var(--bg-surface)", borderLeft: "1px solid var(--border)", boxShadow: "-4px 0 24px rgba(0,0,0,0.06)" }}>

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded"
            style={{ background: "rgba(245,158,11,0.15)" }}>
            <span className="text-[13px]" style={{ color: "#fbbf24" }}>▦</span>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text-base)" }}>Timetabling</p>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Graph Coloring — Penjadwalan Kuliah</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-base leading-none transition-all hover:brightness-150 active:scale-90"
            style={{ color: "var(--text-muted)", background: "var(--bg-raised)", border: "1px solid var(--border)" }}>✕</button>
        )}
      </div>

      <div className="flex flex-col gap-5 px-5 py-4">

        {/* ── Preset ── */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>
            Preset
          </p>
          {/* Department selector */}
          <div className="flex gap-1.5">
            {(["IF", "MA"] as const).map((dept) => (
              <button key={dept} type="button"
                disabled={isBusy}
                onClick={() => onPresetDeptChange(dept)}
                className="flex-1 rounded-lg py-1.5 text-[12px] font-semibold transition-all hover:brightness-110 active:scale-[0.97]"
                style={{
                  background: presetDept === dept ? "rgba(245,158,11,0.18)" : "var(--bg-raised)",
                  border: `1px solid ${presetDept === dept ? "rgba(245,158,11,0.5)" : "var(--border-strong)"}`,
                  color: presetDept === dept ? "#fbbf24" : "var(--text-subtle)",
                  opacity: isBusy ? 0.5 : 1,
                  cursor: isBusy ? "not-allowed" : "pointer",
                }}
              >
                {dept === "IF" ? "Informatika" : "Matematika"}
              </button>
            ))}
          </div>
          <button disabled={isBusy} onClick={onLoadPreset}
            className="w-full rounded-lg py-2 text-[12px] font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.35)",
              color: "#fbbf24",
              opacity: isBusy ? 0.5 : 1,
              cursor: isBusy ? "not-allowed" : "pointer",
            }}>
            Muat Data {presetDept === "IF" ? "IF ITB" : "MA ITB"}
          </button>
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Dosen ── */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>
            Dosen ({lecturers.length})
          </p>

          {/* Add lecturer */}
          <div className="flex gap-2">
            <input disabled={isBusy} value={newLecturerName}
              onChange={(e) => onNewLecturerNameChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onAddLecturer(); }}
              placeholder="Nama dosen…"
              className="flex-1 min-w-0 rounded-lg px-2.5 py-1.5 text-[12px]"
              style={inputStyle} />
            <button disabled={isBusy || !newLecturerName.trim()} onClick={onAddLecturer}
              className="shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all hover:brightness-110 active:scale-[0.95]"
              style={{
                background: "rgba(220,38,38,0.15)", color: "var(--primary-light)",
                border: "1px solid rgba(220,38,38,0.3)",
                opacity: isBusy || !newLecturerName.trim() ? 0.4 : 1,
                cursor: isBusy || !newLecturerName.trim() ? "not-allowed" : "pointer",
              }}>+</button>
          </div>

          {/* Lecturer list with availability */}
          {lecturers.length > 0 && (
            <div className="flex flex-col gap-1">
              {lecturers.map((lec, idx) => {
                const palette = LECTURER_PALETTE[idx % LECTURER_PALETTE.length]!;
                const unavail = lecturerAvailability.get(lec.id) ?? new Set<number>();
                const isEditing = editingAvailId === lec.id;
                const blockedCount = unavail.size;
                return (
                  <div key={lec.id} className="flex flex-col rounded-lg overflow-hidden"
                    style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
                    {/* Row */}
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: palette.text }} />
                      <span className="flex-1 min-w-0 truncate text-[12px]" style={{ color: "var(--text-base)" }}>
                        {lec.name}
                      </span>
                      {/* Availability toggle */}
                      <button type="button"
                        onClick={() => onSetEditingAvailId(isEditing ? null : lec.id)}
                        title="Atur ketersediaan jam mengajar"
                        className="shrink-0 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition-all hover:brightness-110 active:scale-[0.95]"
                        style={{
                          background: isEditing ? "rgba(245,158,11,0.18)" : blockedCount > 0 ? "rgba(239,68,68,0.12)" : "var(--bg-overlay)",
                          border: `1px solid ${isEditing ? "rgba(245,158,11,0.4)" : blockedCount > 0 ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
                          color: isEditing ? "#fbbf24" : blockedCount > 0 ? "#f87171" : "var(--text-muted)",
                        }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {blockedCount > 0 ? `${N_SLOTS - blockedCount}/${N_SLOTS}` : "Jam"}
                      </button>
                      <button disabled={isBusy} onClick={() => onDeleteLecturer(lec.id)}
                        className="shrink-0 flex h-5 w-5 items-center justify-center rounded text-[10px] transition-all hover:bg-red-500/20 hover:text-red-400 active:scale-90"
                        style={{ color: "var(--text-muted)", opacity: isBusy ? 0.4 : 1 }}>✕</button>
                    </div>
                    {/* Availability grid (collapsible) */}
                    {isEditing && (
                      <div className="px-2 pb-2">
                        <AvailabilityGrid
                          unavailable={unavail}
                          onToggle={(slot) => onToggleSlot(lec.id, slot)} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Mata Kuliah ── */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>
            Mata Kuliah ({courses.length})
          </p>

          <div className="flex flex-col gap-1.5">
            <input disabled={isBusy} value={newCourseName}
              onChange={(e) => onNewCourseNameChange(e.target.value)}
              placeholder="Nama mata kuliah…"
              className="w-full rounded-lg px-2.5 py-1.5 text-[12px]"
              style={inputStyle} />
            <div className="flex gap-1.5">
              <select disabled={isBusy} value={newCourseSks}
                onChange={(e) => onNewCourseSksChange(Number(e.target.value))}
                className="rounded-lg px-2 py-1.5 text-[12px]" style={{ ...inputStyle, width: 72 }}>
                {[1, 2, 3, 4, 6].map((n) => <option key={n} value={n}>{n} SKS</option>)}
              </select>
              <select disabled={isBusy || lecturers.length === 0}
                value={newCourseLecturerId}
                onChange={(e) => onNewCourseLecturerIdChange(e.target.value)}
                className="flex-1 min-w-0 rounded-lg px-2 py-1.5 text-[12px]"
                style={inputStyle}>
                {lecturers.length === 0
                  ? <option value="">— tambah dosen dulu —</option>
                  : lecturers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <select disabled={isBusy} value={newCourseSemester ?? ""}
                onChange={(e) => onNewCourseSemesterChange(e.target.value ? Number(e.target.value) : null)}
                className="rounded-lg px-2 py-1.5 text-[12px]" style={{ ...inputStyle, width: 72 }}>
                <option value="">Sem —</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>Sem {n}</option>)}
              </select>
            </div>
            <button disabled={isBusy || !newCourseName.trim() || !newCourseLecturerId}
              onClick={onAddCourse}
              className="w-full rounded-lg py-1.5 text-[12px] font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: "rgba(220,38,38,0.15)", color: "var(--primary-light)",
                border: "1px solid rgba(220,38,38,0.3)",
                opacity: isBusy || !newCourseName.trim() || !newCourseLecturerId ? 0.4 : 1,
                cursor: isBusy || !newCourseName.trim() || !newCourseLecturerId ? "not-allowed" : "pointer",
              }}>+ Tambah Mata Kuliah</button>
          </div>

          {courses.length > 0 && (
            <div className="flex flex-col gap-1">
              {courses.map((c) => {
                const lecIdx = lecturers.findIndex((l) => l.id === c.lecturer_id);
                const palette = LECTURER_PALETTE[(lecIdx >= 0 ? lecIdx : 0) % LECTURER_PALETTE.length]!;
                return (
                  <div key={c.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                    style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: palette.text }} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[11px] font-medium" style={{ color: "var(--text-base)" }}>{c.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {c.sks} SKS{c.semester ? ` · Sem ${c.semester}` : ""}
                      </p>
                    </div>
                    <button disabled={isBusy} onClick={() => onDeleteCourse(c.id)}
                      className="shrink-0 flex h-5 w-5 items-center justify-center rounded text-[10px] transition-all hover:bg-red-500/20 hover:text-red-400 active:scale-90"
                      style={{ color: "var(--text-muted)", opacity: isBusy ? 0.4 : 1 }}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Action buttons ── */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            {/* Pulse ring when solve is ready */}
            {canSolve && !isBusy && (
              <span className="pointer-events-none absolute inset-0 rounded-lg animate-pulse-soft"
                style={{ boxShadow: "0 0 0 3px rgba(220,38,38,0.25)" }} />
            )}
            <button disabled={!canSolve} onClick={onSolve}
              className="relative w-full rounded-lg py-2.5 text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: canSolve
                  ? "linear-gradient(135deg, var(--primary), var(--primary-dark))"
                  : "var(--bg-overlay)",
                color: canSolve ? "#fff" : "var(--text-muted)",
                cursor: canSolve ? "pointer" : "not-allowed",
                boxShadow: canSolve ? "0 4px 14px rgba(220,38,38,0.4)" : "none",
              }}>
              {isBusy ? "Menjadwalkan…" : "Jadwalkan Otomatis"}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={onReset}
              className="flex-1 rounded-lg py-1.5 text-xs font-medium transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ background: "var(--bg-raised)", color: "var(--text-subtle)", border: "1px solid var(--border)" }}>
              Reset Jadwal
            </button>
            <button onClick={onClearAll}
              className="flex-1 rounded-lg py-1.5 text-xs font-medium transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ background: "var(--bg-raised)", color: "var(--text-subtle)", border: "1px solid var(--border)" }}>
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

  const [presetDept, setPresetDept] = useState<"IF" | "MA">("IF");
  const [lecturerAvailability, setLecturerAvailability] = useState<Map<string, Set<number>>>(new Map());
  const [editingAvailId, setEditingAvailId] = useState<string | null>(null);

  const [newLecturerName,     setNewLecturerName]     = useState("");
  const [newCourseName,       setNewCourseName]       = useState("");
  const [newCourseSks,        setNewCourseSks]        = useState(3);
  const [newCourseLecturerId, setNewCourseLecturerId] = useState("");
  const [newCourseSemester,   setNewCourseSemester]   = useState<number | null>(null);

  const [lines, setLines] = useState<ConsoleLine[]>([
    { type: "info",  text: "Timetabling siap." },
    { type: "muted", text: "Pilih preset atau tambah dosen & mata kuliah, lalu tekan Jadwalkan Otomatis." },
  ]);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function appendLine(line: ConsoleLine) { setLines((prev) => [...prev, line]); }

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  const lecturerColorMap = new Map(lecturers.map((l, i) => [l.id, i]));

  /* ── Handlers ── */
  function handleAddLecturer() {
    const name = newLecturerName.trim();
    if (!name) return;
    setLecturers((prev) => [...prev, { id: genId(), name }]);
    setNewLecturerName("");
  }

  function handleDeleteLecturer(id: string) {
    setLecturers((prev) => prev.filter((l) => l.id !== id));
    setCourses((prev) => prev.filter((c) => c.lecturer_id !== id));
    setLecturerAvailability((prev) => { const n = new Map(prev); n.delete(id); return n; });
    if (editingAvailId === id) setEditingAvailId(null);
  }

  function handleAddCourse() {
    const name = newCourseName.trim();
    if (!name || !newCourseLecturerId) return;
    setCourses((prev) => [...prev, { id: genId(), name, sks: newCourseSks, lecturer_id: newCourseLecturerId, semester: newCourseSemester }]);
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
    setEditingAvailId(null);
    const lecs = presetDept === "IF" ? IF_LECTURERS_CLEAN : MA_LECTURERS;
    setLecturerAvailability(
      new Map(presetDept === "IF" ? IF_DEFAULT_AVAILABILITY : MA_DEFAULT_AVAILABILITY)
    );
    const crs  = presetDept === "IF" ? IF_COURSES : MA_COURSES;
    setLecturers(lecs);
    setCourses(crs);
    setSchedule([]);
    setVisibleIds(new Set());
    setNewCourseLecturerId(lecs[0]?.id ?? "");
    setLines([
      { type: "info",  text: `Data ${presetDept} ITB dimuat.` },
      { type: "muted", text: `${lecs.length} dosen · ${crs.length} mata kuliah` },
      { type: "muted", text: "Atur ketersediaan dosen (ikon kalender), lalu tekan Jadwalkan Otomatis." },
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
    setLecturerAvailability(new Map());
    setEditingAvailId(null);
    setNewCourseLecturerId("");
    setLines([
      { type: "info",  text: "Timetabling siap." },
      { type: "muted", text: "Tambah dosen & mata kuliah, atau muat data contoh." },
    ]);
  }

  function handleToggleSlot(lecturerId: string, slot: number) {
    setLecturerAvailability((prev) => {
      const next = new Map(prev);
      const set  = new Set(next.get(lecturerId) ?? []);
      if (set.has(slot)) set.delete(slot); else set.add(slot);
      next.set(lecturerId, set);
      return next;
    });
  }

  async function handleSolve() {
    if (courses.length < 2 || isBusy) return;

    clearTimers();
    setSchedule([]);
    setVisibleIds(new Set());
    setIsBusy(true);

    const totalBlocked = [...lecturerAvailability.values()].reduce((s, v) => s + v.size, 0);
    setLines([
      { type: "info",  text: "Algoritma : DSATUR (Graph Coloring)" },
      { type: "muted", text: `${courses.length} mata kuliah · ${lecturers.length} dosen` },
      ...(totalBlocked > 0 ? [{ type: "muted" as const, text: `Slot diblokir: ${totalBlocked} (ketersediaan dosen)` }] : []),
      { type: "muted", text: "─────────────────────────────" },
    ]);

    try {
      const lecturersPayload: Lecturer[] = lecturers.map((l) => ({
        ...l,
        unavailable_slots: [...(lecturerAvailability.get(l.id) ?? new Set<number>())],
      }));

      const res = await solveTimetabling(courses, lecturersPayload, "dsatur");

      // Index schedule by course_id for slot2 lookup during animation
      const scheduleMap = new Map(res.schedule.map((e) => [e.course_id, e]));

      setSchedule(res.schedule);
      appendLine({ type: "muted", text: `Conflict edges  : ${res.conflict_edges}` });
      appendLine({ type: "muted", text: `Slot digunakan  : ${res.total_slots_used} dari ${N_SLOTS} tersedia` });
      appendLine({ type: "muted", text: "─────────────────────────────" });

      res.steps.forEach((step, i) => {
        const t = setTimeout(() => {
          setVisibleIds((prev) => { const n = new Set(prev); n.add(step.course_id); return n; });
          const entry = scheduleMap.get(step.course_id);
          let slotText = `${step.slot_day} Sesi ${step.slot_period}`;
          if (entry?.slot2_day && entry.slot2_period != null) {
            slotText += ` + ${entry.slot2_day} Sesi ${entry.slot2_period}`;
          }
          setLines((prev) => [...prev, {
            type: "output",
            text: `${step.course_name} → ${slotText}`,
          }]);
          if (i === res.steps.length - 1) {
            setLines((prev) => [
              ...prev,
              { type: "muted", text: "─────────────────────────────" },
              { type: "info",  text: `Penjadwalan selesai! ${res.schedule.length} mata kuliah dijadwalkan.` },
            ]);
            setIsBusy(false);
          }
        }, i * 400);
        timersRef.current.push(t);
      });
    } catch (err) {
      appendLine({ type: "error", text: `Error: ${String(err)}` });
      setIsBusy(false);
    }
  }

  const canSolve = courses.length >= 2 && lecturers.length >= 1 && !isBusy;

  const sidebarProps = {
    lecturers, courses, isBusy, canSolve,
    presetDept, lecturerAvailability, editingAvailId,
    newLecturerName, newCourseName, newCourseSks, newCourseLecturerId, newCourseSemester,
    onPresetDeptChange:           setPresetDept,
    onNewLecturerNameChange:      setNewLecturerName,
    onNewCourseNameChange:        setNewCourseName,
    onNewCourseSksChange:         setNewCourseSks,
    onNewCourseLecturerIdChange:  (v: string) => setNewCourseLecturerId(v),
    onNewCourseSemesterChange:    setNewCourseSemester,
    onAddLecturer:      handleAddLecturer,
    onDeleteLecturer:   handleDeleteLecturer,
    onAddCourse:        handleAddCourse,
    onDeleteCourse:     handleDeleteCourse,
    onLoadPreset:       handleLoadPreset,
    onSolve:            handleSolve,
    onReset:            handleReset,
    onClearAll:         handleClearAll,
    onToggleSlot:       handleToggleSlot,
    onSetEditingAvailId: setEditingAvailId,
  };

  return (
    <div className="relative flex h-full overflow-hidden">

      {/* ── Main: Timetable + Console ── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Timetable area */}
        <div className="bg-dot-grid relative flex-1 overflow-hidden">
          {/* Radial ambient glow */}
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(245,158,11,0.07) 0%, transparent 70%)" }} />
          {schedule.length === 0 ? (
            <div className="flex h-full items-center justify-center px-8 text-center">
              <div className="animate-fade-in flex flex-col items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24" }}>
                  ▦
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-base)" }}>Belum ada jadwal</p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    Muat data contoh atau tambah dosen & mata kuliah,<br />lalu tekan Jadwalkan Otomatis
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 overflow-auto p-4">
              {/* Stats bar */}
              <div className="mb-3 flex items-center gap-4 flex-wrap">
                <span className="rounded-lg px-3 py-1 text-[11px] font-semibold"
                  style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)", color: "var(--primary-light)" }}>
                  {schedule.length} Mata Kuliah
                </span>
                <span className="rounded-lg px-3 py-1 text-[11px] font-semibold"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
                  {new Set(schedule.map((e) => `${e.slot_day}|${e.slot_period}`)).size} Slot Dipakai
                </span>
                <span className="rounded-lg px-3 py-1 text-[11px] font-semibold"
                  style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa" }}>
                  DSATUR
                </span>
              </div>
              <TimetableGrid schedule={schedule} visibleIds={visibleIds} lecturerColorMap={lecturerColorMap} />
            </div>
          )}
        </div>

        <ConsolePanel lines={lines} />
      </main>

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex h-full">
        <TimetablingSidebar {...sidebarProps} />
      </div>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40"
            style={{ top: "var(--navbar-h)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setDrawerOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 right-0 z-50 overflow-y-auto"
            style={{ top: "var(--navbar-h)", width: "min(320px, 90vw)", animation: "slideInRight 0.25s cubic-bezier(0.16,1,0.3,1) forwards" }}>
            <TimetablingSidebar {...sidebarProps} onClose={() => setDrawerOpen(false)} />
          </aside>
        </>
      )}

      {/* ── Mobile toggle button ── */}
      {!drawerOpen && (
        <button type="button" onClick={() => setDrawerOpen(true)}
          className="lg:hidden fixed bottom-6 right-5 z-30 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", boxShadow: "0 4px 20px rgba(220,38,38,0.5)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="15" y2="18" />
          </svg>
          Kontrol
        </button>
      )}

    </div>
  );
}
