"use client";

import { useState, useEffect } from 'react';
import { 
  isCookieEnabled, 
  getCookieConsent,
  hasAuthCookie 
} from '../utils/cookieUtils';

export interface CookieStatus {
  isEnabled: boolean;
  hasConsent: boolean | null;
  hasAuthToken: boolean;
  error: string | null;
}

export const useCookieStatus = (): CookieStatus => {
  const [status, setStatus] = useState<CookieStatus>({
    isEnabled: false,
    hasConsent: null,
    hasAuthToken: false,
    error: null,
  });

  useEffect(() => {
    const checkStatus = () => {
      const isEnabled = isCookieEnabled();
      const hasConsent = getCookieConsent();
      const hasAuthToken = hasAuthCookie();
      
      let error: string | null = null;
      
      if (!isEnabled) {
        error = '브라우저에서 쿠키가 비활성화되어 있습니다.';
      } else if (hasConsent === false) {
        error = '쿠키 사용에 동의하지 않았습니다.';
      }

      setStatus({
        isEnabled,
        hasConsent,
        hasAuthToken,
        error,
      });
    };

    // 초기 체크
    checkStatus();

    // 주기적으로 체크 (쿠키 상태 변경 감지)
    const interval = setInterval(checkStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  return status;
};