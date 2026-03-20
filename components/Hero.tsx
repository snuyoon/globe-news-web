export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(240,185,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(240,185,11,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f0b90b]/5 via-transparent to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left: Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0b90b]/10 border border-[#f0b90b]/20 mb-6">
              <span className="live-dot w-2 h-2 rounded-full bg-[var(--green)] inline-block" />
              <span className="text-[12px] text-[#f0b90b] font-semibold">LIVE</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
              AI가 선별한
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
                미국 금융 속보
              </span>
            </h1>
            <p className="mt-4 text-[15px] md:text-[17px] text-[var(--text-muted)] leading-relaxed max-w-lg mx-auto lg:mx-0">
              실시간 속보 &middot; 모닝 브리핑 08:30 &middot; 장전 브리핑 22:00
            </p>
          </div>

          {/* Right: Subscription CTA Card */}
          <div className="w-full max-w-sm shrink-0">
            <div className="rounded-2xl border border-[#f0b90b]/30 bg-gradient-to-b from-[#f0b90b]/10 to-[var(--card)] p-6 backdrop-blur">
              <div className="text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-[var(--red)]/20 text-[var(--red)] text-[12px] font-bold mb-3">
                  선착순 100명
                </span>
                <div className="text-3xl font-extrabold text-[var(--text)]">
                  W4,999
                  <span className="text-[14px] font-normal text-[var(--text-muted)]">/월</span>
                </div>
                <a
                  href="#subscribe"
                  className="mt-5 block w-full py-3 rounded-xl bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black font-bold text-[15px] hover:opacity-90 transition-opacity text-center"
                >
                  지금 구독하기
                </a>
                <ul className="mt-5 text-left space-y-2.5">
                  <li className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
                    <svg className="w-4 h-4 text-[var(--green)] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    실시간 속보 알림
                  </li>
                  <li className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
                    <svg className="w-4 h-4 text-[var(--green)] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    모닝/장전 카드뉴스
                  </li>
                  <li className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
                    <svg className="w-4 h-4 text-[var(--green)] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    주말 특별 교육 콘텐츠
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
