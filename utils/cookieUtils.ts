// 쿠키 관련 유틸리티 함수들

/**
 * 브라우저가 쿠키를 지원하는지 확인
 */
export const isCookieSupported = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  try {
    // 테스트 쿠키 설정
    document.cookie = 'cookietest=1; SameSite=Strict';
    const supported = document.cookie.indexOf('cookietest=') !== -1;
    
    // 테스트 쿠키 삭제
    document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT; SameSite=Strict';
    
    return supported;
  } catch (e) {
    return false;
  }
};

/**
 * 쿠키가 활성화되어 있는지 확인
 */
export const isCookieEnabled = (): boolean => {
  return navigator.cookieEnabled && isCookieSupported();
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
 * 특정 쿠키가 존재하는지 확인
 */
export const hasCookie = (name: string): boolean => {
  if (typeof document === 'undefined') return false;
  
  return document.cookie
    .split(';')
    .some(cookie => cookie.trim().startsWith(`${name}=`));
};

/**
 * auth_token 쿠키가 존재하는지 확인
 */
export const hasAuthCookie = (): boolean => {
  return hasCookie('auth_token');
};