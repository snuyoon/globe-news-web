// Supabase Edge Function: AI Prompter
// 배포: supabase functions deploy ai-prompter --project-ref bjdlyjeltwjukuthxkti
// 환경변수: supabase secrets set ANTHROPIC_API_KEY=sk-...

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ImpactItem {
  ticker: string;
  level: "상" | "중" | "하";
  summary: string;
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 1. 인증
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "인증이 필요합니다." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "유효하지 않은 인증 토큰입니다." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Ultra 등급 확인
    const { data: subscriber } = await supabaseAdmin
      .from("subscribers")
      .select("payment_status")
      .eq("user_id", user.id)
      .maybeSingle();

    const isAdmin = user.email === "snuyoon@snu.ac.kr";
    const isUltra = subscriber?.payment_status === "ultra";

    if (!isAdmin && !isUltra) {
      return new Response(
        JSON.stringify({ error: "Ultra 구독자만 AI 프롬프터를 사용할 수 있습니다." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. 요청 파싱
    const { newsId, newsText, tickers } = await req.json();
    if (!newsText || !tickers || tickers.length === 0) {
      return new Response(
        JSON.stringify({ error: "newsText와 tickers는 필수입니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Claude API 호출
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "서버 설정 오류: API 키 누락" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt =
      "너는 미국 주식 시장 분석가다. 사용자의 포트폴리오 종목과 뉴스를 교차 분석하여 영향도를 평가해라.";

    const userPrompt = `뉴스: ${newsText}

보유 종목: ${tickers.join(", ")}

각 종목에 대해 이 뉴스의 영향을 분석해줘. 형식: 종목별로 [영향도: 상/중/하] + 한 줄 분석 + 주의점

반드시 아래 JSON 형식으로만 응답해. 다른 텍스트 없이 순수 JSON만:
{
  "analysis": "전체 종합 분석 (2~3문장)",
  "impacts": [
    { "ticker": "종목코드", "level": "상/중/하", "summary": "한 줄 분석 + 주의점" }
  ]
}`;

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!claudeResponse.ok) {
      const errBody = await claudeResponse.text();
      console.error("Claude API error:", errBody);
      return new Response(
        JSON.stringify({ error: "AI 분석 중 오류가 발생했습니다." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const claudeData = await claudeResponse.json();
    const rawText = claudeData.content?.[0]?.text || "";

    // 5. 응답 파싱
    let parsed: { analysis: string; impacts: ImpactItem[] };
    try {
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/) || rawText.match(/(\{[\s\S]*\})/);
      parsed = JSON.parse(jsonMatch?.[1] || rawText);
    } catch {
      parsed = {
        analysis: rawText,
        impacts: tickers.map((t: string) => ({
          ticker: t,
          level: "중" as const,
          summary: "분석 결과를 파싱할 수 없습니다.",
        })),
      };
    }

    return new Response(
      JSON.stringify({ analysis: parsed.analysis, impacts: parsed.impacts, newsId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI Prompter error:", error);
    return new Response(
      JSON.stringify({ error: "AI 분석 중 오류가 발생했습니다." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
