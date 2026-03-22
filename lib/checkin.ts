import { supabase } from "./supabase";

export interface CheckinResult {
  already: boolean;
  streak: number;
  xp?: number;
}

export async function dailyCheckin(userId: string): Promise<CheckinResult | null> {
  const { data, error } = await supabase.rpc("daily_checkin", { p_user_id: userId });
  if (error) {
    console.error("[Checkin] 실패:", error);
    return null;
  }
  return data as CheckinResult;
}
