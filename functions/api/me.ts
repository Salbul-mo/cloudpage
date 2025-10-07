// functions/api/me.ts

/**
 * 환경 변수 및 바인딩 타입 정의
 * - JWT_SECRET 대신, AUTH_WORKER Fetcher만 필요합니다.
 */
interface Env {
  DB: Fetcher;
}

/**
 * GET 요청을 받아 AUTH_WORKER로 그대로 전달하는 핸들러
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;

    // 들어온 요청을 그대로 복제하여 바인딩된 Worker에게 전달합니다.
    // 헤더(쿠키 포함), 메소드 등 모든 정보가 그대로 전달됩니다.
    const workerResponse = await env.DB.fetch(request.url, {
      method: 'GET',
      headers: request.headers,
    });
    
    // Worker의 응답을 그대로 클라이언트에게 반환합니다.
    return workerResponse;

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ user: null, message: "인증 게이트웨이 오류가 발생했습니다." }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
};;