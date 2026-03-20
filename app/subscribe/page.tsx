import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "VIP 멤버십 - US속보",
  description:
    "US속보 VIP 멤버십. 실시간 긴급 알림, 주말 특별판, 어닝 캘린더 등 프리미엄 혜택을 만나보세요.",
};

/* ── 혜택 카드 데이터 ── */
const BENEFITS = [
  {
    emoji: "\u26A1",
    title: "실시간 미국 금융 속보",
    desc: "24시간 쉬지 않는 AI 뉴스봇이 중요 이슈를 즉시 X/Threads로 발행합니다.",
    cycle: "실시간",
  },
  {
    emoji: "\u2600\uFE0F",
    title: "모닝 브리핑 카드뉴스",
    desc: "매일 08:30, 어젯밤 미국 시장 결과를 카드뉴스로 한눈에 정리해 드립니다.",
    cycle: "매일 08:30",
  },
  {
    emoji: "\uD83C\uDF19",
    title: "장전 브리핑 카드뉴스",
    desc: "매일 22:00, 오늘 밤 체크해야 할 핵심 포인트를 미리 알려드립니다.",
    cycle: "매일 22:00",
  },
  {
    emoji: "\uD83D\uDCDA",
    title: "주말 특별판 카드뉴스",
    desc: "매주 토요일, 한 주간 핵심 주제를 깊이 분석한 프리미엄 카드뉴스를 발행합니다.",
    cycle: "매주 토요일",
    vip: true,
  },
  {
    emoji: "🗳️",
    title: "주말 카드뉴스 주제 투표",
    desc: "선착순 100명이 매주 주제를 신청하고, 가장 많이 나온 주제로 주말 특별판을 제작합니다. 내 캐릭터가 직접 설명!",
    cycle: "매주",
    vip: true,
  },
  {
    emoji: "\uD83D\uDCC5",
    title: "주간 경제 일정표",
    desc: "CPI, FOMC, 고용지표 등 이번 주 주요 경제 이벤트를 매주 월요일 정리해 발송합니다.",
    cycle: "매주 월요일",
    vip: true,
  },
  {
    emoji: "\uD83D\uDCC8",
    title: "어닝 시즌 캘린더",
    desc: "AAPL, NVDA, TSLA 등 주요 종목 실적 발표 일정을 한눈에 볼 수 있는 캘린더를 제공합니다.",
    cycle: "분기별",
    vip: true,
  },
  {
    emoji: "\uD83C\uDFAC",
    title: "VIP 좌석 + 나만의 캐릭터",
    desc: "홈페이지 극장에 나만의 캐릭터가 앉아있는 특별한 경험. VIP 멤버만의 특권입니다.",
    cycle: "구독 즉시",
    vip: true,
  },
];

/* ── 비교 테이블 데이터 ── */
const COMPARE = [
  { feature: "실시간 속보 (X/Threads)", free: true, vip: true },
  { feature: "모닝/장전 브리핑 (X)", free: true, vip: true },
  { feature: "카드뉴스 (인스타그램)", free: true, vip: true },
  { feature: "주말 특별판 카드뉴스", free: false, vip: true },
  { feature: "주제 투표 (가장 많은 주제로 제작)", free: false, vip: true },
  { feature: "주간 경제 일정표", free: false, vip: true },
  { feature: "어닝 시즌 캘린더", free: false, vip: true },
  { feature: "VIP 좌석 + 캐릭터", free: false, vip: true },
];

/* ── FAQ 데이터 ── */
const FAQS = [
  {
    q: "해지하면 어떻게 되나요?",
    a: "해지 즉시 다음 결제일부터 요금이 청구되지 않으며, 남은 기간까지는 VIP 혜택을 계속 이용할 수 있습니다. 주말 특별판과 VIP 전용 콘텐츠 접근이 중단됩니다.",
  },
  {
    q: "선착순 100명이 다 차면?",
    a: "100명이 모두 차면 월 4,990원 평생 가격은 종료되고, 이후 가입자는 정가 9,900원이 적용됩니다. 이미 가입한 분은 해지 전까지 평생 4,990원으로 유지됩니다.",
  },
  {
    q: "어떤 플랫폼으로 받나요?",
    a: "실시간 속보는 X(트위터)와 Threads, 카드뉴스는 인스타그램으로 제공됩니다. 주간 경제 일정표와 어닝 캘린더는 카드뉴스 형태로 발행됩니다.",
  },
  {
    q: "환불이 가능한가요?",
    a: "첫 7일 내 불만족 시 전액 환불해 드립니다. 카카오톡 또는 이메일로 요청해 주세요.",
  },
  {
    q: "결제 수단은 무엇인가요?",
    a: "신용카드, 체크카드, 카카오페이 등 주요 결제 수단을 지원합니다.",
  },
];

export default function SubscribePage() {
  return (
    <div className="min-h-screen">
      {/* ════════ 히어로 ════════ */}
      <section className="relative overflow-hidden">
        {/* 배경 패턴 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(240,185,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(240,185,11,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0b90b]/5 via-transparent to-transparent" />

        <div className="relative max-w-3xl mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--red)]/15 border border-[var(--red)]/30 mb-5">
            <span className="live-dot w-2 h-2 rounded-full bg-[var(--red)] inline-block" />
            <span className="text-[12px] text-[var(--red)] font-bold">
              선착순 100명 한정
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-3">
            US속보{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
              VIP 멤버십
            </span>
          </h1>
          <p className="text-[16px] md:text-[18px] text-[var(--text-muted)] leading-relaxed mb-8">
            시장보다 한 발 앞서세요
          </p>

          {/* 가격 */}
          <div className="inline-flex flex-col items-center gap-1 mb-8">
            <span className="text-[14px] text-[var(--text-muted)] line-through">
              9,900원/월
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
                4,990
              </span>
              <span className="text-[16px] text-[var(--text-muted)] font-medium">
                원/월
              </span>
            </div>
            <span className="text-[12px] text-[#f0b90b] font-semibold mt-1">
              평생 이 가격으로 유지
            </span>
          </div>

          <div>
            <a
              href="/"
              className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black font-bold text-[16px] hover:opacity-90 transition-opacity shadow-lg shadow-[#f0b90b]/20"
            >
              지금 시작하기
            </a>
          </div>
        </div>
      </section>

      {/* ════════ 혜택 카드 그리드 ════════ */}
      <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-3">
          VIP 멤버가 받는 혜택
        </h2>
        <p className="text-[14px] text-[var(--text-muted)] text-center mb-10">
          매일, 매주, 실시간으로 쉬지 않고 전달합니다
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className={`relative rounded-2xl border p-5 transition-colors ${
                b.vip
                  ? "border-[#f0b90b]/30 bg-gradient-to-b from-[#f0b90b]/5 to-[var(--card)] hover:border-[#f0b90b]/50"
                  : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border)]"
              }`}
            >
              {b.vip && (
                <span className="absolute top-3 right-3 text-[10px] font-bold text-[#f0b90b] bg-[#f0b90b]/10 px-2 py-0.5 rounded-full">
                  VIP
                </span>
              )}
              <div className="text-3xl mb-3">{b.emoji}</div>
              <h3 className="text-[15px] font-bold mb-1.5">{b.title}</h3>
              <p className="text-[13px] text-[var(--text-muted)] leading-relaxed mb-3">
                {b.desc}
              </p>
              <span className="inline-block text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--bg)] px-2 py-0.5 rounded-full">
                {b.cycle}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ 비교 테이블 ════════ */}
      <section className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-3">
          무료 vs VIP 비교
        </h2>
        <p className="text-[14px] text-[var(--text-muted)] text-center mb-10">
          무료로도 충분하지만, VIP는 차원이 다릅니다
        </p>

        <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--card)]">
                <th className="px-4 md:px-6 py-3 text-[13px] font-bold text-[var(--text-muted)]">
                  기능
                </th>
                <th className="px-4 md:px-6 py-3 text-[13px] font-bold text-[var(--text-muted)] text-center w-20">
                  무료
                </th>
                <th className="px-4 md:px-6 py-3 text-[13px] font-bold text-center w-20">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
                    VIP
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, i) => (
                <tr
                  key={row.feature}
                  className={
                    i % 2 === 0
                      ? "bg-[var(--bg)]"
                      : "bg-[var(--card)]/50"
                  }
                >
                  <td className="px-4 md:px-6 py-3 text-[13px] md:text-[14px]">
                    {row.feature}
                  </td>
                  <td className="px-4 md:px-6 py-3 text-center text-[16px]">
                    {row.free ? (
                      <span className="text-[var(--green)]">&#10003;</span>
                    ) : (
                      <span className="text-[var(--text-muted)] opacity-30">
                        &#8212;
                      </span>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-3 text-center text-[16px]">
                    <span className="text-[#f0b90b]">&#10003;</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10">
          자주 묻는 질문
        </h2>

        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <h3 className="text-[15px] font-bold mb-2">Q. {faq.q}</h3>
              <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ 최종 CTA ════════ */}
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-20">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f0b90b]/15 via-[var(--card)] to-[#ef6d09]/10" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(240,185,11,0.5) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative px-6 py-14 md:px-12 md:py-20 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
              결제하러 갈까요?
            </h2>
            <p className="text-[15px] text-[var(--text-muted)] mb-4 max-w-md mx-auto">
              좌석을 선택하고 나만의 캐릭터를 만들어 보세요.
              <br />
              VIP 멤버만의 특별한 자리가 기다리고 있습니다.
            </p>
            <div className="inline-flex items-baseline gap-2 mb-8">
              <span className="text-[14px] text-[var(--text-muted)] line-through">
                9,900원
              </span>
              <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
                4,990원
              </span>
              <span className="text-[14px] text-[var(--text-muted)]">/월</span>
            </div>
            <div>
              <a
                href="/"
                className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black font-bold text-[16px] hover:opacity-90 transition-opacity shadow-lg shadow-[#f0b90b]/20"
              >
                좌석 선택하고 구독하기
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
