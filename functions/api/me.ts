// functions/api/me.ts

import { jwtVerify } from 'jose';

/**
 * 이 함수가 사용할 환경 변수 타입
 * JWT 검증을 위해 JWT_SECRET이 필요합니다.
 */
interface Env {
  JWT_SECRET: string;
}

/**
 * GET /api/me 요청을 처리하는 핸들러
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    // 1. 요청 헤더에서 'Cookie' 문자열을 가져옵니다.
    const cookieHeader = request.headers.get('Cookie');
    
    // 2. 쿠키 문자열에서 'auth_token' 값을 추출합니다.
    const authToken = cookieHeader?.match(/auth_token=([^;]+)/)?.[1];

    // 토큰이 존재하지 않으면 로그인하지 않은 상태입니다.
    if (!authToken) {
      return new Response(JSON.stringify({ user: null }), {
        status: 401, // Unauthorized
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. JWT를 검증합니다.
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    // jwtVerify는 시그니처와 만료 시간을 모두 자동으로 확인합니다.
    const { payload } = await jwtVerify(authToken, secret);
    
    // 4. 검증에 성공하면, 토큰의 payload(사용자 정보)를 반환합니다.
    return new Response(JSON.stringify({ user: payload }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // jwtVerify가 실패하면 (예: 토큰 만료, 시그니처 불일치), 에러가 발생합니다.
    // 이 경우에도 로그인하지 않은 상태로 간주합니다.
    console.error("Auth token validation failed:", error);
    return new Response(JSON.stringify({ user: null }), {
      status: 401, // Unauthorized
      headers: { 'Content-Type': 'application/json' },
    });
  }
};