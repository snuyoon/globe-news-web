import { supabase } from "./supabase";

export const XP_REWARDS = {
  news_view: { xp: 1, points: 1 },
  card_view: { xp: 2, points: 2 },
  company_view: { xp: 3, points: 3 },
  post_create: { xp: 5, points: 5 },
  comment_create: { xp: 2, points: 2 },
  feedback_accepted: { xp: 20, points: 30 },
  resubscribe: { xp: 50, points: 50 },
} as const;

export type XpAction = keyof typeof XP_REWARDS;

export async function grantXp(userId: string, action: XpAction) {
  const reward = XP_REWARDS[action];
  const { data, error } = await supabase.rpc("grant_xp", {
    p_user_id: userId,
    p_xp: reward.xp,
    p_points: reward.points,
  });
  if (error) console.error("grantXp error:", error);
  return data as { xp: number; points: number; level: number } | null;
}
