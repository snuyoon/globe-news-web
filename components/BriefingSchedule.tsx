"use client";

import { useEffect, useState } from "react";

interface ScheduleItem {
  time: string;
  label: string;
  getStatus: (now: Date) => { text: string; icon: string; active: boolean };
}

const SCHEDULE: ScheduleItem[] = [
  {
    time: "08:30",
    label: "모닝 브리핑",
    getStatus: (now: Date) => {
      const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      const h = kst.getUTCHours();
      const m = kst.getUTCMinutes();
      const current = h * 60 + m;
      if (current >= 8 * 60 + 30) {
        return { text: "오늘 발행 완료", icon: "check", active: true };
      }
      return { text: "오전 중 발행 예정", icon: "clock", active: false };
    },
  },
  {
    time: "22:00",
    label: "장전 브리핑",
    getStatus: (now: Date) => {
      const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      const h = kst.getUTCHours();
      const m = kst.getUTCMinutes();
      const current = h * 60 + m;
      if (current >= 22 * 60) {
        return { text: "오늘 발행 완료", icon: "check", active: true };
      }
      return { text: "오늘 밤 발행 예정", icon: "clock", active: false };
    },
  },
  {
    time: "SAT",
    label: "주말 특별판",
    getStatus: (now: Date) => {
      const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      const day = kst.getUTCDay();
      if (day === 6) {
        return { text: "이번 주 발행 완료", icon: "check", active: true };
      }
      return { text: "다음 토요일 발행", icon: "calendar", active: false };
    },
  },
];

function StatusIcon({ type }: { type: string }) {
  if (type === "check") {
    return (
      <svg className="w-4 h-4 text-[var(--green)]" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  }
  if (type === "clock") {
    return (
      <svg className="w-4 h-4 text-[#f0b90b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export default function BriefingSchedule() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  return (
    <section id="briefing" className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#f0b90b] to-[#ef6d09]" />
        <h2 className="text-xl md:text-2xl font-bold">브리핑 일정</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {SCHEDULE.map((item) => {
          const status = item.getStatus(now);
          return (
            <div
              key={item.time}
              className={`relative rounded-xl border p-5 transition-colors ${
                status.active
                  ? "border-[var(--green)]/30 bg-[var(--green)]/5"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              <div className="text-2xl font-extrabold text-[var(--text)] mb-1">
                {item.time}
              </div>
              <div className="text-[14px] font-semibold text-[var(--text)] mb-3">
                {item.label}
              </div>
              <div className="flex items-center gap-1.5">
                <StatusIcon type={status.icon} />
                <span className="text-[12px] text-[var(--text-muted)]">{status.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
