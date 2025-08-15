"use client";
import { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

export default function DurationText({
  duration,
  className = "flex items-center gap-1 ",
}: {
  duration?: number | string | null;
  className?: string;
}) {
  const [label, setLabel] = useState("-");

  useEffect(() => {
    setLabel(formatClock(toSeconds(duration)));
  }, [duration]);

  return (
    <span className={className}>
      <ClockIcon className="w-4 h-4" />
      <span>{label}</span>
    </span>
  );
}

function toSeconds(input?: number | string | null): number | null {
  if (input == null) return null;
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string") {
    const trimmed = input.trim().toLowerCase();
    const parts = trimmed.split(":");
    if (parts.length === 2 || parts.length === 3) {
      const nums = parts.map(Number);
      if (nums.every(Number.isFinite)) {
        if (parts.length === 2) {
          const [mm, ss] = nums;
          return mm * 60 + ss;
        }
        const [hh, mm, ss] = nums;
        return hh * 3600 + mm * 60 + ss;
      }
    }
    const minMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)$/);
    if (minMatch) return Math.round(parseFloat(minMatch[1]) * 60);
    if (!Number.isNaN(Number(trimmed))) {
      const n = Number(trimmed);
      return n >= 1000 ? n : Math.round(n * 60);
    }
  }
  return null;
}

function formatClock(secs?: number | null): string {
  if (secs == null || !Number.isFinite(secs) || secs <= 0) return "-";
  const total = Math.round(secs);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad2 = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
}
