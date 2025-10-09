// 쿠키 관련 유틸리티 함수들

/**
 * 브라우저가 쿠키를 지원하는지 확인 (단순화)
 */
export const isCookieSupported = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  try {
    // 테스트 쿠키 설정 (Secure 플래그 추가)
    document.cookie = 'cookietest=1; Secure; SameSite=Strict';
    const supported = document.cookie.indexOf('cookietest=') !== -1;
    
    // 테스트 쿠키 삭제
    document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT; Secure; SameSite=Strict';
    
    return supported;
  } catch (e) {
    return false;
  }
};

/**
 * 쿠키가 활성화되어 있는지 확인 (단순화)
 */
export const isCookieEnabled = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return navigator.cookieEnabled;
};

/**
 * 쿠키 동의 상태를 로컬스토리지에 저장
 */
export const setCookieConsent = (consent: boolean): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('cookieConsent', consent.toString());
  }
};

/**
 * 쿠키 동의 상태를 로컬스토리지에서 가져오기
 */
export const getCookieConsent = (): boolean | null => {
  if (typeof localStorage === 'undefined') return null;
  
  const consent = localStorage.getItem('cookieConsent');
  return consent ? consent === 'true' : null;
};

/**
 * CSRF 토큰을 생성
 */
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * CSRF 토큰을 세션 스토리지에 저장
 */
export const setCSRFToken = (token: string): void => {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('csrf_token', token);
  }
};

/**
 * CSRF 토큰을 세션 스토리지에서 가져오기
 */
export const getCSRFToken = (): string | null => {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem('csrf_token');
};

/**
 * 새로운 CSRF 토큰을 생성하고 저장
 */
export const initCSRFToken = (): string => {
  const token = generateCSRFToken();
  setCSRFToken(token);
  return token;
};