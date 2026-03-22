/**
 * PortOne V1 (iamport) 결제 연동
 *
 * 환경변수:
 * - NEXT_PUBLIC_PORTONE_STORE_ID: 포트원 가맹점 식별코드 (imp_xxx)
 * - NEXT_PUBLIC_PORTONE_CHANNEL_KEY: 사용하지 않음 (V1은 imp_code만 필요)
 */

interface IMP {
  init: (impCode: string) => void;
  request_pay: (params: Record<string, unknown>, callback: (rsp: IMPResponse) => void) => void;
}

interface IMPResponse {
  success: boolean;
  imp_uid?: string;
  merchant_uid?: string;
  error_msg?: string;
}

function getIMP(): IMP | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { IMP?: IMP }).IMP || null;
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
  const IMP_CODE = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || "";

  const imp = getIMP();
  if (!imp) {
    return { success: false, error: "결제 모듈 로딩 중입니다. 잠시 후 다시 시도해주세요." };
  }

  if (!IMP_CODE) {
    console.warn("[Payment] 포트원 설정 없음 — 테스트 모드");
    await new Promise((r) => setTimeout(r, 2000));
    return { success: true, paymentId: `test_${Date.now()}` };
  }

  imp.init(IMP_CODE);

  const merchantUid = `globe_${planName.toLowerCase()}_${Date.now()}`;

  return new Promise((resolve) => {
    imp.request_pay(
      {
        pg: "uplus.tlgdacomxpay",
        pay_method: "card",
        merchant_uid: merchantUid,
        name: `US속보 ${planName} 구독`,
        amount,
        buyer_email: email,
        custom_data: { userId, plan: planName },
      },
      (rsp: IMPResponse) => {
        if (rsp.success) {
          resolve({ success: true, paymentId: rsp.imp_uid || merchantUid });
        } else {
          resolve({ success: false, error: rsp.error_msg || "결제가 취소되었습니다." });
        }
      }
    );
  });
}
