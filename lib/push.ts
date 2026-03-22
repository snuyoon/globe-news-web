import { supabase } from "./supabase";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

/**
 * 서비스 워커 등록 + 푸시 구독
 */
export async function subscribePush(userId: string): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("[Push] 이 브라우저는 푸시 알림을 지원하지 않습니다.");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("[Push] Service Worker 등록 완료");

    // 이미 구독 중인지 확인
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      console.log("[Push] 이미 구독 중");
      return true;
    }

    if (!VAPID_PUBLIC_KEY) {
      console.warn("[Push] VAPID 키 없음 — 푸시 구독 불가");
      return false;
    }

    // 푸시 구독
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });

    // Supabase에 구독 정보 저장
    const { error } = await supabase.from("push_subscriptions").upsert({
      user_id: userId,
      subscription: JSON.stringify(subscription),
      created_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (error) {
      console.error("[Push] 구독 저장 실패:", error);
      return false;
    }

    console.log("[Push] 푸시 구독 완료");
    return true;
  } catch (e) {
    console.error("[Push] 구독 실패:", e);
    return false;
  }
}

/**
 * 푸시 구독 해제
 */
export async function unsubscribePush(userId: string): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    await supabase.from("push_subscriptions").delete().eq("user_id", userId);
    console.log("[Push] 구독 해제 완료");
  }
}

/**
 * 현재 푸시 구독 상태 확인
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
