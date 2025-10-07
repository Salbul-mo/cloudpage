// functions/api/receipts/submit.ts

import { jwtVerify } from 'jose';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

interface ReceiptPayload {
  vendorId: number;
  item: string;
  amount: number;
  reason?: string;
  projectName?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // 1. 사용자 인증 (api/me.ts 로직과 유사)
    const cookie = context.request.headers.get('Cookie');
    const token = cookie?.match(/auth_token=([^;]+)/)?.[1];
    if (!token) {
      return new Response(JSON.stringify({ success: false, message: "인증이 필요합니다." }), { status: 401 });
    }
    const secret = new TextEncoder().encode(context.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as number; // JWT에 저장된 사용자 ID

    // 2. 영수증 정보 파싱
    const { vendorId, item, amount, reason, projectName } = await context.request.json<ReceiptPayload>();
    if (!vendorId || !item || !amount) {
      return new Response(JSON.stringify({ success: false, message: "거래처, 품목, 금액은 필수입니다." }), { status: 400 });
    }

    // 3. D1에 영수증 정보 저장
    /*
    const stmt = env.DB.prepare(
      "INSERT INTO Receipts (vendor_id, user_id, item, amount, reason, project_name) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const { success } = await stmt.bind(vendorId, userId, item, amount, reason || null, projectName || null).run();

    if (!success) {
      throw new Error("Failed to submit receipt.");
    }
    */
    
    return new Response(JSON.stringify({ success: true, message: "영수증이 성공적으로 제출되었습니다." }), { status: 201 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: "서버 오류가 발생했습니다." }), { status: 500 });
  }
};