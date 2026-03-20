"use client";

import { useState } from "react";
import NewsFeed from "./NewsFeed";
import BriefingTab from "./BriefingTab";

type Tab = "realtime" | "morning" | "premarket";

const TABS: { key: Tab; label: string }[] = [
  { key: "realtime", label: "실시간 속보" },
  { key: "morning", label: "모닝 브리핑" },
  { key: "premarket", label: "장전 브리핑" },
];

export default function ContentTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("realtime");

  return (
    <section id="news" className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#f0b90b] to-[#ef6d09]" />
        <h2 className="text-xl md:text-2xl font-bold">콘텐츠</h2>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--card)] border border-[var(--border)] mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-fit px-4 py-2 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black"
                : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        {activeTab === "realtime" && <NewsFeed />}
        {activeTab === "morning" && (
          <BriefingTab type="morning" time="08:30" />
        )}
        {activeTab === "premarket" && (
          <BriefingTab type="premarket" time="22:00" />
        )}
      </div>
    </section>
  );
}
