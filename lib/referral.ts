import { supabase } from "./supabase";
import { grantXp } from "./xp";

/**
 * 유저의 레퍼럴 코드 가져오기 (없으면 생성)
 */
export async function getReferralCode(userId: string): Promise<string | null> {
  // 기존 코드 확인
  const { data } = await supabase
    .from("subscribers")
    .select("referral_code")
    .eq("user_id", userId)
    .maybeSingle();

  if (data?.referral_code) return data.referral_code;

  // 새 코드 생성 (8자리)
  const code = `US${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const { error } = await supabase
    .from("subscribers")
    .update({ referral_code: code })
    .eq("user_id", userId);

  if (error) {
    console.error("[Referral] 코드 생성 실패:", error);
    return null;
  }
  return code;
}

/**
 * 레퍼럴 코드로 초대한 사람 찾기 + 보상 지급
 */
export async function applyReferral(referredUserId: string, code: string): Promise<boolean> {
  // 코드로 초대자 찾기
  const { data: referrer } = await supabase
    .from("subscribers")
    .select("user_id")
    .eq("referral_code", code)
    .maybeSingle();

  if (!referrer) return false;
  if (referrer.user_id === referredUserId) return false; // 자기 자신 불가

  // 이미 적용됐는지 확인
  const { data: existing } = await supabase
    .from("referrals")
    .select("id")
    .eq("referred_id", referredUserId)
    .maybeSingle();

  if (existing) return false;

  // 레퍼럴 기록
  await supabase.from("referrals").insert({
    referrer_id: referrer.user_id,
    referred_id: referredUserId,
    referral_code: code,
  });

  // 양쪽 보상: +100XP, +50P
  grantXp(referrer.user_id, "resubscribe"); // 50XP+50P
  grantXp(referredUserId, "resubscribe");   // 50XP+50P

  return true;
}

/**
 * 초대 링크 생성
 */
export function getReferralLink(code: string): string {
  return `https://globe-news-web.vercel.app/?ref=${code}`;
}
