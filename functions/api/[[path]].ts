/**
 * 환경 변수 및 바인딩 타입 정의
 * - MY_WORKER: 서비스 바인딩의 타입은 Fetcher입니다.
 */
interface Env {
  DB: Fetcher;
}

/**
 * 모든 경로의 요청을 받아 바인딩된 Worker로 전달합니다.
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // env 객체에서 바인딩된 Worker(DB)를 가져옵니다.
  // DB.fetch()를 호출하여 원래 요청을 그대로 전달하고,
  // Worker의 응답을 클라이언트에게 바로 반환합니다.
  return env.DB.fetch(request);
};;