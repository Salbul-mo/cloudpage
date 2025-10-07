// functions/api/login.ts

import { SignJWT } from "jose";

interface Env {
  DB: Fetcher;
  JWT_SECRET: string;
}

/**
 * 클라이언트로부터 받는 요청 본문의 타입
 */
interface LoginPayload {
  userName?: string;
  password?: string;
}

/**
 * DB_WORKER로부터 받을 것으로 기대되는 응답 타입
 */
interface WorkerResponse {
    success: boolean;
    employee_id?: string;
    employee_name?: string;
    company_id?: string;
    message?: string;
}

/**
 * POST /api/login 요청을 처리하는 핸들러
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const payload: LoginPayload = await request.json();
    const { userName, password } = payload;

    // 1. 입력값 유효성 검사
    if (!userName || !password) {
      const responseBody = JSON.stringify({
        success: false,
        message: '사용자 이름과 비밀번호를 모두 입력해야 합니다.',
      });
      return new Response(responseBody, {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. DB_WORKER 호출 로직
    const workerRequest = new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const workerResponse = await env.DB.fetch(workerRequest);

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
    
    const workerData: WorkerResponse = await workerResponse.json();

    if (!workerData.employee_id || !workerData.employee_name || !workerData.company_id) {
        const responseBody = JSON.stringify({
            success: false,
            message: '인증에 성공했으나 사용자 정보를 받지 못했습니다.',
        });
        return new Response(responseBody, { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    // JWT 생성
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const jwt = await new SignJWT({ userId: workerData.employee_id, username: workerData.employee_name, companyId: workerData.company_id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret);

    // 3. 성공 응답 생성 (user 객체 포함)
    const successResponseBody = JSON.stringify({
      success: true,
      user: {
        employee_id: workerData.employee_id,
        employee_name: workerData.employee_name,
        company_id: workerData.company_id,
      },
    });

    // 4. 응답 헤더 설정 (쿠키 설정 부분 제거)
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