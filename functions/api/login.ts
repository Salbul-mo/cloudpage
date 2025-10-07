// functions/api/login.ts

/**
 * 환경 변수 및 바인딩 타입 정의
 * - 이제 AUTH_WORKER Fetcher 하나만 필요합니다.
 */
interface Env {
  AUTH_WORKER: Fetcher;
}

/**
 * POST 요청을 받아 AUTH_WORKER로 그대로 전달하고,
 * 그 응답을 다시 클라이언트에게 그대로 반환하는 핸들러
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;

    // 들어온 요청을 복제하여 바인딩된 Worker에게 전달하고,
    // Worker의 응답(JSON 본문, 쿠키 헤더 등 모든 것)을 그대로 받습니다.
    const workerResponse = await env.AUTH_WORKER.fetch(request);
    
    // Worker가 생성한 응답을 클라이언트에게 그대로 반환합니다.
    return workerResponse;

  } catch (error) {
    console.error("Login gateway error:", error);
    return new Response(JSON.stringify({ success: false, message: "로그인 게이트웨이에서 오류가 발생했습니다." }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
};