/**
 * PortOne V2 결제 연동 유틸리티
 *
 * 환경변수:
 * - NEXT_PUBLIC_PORTONE_STORE_ID: PortOne 상점 ID
 * - NEXT_PUBLIC_PORTONE_CHANNEL_KEY: 결제 채널 키
 *
 * 사용법:
 * const result = await requestPayment({ userId, email, planName: "PRO", amount: 4990 });
 * if (result.success) { // 결제 성공 }
 */

// PortOne SDK 타입 (브라우저 전용)
interface PortOneSDK {
  requestPayment: (params: Record<string, unknown>) => Promise<{
    code?: string;
    message?: string;
    paymentId?: string;
    transactionType?: string;
  }>;
}

function getPortOne(): PortOneSDK | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { PortOne?: PortOneSDK }).PortOne || null;
}

export interface PaymentRequest {
  userId: string;
  email: string;
  planName: string;
  amount: number;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

export async function requestPayment({ userId, email, planName, amount }: PaymentRequest): Promise<PaymentResult> {
  // 런타임에 환경변수 읽기 (static export 대응)
  const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || "";
  const CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || "";

  // PortOne SDK 로드 확인
  const portone = getPortOne();
  if (!portone) {
    return { success: false, error: "결제 모듈 로딩 중입니다. 잠시 후 다시 시도해주세요." };
  }

  // 환경변수 확인
  if (!STORE_ID || !CHANNEL_KEY) {
    console.warn("[Payment] PortOne 설정 없음 — 테스트 모드");
    await new Promise((r) => setTimeout(r, 2000));
    return { success: true, paymentId: `test_${Date.now()}` };
  }

  console.log("[Payment] storeId:", STORE_ID, "channelKey:", CHANNEL_KEY.slice(0, 20) + "...");

  const orderId = `globe_${planName.toLowerCase()}_${userId.slice(0, 8)}_${Date.now()}`;

  try {
    const response = await portone.requestPayment({
      storeId: STORE_ID,
      channelKey: CHANNEL_KEY,
      paymentId: orderId,
      orderName: `US속보 ${planName} 구독`,
      totalAmount: amount,
      currency: "KRW",
      payMethod: "CARD",
      customer: {
        email,
      },
      customData: {
        userId,
        plan: planName,
      },
    });

    if (response.code) {
      // 사용자 취소 또는 결제 실패
      if (response.code === "FAILURE_TYPE_PG") {
        return { success: false, error: "결제가 취소되었습니다." };
      }
      return { success: false, error: response.message || "결제에 실패했습니다." };
    }

    return { success: true, paymentId: response.paymentId || orderId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "결제 중 오류가 발생했습니다.";
    return { success: false, error: msg };
  }
}
