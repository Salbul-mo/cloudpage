"use client";

import { useState, useEffect } from 'react';
import { 
  isCookieEnabled, 
  getCookieConsent 
} from '../utils/cookieUtils';

export interface CookieStatus {
  isEnabled: boolean;
  hasConsent: boolean | null;
  error: string | null;
}

export const useCookieStatus = (): CookieStatus => {
  const [status, setStatus] = useState<CookieStatus>({
    isEnabled: false,
    hasConsent: null,
    error: null,
  });

  useEffect(() => {
    const checkStatus = () => {
      const isEnabled = isCookieEnabled();
      const hasConsent = getCookieConsent();
      
      let error: string | null = null;
      
      if (!isEnabled) {
        error = '브라우저에서 쿠키가 비활성화되어 있습니다.';
      } else if (hasConsent === false) {
        error = '쿠키 사용에 동의하지 않았습니다.';
      }

      setStatus({
        isEnabled,
        hasConsent,
        error,
      });
    };

    // 초기 체크만 수행 (주기적 체크 제거)
    checkStatus();
    
    // 쿠키 설정 변경 시에만 재확인하는 이벤트 리스너 (옵션)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkStatus();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return status;
};