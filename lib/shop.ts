import { supabase } from "./supabase";

export interface ShopItem {
  id: string;
  name: string;
  category: "accessory" | "frame" | "special";
  price: number;
  minLevel?: number;
  description: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // 안경류
  { id: "sunglasses", name: "선글라스", category: "accessory", price: 80, description: "쿨한 선글라스" },
  { id: "glasses", name: "둥근 안경", category: "accessory", price: 50, description: "지적인 둥근 안경" },
  { id: "aviator", name: "에비에이터", category: "accessory", price: 100, description: "골드 프레임 에비에이터" },
  { id: "monocle", name: "모노클", category: "accessory", price: 120, description: "클래식 모노클" },
  // 얼굴
  { id: "mask", name: "마스크", category: "accessory", price: 30, description: "흰 마스크" },
  { id: "bandaid", name: "반창고", category: "accessory", price: 20, description: "볼에 붙인 반창고" },
  { id: "blush_heart", name: "하트 볼터치", category: "accessory", price: 50, description: "핑크 하트 볼터치" },
  // 테두리 (포인트 구매용)
  { id: "frame_neon", name: "네온 테두리", category: "frame", price: 100, description: "네온 글로우 테두리" },
  { id: "frame_rainbow", name: "레인보우 테두리", category: "frame", price: 200, description: "무지개 테두리" },
  // 특수 (레벨 제한)
  { id: "crown", name: "왕관", category: "special", price: 300, minLevel: 4, description: "Lv.4+ 전용 왕관" },
  { id: "star_effect", name: "별 이펙트", category: "special", price: 150, minLevel: 3, description: "Lv.3+ 반짝이 효과" },
];

export async function purchaseItem(userId: string, itemId: string): Promise<{ success: boolean; error?: string }> {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) return { success: false, error: "아이템을 찾을 수 없습니다." };

  // 현재 포인트 + 레벨 + 보유 아이템 확인
  const { data: sub } = await supabase
    .from("subscribers")
    .select("points, level, owned_items")
    .eq("user_id", userId)
    .maybeSingle();

  if (!sub) return { success: false, error: "구독 정보를 찾을 수 없습니다." };

  // 이미 보유 확인
  if ((sub.owned_items || []).includes(itemId)) {
    return { success: false, error: "이미 보유한 아이템입니다." };
  }

  // 레벨 확인
  if (item.minLevel && sub.level < item.minLevel) {
    return { success: false, error: `Lv.${item.minLevel} 이상만 구매할 수 있습니다.` };
  }

  // 포인트 확인
  if (sub.points < item.price) {
    return { success: false, error: `포인트가 부족합니다. (보유: ${sub.points}P, 필요: ${item.price}P)` };
  }

  // 포인트 차감 + 아이템 추가 (원자적)
  const { error: updateErr } = await supabase
    .from("subscribers")
    .update({
      points: sub.points - item.price,
      owned_items: [...(sub.owned_items || []), itemId],
    })
    .eq("user_id", userId);

  if (updateErr) return { success: false, error: "구매 처리 실패" };

  // 구매 기록
  await supabase.from("shop_purchases").insert({
    user_id: userId,
    item_id: itemId,
    price: item.price,
  });

  return { success: true };
}
