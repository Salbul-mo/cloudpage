// functions/api/receipts/submit.ts

/**
 * 환경 변수 및 바인딩 타입 정의
 * - D1Database와 JWT_SECRET 대신, RECEIPT_WORKER Fetcher만 필요합니다.
 */
interface Env {
  DB: Fetcher;
}

/**
 * POST 요청을 받아 DB로 그대로 전달하는 핸들러
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;

    // 들어온 요청을 그대로 복제하여 바인딩된 Worker에게 전달합니다.
    // 헤더(쿠키 포함), 본문, 메소드 등 모든 정보가 그대로 전달됩니다.
    const workerResponse = await env.DB.fetch(request);
    
    // Worker의 응답을 그대로 클라이언트에게 반환합니다.
    return workerResponse;

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: "서버 게이트웨이 오류가 발생했습니다." }), { status: 500 });
  }
};