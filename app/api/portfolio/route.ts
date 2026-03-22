import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bjdlyjeltwjukuthxkti.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { user: null, error: "인증이 필요합니다." };
  }
  const token = authHeader.replace("Bearer ", "");
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return { user: null, error: "유효하지 않은 인증 토큰입니다." };
  }
  return { user, error: null };
}

// GET: 현재 사용자 포트폴리오 조회
export async function GET(request: NextRequest) {
  const { user, error } = await authenticateUser(request);
  if (!user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error: dbError } = await supabaseAdmin
    .from("user_portfolios")
    .select("tickers, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (dbError) {
    return NextResponse.json({ error: "포트폴리오 조회 실패" }, { status: 500 });
  }

  return NextResponse.json({
    tickers: data?.tickers ?? [],
    updated_at: data?.updated_at ?? null,
  });
}

// POST: 포트폴리오 저장/업데이트
export async function POST(request: NextRequest) {
  const { user, error } = await authenticateUser(request);
  if (!user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const body = await request.json();
  const { tickers } = body as { tickers: string[] };

  if (!Array.isArray(tickers)) {
    return NextResponse.json({ error: "tickers는 배열이어야 합니다." }, { status: 400 });
  }

  // 대문자 정규화, 중복 제거, 최대 30종목
  const normalized = [...new Set(tickers.map((t: string) => t.toUpperCase().trim()))].slice(0, 30);

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error: dbError } = await supabaseAdmin
    .from("user_portfolios")
    .upsert(
      { user_id: user.id, tickers: normalized, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select("tickers, updated_at")
    .single();

  if (dbError) {
    console.error("Portfolio save error:", dbError);
    return NextResponse.json({ error: "포트폴리오 저장 실패" }, { status: 500 });
  }

  return NextResponse.json({
    tickers: data.tickers,
    updated_at: data.updated_at,
  });
}
