import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bjdlyjeltwjukuthxkti.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface ImpactItem {
  ticker: string;
  level: "상" | "중" | "하";
  summary: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authorization 헤더에서 JWT 추출
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    // 2. Supabase로 사용자 인증 확인
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "유효하지 않은 인증 토큰입니다." }, { status: 401 });
    }

    // 3. 구독자 등급 확인 (Ultra만 허용)
    const { data: subscriber } = await supabaseAdmin
      .from("subscribers")
      .select("payment_status")
      .eq("user_id", user.id)
      .maybeSingle();

    const isAdmin = user.email === "snuyoon@snu.ac.kr";
    const isUltra = subscriber?.payment_status === "ultra";

    if (!isAdmin && !isUltra) {
      return NextResponse.json(
        { error: "Ultra 구독자만 AI 프롬프터를 사용할 수 있습니다." },
        { status: 403 }
      );
    }

    // 4. 요청 바디 파싱
    const body = await request.json();
    const { newsId, newsText, tickers } = body as {
      newsId: string;
      newsText: string;
      tickers: string[];
    };

    if (!newsText || !tickers || tickers.length === 0) {
      return NextResponse.json(
        { error: "newsText와 tickers는 필수입니다." },
        { status: 400 }
      );
    }

    // 5. Claude Sonnet API 호출
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

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

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    // 6. 응답 파싱
    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let parsed: { analysis: string; impacts: ImpactItem[] };
    try {
      // JSON 블록 추출 (```json ... ``` 또는 순수 JSON)
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/) || rawText.match(/(\{[\s\S]*\})/);
      parsed = JSON.parse(jsonMatch?.[1] || rawText);
    } catch {
      // 파싱 실패 시 원문 텍스트 그대로 반환
      parsed = {
        analysis: rawText,
        impacts: tickers.map((t) => ({ ticker: t, level: "중" as const, summary: "분석 결과를 파싱할 수 없습니다." })),
      };
    }

    return NextResponse.json({
      analysis: parsed.analysis,
      impacts: parsed.impacts,
      newsId,
    });
  } catch (error) {
    console.error("AI Prompter error:", error);
    return NextResponse.json(
      { error: "AI 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
