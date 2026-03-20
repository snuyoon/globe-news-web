export default function SubscriptionCTA() {
  const spotsLeft = 73; // Hardcoded for now, make dynamic later

  return (
    <section id="subscribe" className="max-w-5xl mx-auto px-4 py-16">
      <div className="relative rounded-2xl overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0b90b]/15 via-[var(--card)] to-[#ef6d09]/10" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(240,185,11,0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative px-6 py-12 md:px-12 md:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--red)]/15 border border-[var(--red)]/30 mb-4">
            <span className="text-[12px] text-[var(--red)] font-bold">
              100명 중 {spotsLeft}자리 남음
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            시장보다 한 발 앞서세요
          </h2>
          <p className="text-[15px] text-[var(--text-muted)] mb-8 max-w-md mx-auto">
            AI가 선별한 미국 금융 속보를 실시간으로 받아보세요.
            시장을 움직이는 이벤트를 놓치지 마세요.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
            {[
              { icon: "bolt", text: "실시간 속보 알림" },
              { icon: "chart", text: "모닝 & 장전 브리핑" },
              { icon: "book", text: "주말 특별 교육 콘텐츠" },
            ].map((benefit) => (
              <div key={benefit.text} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-[var(--bg)]/50">
                <svg className="w-5 h-5 text-[#f0b90b]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[12px] text-[var(--text-muted)] text-center">{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black font-bold text-[15px] hover:opacity-90 transition-opacity"
            >
              구독하기 W4,999/월
            </a>
            <a
              href="#"
              className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)] text-[14px] font-medium hover:border-[#f0b90b]/50 hover:text-[var(--text)] transition-colors"
            >
              카카오톡 오픈채팅 참여
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
