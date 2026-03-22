// Supabase Edge Function: Portfolio
// 배포: supabase functions deploy portfolio --project-ref bjdlyjeltwjukuthxkti

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

async function authenticateUser(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { user: null, error: "인증이 필요합니다." };
  }
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return { user: null, error: "유효하지 않은 인증 토큰입니다." };
  }
  return { user, error: null };
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { user, error: authError } = await authenticateUser(req);
  if (!user) {
    return new Response(JSON.stringify({ error: authError }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // GET: 포트폴리오 조회
  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("user_portfolios")
      .select("tickers, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ error: "포트폴리오 조회 실패" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ tickers: data?.tickers ?? [], updated_at: data?.updated_at ?? null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // POST: 포트폴리오 저장/업데이트
  if (req.method === "POST") {
    const { tickers } = await req.json();

    if (!Array.isArray(tickers)) {
      return new Response(JSON.stringify({ error: "tickers는 배열이어야 합니다." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = [...new Set(tickers.map((t: string) => t.toUpperCase().trim()))].slice(0, 30);

    const { data, error } = await supabaseAdmin
      .from("user_portfolios")
      .upsert(
        { user_id: user.id, tickers: normalized, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      )
      .select("tickers, updated_at")
      .single();

    if (error) {
      console.error("Portfolio save error:", error);
      return new Response(JSON.stringify({ error: "포트폴리오 저장 실패" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ tickers: data.tickers, updated_at: data.updated_at }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
