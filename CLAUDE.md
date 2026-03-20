# globe-news-web — US속보 홈페이지

## 스택
Next.js 16 + React 19 + TypeScript + Tailwind 4 + Supabase
배포: Vercel (Static Export), GitHub: snuyoon/globe-news-web

## 페이지
- `/` — 극장 좌석 100석 (프로모션 + 캐릭터 커스텀)
- `/news` — 실시간 속보 (2열 그리드, 필터, 모자이크)
- `/cardnews` — 카드뉴스 뷰어 (장전/모닝/주말)
- `/company` — 기업 뉴스 (준비 중)
- `/subscribe` — 구독 혜택 소개

## 인증
- Supabase Auth + Google OAuth
- AuthProvider.tsx에서 user, isAdmin, isSubscriber 관리
- 관리자: snuyoon@snu.ac.kr

## VIP 콘텐츠
- 비구독자: 뉴스 본문 blur + "구독하고 전체 내용 보기"
- 구독자: 전체 내용 + web_detail 상세 분석
- 카드뉴스/기업: VIP 잠금 모달

## Supabase 테이블
- `news`: 뉴스 데이터 (korean_text, web_detail, importance, theme 등)
- `subscribers`: 구독자 (user_id, seat_number, character_data, topic_request)

## 극장 좌석
- 100석, 순번 배정 (seatIdByOrder)
- 럭키넘버: 1, 7, 77, 100번째 평생 무료
- SVG 캐릭터: 후디색, 눈, 머리, 이니셜

## 배포
git push origin main → Vercel 자동 배포
