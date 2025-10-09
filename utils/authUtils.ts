// JWT 기반 인증 상태 관리

export interface UserInfo {
  employee_id: number;
  employee_name: string;
  company_id: number;
  iat?: number;
  exp?: number;
}

/**
 * JWT 페이로드를 디코딩 (검증 없이, 클라이언트 표시용)
 * 참고: 실제 검증은 서버에서만 수행
 */
export const decodeJWTPayload = (token: string): UserInfo | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
};

/**
 * JWT 토큰이 만료되었는지 확인 (클라이언트 사이드)
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWTPayload(token);
  if (!payload || !payload.exp) return true;
  
  return Date.now() >= payload.exp * 1000;
};

/**
 * 로컬 스토리지에서 사용자 정보 저장/조회 (JWT 기반)
 */
export const setUserInfo = (userInfo: UserInfo): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('user_info', JSON.stringify(userInfo));
  }
};

export const getUserInfo = (): UserInfo | null => {
  if (typeof localStorage === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('user_info');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to parse user info:', error);
    return null;
  }
};

export const clearUserInfo = (): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('user_info');
  }
};

/**
 * 인증 상태 확인 (최소한의 API 호출)
 */
let lastAuthCheck = 0;
let cachedAuthStatus = false;
const AUTH_CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

export const checkAuthStatusCached = async (): Promise<boolean> => {
  const now = Date.now();
  
  // 캐시된 결과가 유효한 경우 사용
  if (now - lastAuthCheck < AUTH_CACHE_DURATION && cachedAuthStatus) {
    return cachedAuthStatus;
  }
  
  // 로컬 사용자 정보가 있는지 먼저 확인
  const userInfo = getUserInfo();
  if (!userInfo) {
    cachedAuthStatus = false;
    lastAuthCheck = now;
    return false;
  }
  
  // JWT 만료 확인 (실제 토큰은 HttpOnly 쿠키에 있으므로 대략적인 추정)
  if (userInfo.exp && Date.now() >= userInfo.exp * 1000) {
    clearUserInfo();
    cachedAuthStatus = false;
    lastAuthCheck = now;
    return false;
  }
  
  // 필요시에만 API 호출
  try {
    const response = await fetch('/api/me', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      const data: { success?: boolean; user?: any } = await response.json();
      cachedAuthStatus = data.success && data.user;
    } else {
      cachedAuthStatus = false;     
    }
    
    lastAuthCheck = now;
    
    if (!cachedAuthStatus) {
      clearUserInfo();
    }
    
    return cachedAuthStatus;
  } catch (error) {
    console.error('Auth status check failed:', error);
    cachedAuthStatus = false;
    lastAuthCheck = now;
    return false;
  }
};

/**
 * 캐시 무효화
 */
export const invalidateAuthCache = (): void => {
  lastAuthCheck = 0;
  cachedAuthStatus = false;
};