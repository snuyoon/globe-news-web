import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "요금제 비교 - US속보",
  description: "US속보 요금제 비교. Basic(무료) / Pro / Ultra. 4월 무료 체험 중, 5월 1일 정식 오픈!",
};

const PLANS = [
  {
    name: "Basic",
    price: "무료",
    priceNote: "",
    badge: "",
    cta: "무료로 시작하기",
    highlight: false,
    features: [
      { text: "실시간 속보 피드", detail: "제목만" },
      { text: "커뮤니티", detail: "읽기만" },
      { text: "XP / 레벨 / 리더보드", detail: "기본 적립" },
      { text: "데일리 체크인", detail: "기본 보너스" },
      { text: "포인트 상점", detail: "일부 아이템" },
    ],
    notIncluded: ["카드뉴스 브리핑", "상세 분석(web_detail)", "캐릭터 커스텀", "극장 좌석", "주제 투표권", "AI 프롬프터"],
  },
  {
    name: "Pro",
    price: "4,990",
    priceNote: "원/월",
    badge: "인기",
    cta: "무료 체험 중 — 자리 잡기",
    highlight: true,
    features: [
      { text: "실시간 속보 + 상세 분석", detail: "전문 + web_detail" },
      { text: "모닝/장전 브리핑 카드뉴스", detail: "매일 08:30 / 22:00" },
      { text: "주말 특별판 + 기업분석", detail: "매주" },
      { text: "커뮤니티 글/댓글/따봉", detail: "전체" },
      { text: "캐릭터 커스텀 + 극장 좌석", detail: "" },
      { text: "XP 1.5배 부스트", detail: "" },
      { text: "주제 투표권", detail: "주 1표" },
      { text: "포인트 상점 전체", detail: "" },
      { text: "광고 없음", detail: "" },
    ],
    notIncluded: ["AI 프롬프터", "매크로 보고서"],
  },
  {
    name: "Ultra",
    price: "14,900",
    priceNote: "원/월",
    badge: "5월 출시",
    cta: "5월 오픈 — 알림 받기",
    highlight: false,
    features: [
      { text: "Pro의 모든 기능", detail: "" },
      { text: "AI 프롬프터", detail: "월 30회 질문" },
      { text: "매크로 보고서", detail: "월 4회" },
      { text: "XP 2배 부스트", detail: "" },
      { text: "VIP석 (앞줄 고정)", detail: "" },
      { text: "주제 투표권 3표", detail: "영향력 3배" },
      { text: "매월 보너스 포인트", detail: "+100P" },
      { text: "피드백 최우선 반영", detail: "" },
    ],
    notIncluded: [],
  },
];

const FAQS = [
  { q: "4월 무료 체험은 어떻게 이용하나요?", a: "회원가입만 하면 4월 30일까지 모든 Pro 기능을 무료로 이용할 수 있습니다. 5월 1일부터 유료 전환되며, 사전에 안내 드립니다." },
  { q: "럭키넘버는 어떻게 정해지나요?", a: "5월 1일 구독 오픈 후, 결제 순서대로 번호가 부여됩니다. 1번째, 7번째, 77번째, 100번째 구독자가 평생 무료입니다." },
  { q: "해지하면 어떻게 되나요?", a: "해지 즉시 다음 결제일부터 요금이 청구되지 않으며, 남은 기간까지는 혜택을 계속 이용할 수 있습니다." },
  { q: "환불이 가능한가요?", a: "첫 7일 내 불만족 시 전액 환불해 드립니다." },
];

export default function SubscribePage() {
  return (
    <div className="min-h-screen">
      {/* ════════ 히어로 ════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0b90b]/5 via-transparent to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-10 md:pt-24 md:pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block animate-pulse" />
            <span className="text-[12px] text-[#22c55e] font-bold">
              4월 무료 체험 중
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-3">
            요금제{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
              비교
            </span>
          </h1>
          <p className="text-[16px] md:text-[18px] text-[var(--text-muted)] leading-relaxed mb-4">
            5월 1일 정식 오픈. 지금은 전부 무료로 체험하세요.
          </p>
          <p className="text-[13px] text-[var(--text-muted)]">
            어떤 요금제가 나한테 맞는지 미리 확인하고, 무료 체험 기간에 모든 기능을 써보세요.
          </p>
        </div>
      </section>

      {/* ════════ 3티어 비교 카드 ════════ */}
      <section className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-5 md:p-6 flex flex-col ${
                plan.highlight
                  ? "border-[#f0b90b]/50 bg-gradient-to-b from-[#f0b90b]/8 to-[var(--card)] scale-[1.02] shadow-lg shadow-[#f0b90b]/10"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              {plan.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full ${
                  plan.badge === "인기"
                    ? "bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black"
                    : "bg-[var(--bg)] text-[#f0b90b] border border-[#f0b90b]/30"
                }`}>
                  {plan.badge}
                </span>
              )}

              <h3 className="text-lg font-extrabold mb-1 mt-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className={`text-3xl font-extrabold ${plan.highlight ? "text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]" : ""}`}>
                  {plan.price}
                </span>
                {plan.priceNote && <span className="text-sm text-[var(--text-muted)]">{plan.priceNote}</span>}
              </div>

              <div className="flex-1 space-y-2 mb-5">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-[13px]">
                    <span className="text-[#22c55e] mt-0.5 flex-shrink-0">&#10003;</span>
                    <span>
                      {f.text}
                      {f.detail && <span className="text-[var(--text-muted)]"> · {f.detail}</span>}
                    </span>
                  </div>
                ))}
                {plan.notIncluded.map((f, i) => (
                  <div key={`no-${i}`} className="flex items-start gap-2 text-[13px] text-[var(--text-muted)] opacity-40">
                    <span className="mt-0.5 flex-shrink-0">&#8212;</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <a
                href="/"
                className={`block text-center py-3 rounded-xl font-bold text-[14px] transition-opacity hover:opacity-90 ${
                  plan.highlight
                    ? "bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black"
                    : "bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ 럭키넘버 이벤트 ════════ */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-2xl border border-[#f0b90b]/30 bg-gradient-to-r from-[#f0b90b]/5 to-[#ef6d09]/5 p-6 md:p-8 text-center">
          <p className="text-3xl mb-3">&#127920;</p>
          <h2 className="text-xl md:text-2xl font-extrabold mb-2">럭키넘버 이벤트</h2>
          <p className="text-[15px] text-[var(--text-muted)] mb-4">
            5월 1일 구독 오픈!<br />
            <strong className="text-[#f0b90b]">1번째 · 7번째 · 77번째 · 100번째</strong> 구독자는<br />
            <strong>Pro 요금제 평생 무료.</strong>
          </p>
          <p className="text-[12px] text-[var(--text-muted)]">
            좌석 번호가 곧 순번. 네가 몇 번째인지는 가입해봐야 알 수 있어.
          </p>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <h2 className="text-2xl font-extrabold text-center mb-8">자주 묻는 질문</h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <div key={faq.q} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <h3 className="text-[14px] font-bold mb-1.5">Q. {faq.q}</h3>
              <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ 최종 CTA ════════ */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <div className="rounded-2xl bg-gradient-to-br from-[#f0b90b]/10 via-[var(--card)] to-[#ef6d09]/5 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            4월은 전부 무료
          </h2>
          <p className="text-[15px] text-[var(--text-muted)] mb-6">
            지금 가입하면 모든 프리미엄 기능을 무료로 체험할 수 있어요.
          </p>
          <a
            href="/"
            className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black font-bold text-[16px] hover:opacity-90 transition-opacity shadow-lg shadow-[#f0b90b]/20"
          >
            무료로 체험하기
          </a>
          <p className="text-[11px] text-[var(--text-muted)] mt-3">
            5월 1일 정식 오픈 · 선착순 100석 · 럭키넘버 평생 무료
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
