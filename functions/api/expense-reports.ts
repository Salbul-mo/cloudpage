// functions/api/expense-reports.ts

interface Env {
  DB: Fetcher;
}

/**
 * GET 요청을 받아 DB에서 모든 영수증 데이터를 조회하여 반환하는 핸들러
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;

    // 들어온 요청을 바인딩된 Worker에게 전달합니다.
    const workerResponse = await env.DB.fetch(request.url, {
      method: 'GET',
      headers: request.headers,
    });
    
    // Worker의 응답을 그대로 클라이언트에게 반환합니다.
    return workerResponse;

  } catch (error) {
    console.error("Expense reports gateway error:", error);
    return new Response(JSON.stringify({ success: false, message: "영수증 목록 조회 중 오류가 발생했습니다." }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
};