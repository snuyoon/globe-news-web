# 보안 검토 보고서

**검토일:** 2026-03-20
**검토 대상:** globe-news-web (Next.js 16 + Supabase)
**검토자:** Claude

---

## 1. Supabase anon key 하드코딩 [심각도: 높음]

**파일:** `lib/supabase.ts` (3~5행)

Supabase URL과 anon key가 소스 코드에 직접 하드코딩되어 있으며, Git 저장소에 그대로 커밋됨.
`.env` 파일이 존재하지 않고, `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경변수를 사용하지 않음.

**영향:**
- anon key 자체는 클라이언트에서 사용하도록 설계되어 공개되어도 동작상 문제는 없으나, RLS가 제대로 설정되어 있어야 함 (아래 2번 참조).
- 키를 교체해야 할 때 코드를 수정하고 재배포해야 함.
- 소스 코드를 보는 누구나 Supabase 프로젝트 URL과 키를 알 수 있어 직접 API 호출 가능.

**권장 조치:**
- `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`로 이동.
- `.gitignore`에 `.env*` 추가.
- Vercel 환경변수로 설정.

---

## 2. RLS(Row Level Security) 정책 미확인 [심각도: 높음]

코드상에서 RLS 정책을 확인할 수 없으나, 아래 사용 패턴으로 볼 때 RLS가 충분히 설정되어 있지 않을 가능성이 높음:

- `TheaterSeats.tsx` (49행): `supabase.from("subscribers").select("seat_number, character_data, is_lucky, user_id")` -- 인증 없이 전체 구독자의 user_id를 조회.
- `NewsFeed.tsx` (50행): `supabase.from("news").select("*")` -- news 테이블 전체 컬럼 조회 (web_detail 포함).

**위험:**
- subscribers 테이블에 RLS가 없으면, anon key를 가진 누구나 이메일, 이름, user_id 등 개인정보에 접근 가능.
- 브라우저 개발자 도구에서 직접 Supabase REST API를 호출하여 `select("*")`로 모든 컬럼(이메일, 이름 등)을 조회할 수 있음.

**권장 조치:**
- subscribers 테이블: SELECT는 `seat_number, character_data, is_lucky` 컬럼만 anon에 허용. email, name, user_id는 본인(auth.uid() = user_id)만 읽기 허용.
- 관리자 조회가 필요하면 service_role key를 사용하는 서버사이드 API를 만들어야 함.

---

## 3. subscribers 테이블 다른 유저 데이터 접근 [심각도: 높음]

**파일:** `components/TheaterSeats.tsx` (49~51행)

`user_id`를 포함한 구독자 데이터를 인증 없이 전체 조회하고 있음. anon key로 직접 API 호출 시:
```
POST https://bjdlyjeltwjukuthxkti.supabase.co/rest/v1/subscribers?select=*
```
이렇게 하면 이메일, 이름, user_id, character_data, topic_request 등 모든 데이터를 읽을 수 있음 (RLS 미설정 시).

또한 `TheaterSeats.tsx` (129~138행)에서 INSERT 시 별도의 서버사이드 검증 없이 클라이언트에서 직접 삽입. 악의적 사용자가 다른 사람의 user_id로 가장하여 insert할 수 있음 (RLS 미설정 시).

**권장 조치:**
- RLS 활성화: INSERT는 `auth.uid() = user_id` 조건 필수.
- SELECT는 공개 필요 컬럼(seat_number, character_data, is_lucky)만 허용하는 정책 또는 View 사용.

---

## 4. news 테이블 공개 읽기 [심각도: 낮음]

news 테이블의 공개 읽기는 뉴스 서비스 특성상 적절함.
다만 `web_detail` 컬럼은 VIP 전용 콘텐츠인데, 클라이언트에서 `select("*")`로 전체 조회하고 프론트엔드에서만 blur 처리하고 있음.

**파일:** `components/NewsCard.tsx` (131~186행) -- blur CSS로 가리지만, 실제 데이터는 DOM에 존재.

**위험:**
- 비구독자가 개발자 도구로 blur를 제거하거나, 직접 API 호출로 web_detail을 읽을 수 있음.
- korean_text 본문도 마찬가지로 blur 처리만 되어 있어 실제 텍스트가 HTML에 포함됨.

**권장 조치:**
- 서버사이드에서 비구독자에게는 web_detail 컬럼을 제외하고 응답하도록 RLS 또는 Edge Function 구현.
- 또는 Next.js API Route(서버 컴포넌트)에서 구독 여부를 확인하고 데이터를 필터링.

---

## 5. XSS 위험 [심각도: 낮음]

`dangerouslySetInnerHTML` 사용 없음. React의 기본 이스케이핑이 적용되어 XSS 위험은 낮음.

사용자 입력이 렌더링되는 곳:
- `NewsCard.tsx`: `news.korean_text`, `news.web_detail` -- React 텍스트 노드로 렌더링 (안전)
- `TheaterSeats.tsx`: `data.initial`, `data.hoodieColor` -- SVG 속성 및 style에 사용됨
- `Navbar.tsx`: `user.user_metadata.full_name`, `user.email` -- 텍스트 노드 (안전)

**잠재적 위험:**
- `TheaterSeats.tsx`에서 `data.hoodieColor`가 inline style의 `backgroundColor`로 직접 사용됨. 이론적으로 CSS injection이 가능하나, React의 style 객체 처리 방식상 실질적 위험은 매우 낮음.

---

## 6. CORS 설정 [심각도: 정보]

- Next.js `output: "export"` (정적 빌드)이므로 서버사이드 CORS 설정은 해당 없음.
- Supabase의 CORS는 Supabase 대시보드에서 관리. 기본적으로 모든 origin을 허용하므로, 타 사이트에서 anon key를 이용한 API 호출이 가능.
- Vercel 배포 시 별도의 CORS 헤더 설정 없음.

**권장 조치:**
- Supabase 대시보드에서 허용 origin을 `https://globe-news-web.vercel.app`과 `http://localhost:3000`으로 제한.

---

## 7. API 키 노출 가능성 [심각도: 중간]

**확인된 키 노출:**
- `lib/supabase.ts`: Supabase anon key가 소스 코드에 평문 하드코딩.
- Git 히스토리에도 키가 남아있을 가능성 높음.

**확인된 안전 사항:**
- service_role key는 코드에 없음 (사용하지 않음).
- 별도의 API 키(OpenAI, Twitter 등)는 이 프로젝트에 없음.
- `.env` 파일 없음 (키가 환경변수에 분리되어 있지 않다는 의미이기도 함).

---

## 8. 관리자 인증 구현 [심각도: 중간]

**파일:** `components/AuthProvider.tsx` (7행, 36행)

관리자 판별이 클라이언트 사이드에서 이메일 문자열 비교(`user.email === "snuyoon@snu.ac.kr"`)로만 이루어짐.
관리자 페이지(`/admin`)의 데이터 조회도 클라이언트에서 anon key로 Supabase에 직접 쿼리.

**위험:**
- 관리자 페이지 자체는 프론트엔드에서 차단하지만, anon key로 subscribers 테이블을 직접 쿼리하면 누구나 같은 데이터를 얻을 수 있음.
- 관리자 권한 검증이 서버사이드에서 이루어지지 않음.

**권장 조치:**
- Supabase에 관리자 role을 설정하고, RLS 정책에서 `auth.jwt() ->> 'email' = 'snuyoon@snu.ac.kr'` 같은 조건으로 관리자 전용 데이터 접근을 서버사이드에서 제어.
- 또는 Edge Function / API Route를 통해 서버에서 관리자 인증 후 데이터 반환.

---

## 요약

| # | 이슈 | 심각도 | 상태 |
|---|------|--------|------|
| 1 | Supabase anon key 하드코딩 | 높음 | 미조치 |
| 2 | RLS 정책 미확인/미설정 가능성 | 높음 | 확인 필요 |
| 3 | subscribers 테이블 개인정보 노출 | 높음 | 미조치 |
| 4 | web_detail VIP 콘텐츠 프론트엔드만 보호 | 낮음 | 미조치 |
| 5 | XSS 위험 | 낮음 | 안전 (React 기본 보호) |
| 6 | CORS 설정 | 정보 | Supabase 대시보드 확인 필요 |
| 7 | API 키 Git 노출 | 중간 | 미조치 |
| 8 | 관리자 인증 클라이언트 전용 | 중간 | 미조치 |

**최우선 조치 권장:**
1. Supabase RLS 활성화 및 정책 설정 (subscribers 테이블)
2. anon key를 환경변수로 이동
3. VIP 콘텐츠(web_detail)를 서버사이드에서 필터링
