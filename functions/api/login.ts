// functions/api/login.ts

import { SignJWT } from 'jose';

/**
 * 1. 환경 변수 및 바인딩 타입 정의가 변경되었습니다.
 * - D1Database 대신, 다른 Worker를 호출할 수 있는 Fetcher 타입을 사용합니다.
 * - 변수 이름도 역할에 맞게 DB_WORKER로 변경했습니다.
 */
interface Env {
  DB: Fetcher;
  JWT_SECRET: string; // Cloudflare 대시보드에서 반드시 Secret으로 설정해야 합니다.
}

/**
 * 클라이언트로부터 받는 요청 본문의 타입 (변경 없음)
 */
interface LoginPayload {
  username?: string;
  password?: string;
}

/**
 * DB_WORKER로부터 받을 것으로 기대되는 사용자 정보 타입
 */
interface UserRecord {
  id: number;
  username: string;
}

/**
 * DB_WORKER로부터 받을 것으로 기대되는 응답 타입
 */
interface WorkerResponse {
    success: boolean;
    user?: UserRecord;
    message?: string;
}

/**
 * POST /api/login 요청을 처리하는 핸들러
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const payload: LoginPayload = await request.json();
    const { username, password } = payload;

    // 1. 입력값 유효성 검사는 여기서 계속 수행합니다.
    if (!username || !password) {
      const responseBody = JSON.stringify({
        success: false,
        message: '사용자 이름과 비밀번호를 모두 입력해야 합니다.',
      });
      return new Response(responseBody, {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    /**
     * 2. D1 직접 조회 로직이 DB_WORKER 호출로 변경되었습니다.
     * - request.clone()을 사용하여 원본 요청의 복사본을 Worker에게 전달합니다.
     * (요청의 body는 한 번만 읽을 수 있기 때문입니다.)
     */
    // 수정된 코드
    const workerRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(payload), // ✅ 파싱했던 payload를 다시 문자열로 변환
      redirect: request.redirect,
    });

    const workerResponse = await env.DB.fetch(workerRequest);

    // Worker가 실패 응답을 반환했는지 확인합니다.
    if (!workerResponse.ok) {
        const errorData: WorkerResponse = await workerResponse.json();
        const responseBody = JSON.stringify({
            success: false,
            message: errorData.message || '인증 서버에서 오류가 발생했습니다.',
        });
        return new Response(responseBody, {
            status: workerResponse.status,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    
    // Worker가 성공적으로 처리한 결과를 파싱합니다.
    const workerData: WorkerResponse = await workerResponse.json();
    const user = workerData.user;

    // Worker가 성공했지만 user 정보가 없는 경우 (로직 오류 등)
    if (!user) {
        const responseBody = JSON.stringify({
            success: false,
            message: '인증에 성공했으나 사용자 정보를 받지 못했습니다.',
        });
        return new Response(responseBody, { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    /**
     * 3. 비밀번호 비교 로직이 제거되었습니다.
     * - 이 책임은 이제 DB_WORKER에게 위임되었습니다.
     * - 이 함수는 DB_WORKER가 성공적으로 응답한 것을 신뢰합니다.
     */

    // 4. 로그인 성공: JWT 생성 (기존과 동일)
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const userPayloadForJwt = {
        userId: user.id,
        username: user.username,
    };
    const jwt = await new SignJWT(userPayloadForJwt)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret);

    // 5. 성공 응답 생성 (user 객체 포함) (기존과 동일)
    const successResponseBody = JSON.stringify({
      success: true,
      user: {
        userId: user.id,
        username: user.username,
      },
    });

    // 6. 응답 헤더에 HttpOnly 쿠키 설정 (기존과 동일)
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Set-Cookie', `auth_token=${jwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=7200`);

    return new Response(successResponseBody, { status: 200, headers });

  } catch (error) {
    console.error(error);
    const errorResponseBody = JSON.stringify({
      success: false,
      message: '서버 내부 오류가 발생했습니다.',
    });
    return new Response(errorResponseBody, {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};