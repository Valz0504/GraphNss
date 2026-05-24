import type { Metadata } from "next";
import TimetablingShell from "@/components/timetabling/TimetablingShell";

export const metadata: Metadata = { title: "Timetabling" };

export default function TimetablingPage() {
  return <TimetablingShell />;
}
