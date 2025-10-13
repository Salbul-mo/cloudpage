"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// JWT 기반 상태 관리로 변경
import CookieConsentBanner from '../../components/CookieConsentBanner';
import { 
  isCookieEnabled, 
  setCookieConsent, 
  getCookieConsent,
  initCSRFToken 
} from '../../utils/cookieUtils';
import { 
  setUserInfo
} from '../../utils/authUtils';

// 1. /api/login API의 응답 타입을 표준 형식으로 정의합니다.
interface LoginApiResponse {
  success: boolean;
  message?: string;
  data?: {
    employee_id: number;
    employee_name: string;
    company_id: number;
  };
  csrf_token?: string;
  cookie_info?: {
    name: string;
    max_age: number;
    secure: boolean;
    http_only: boolean;
    same_site: string;
  };
}

const LoginPage: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCookieConsent, setShowCookieConsent] = useState<boolean>(false);
  const [cookieError, setCookieError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    // 페이지 로드 시 쿠키 지원 여부 및 동의 상태 확인
    const checkCookieStatus = () => {
      const cookieConsent = getCookieConsent();
      
      if (!isCookieEnabled()) {
        setCookieError('브라우저에서 쿠키가 비활성화되어 있습니다. 로그인을 위해 쿠키를 활성화해주세요.');
        return;
      }

      // 쿠키 동의를 아직 받지 않았다면 동의 배너 표시
      if (cookieConsent === null) {
        setShowCookieConsent(true);
      }
    };

    checkCookieStatus();
  }, []);

  const handleCookieAccept = () => {
    setCookieConsent(true);
    setShowCookieConsent(false);
    setCookieError(null);
  };

  const handleCookieDecline = () => {
    setCookieConsent(false);
    setShowCookieConsent(false);
    setCookieError('쿠키 사용에 동의하지 않으면 로그인할 수 없습니다. 쿠키는 로그인 상태 유지에만 사용됩니다.');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // 쿠키 동의 여부 확인
    const cookieConsent = getCookieConsent();
    if (cookieConsent !== true) {
      setShowCookieConsent(true);
      setIsLoading(false);
      return;
    }

    // 쿠키 지원 여부 재확인
    if (!isCookieEnabled()) {
      setError('브라우저에서 쿠키가 비활성화되어 있습니다. 설정에서 쿠키를 활성화해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      // CSRF 토큰 생성 및 헤더에 포함
      const csrfToken = initCSRFToken();
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ userName, password }),
        credentials: 'include', // 쿠키 포함하여 요청
      });
      
      // 2. API 응답 처리 (표준 포맷)
      const data: LoginApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }
      
      // 3. 로그인 성공 - 사용자 정보 저장 및 페이지 이동
      if (data.data?.employee_id && data.data?.employee_name && data.data?.company_id) {
        // 사용자 정보를 로컬 스토리지에 저장 (JWT 기반 상태 관리)
        setUserInfo({
          employee_id: data.data.employee_id,
          employee_name: data.data.employee_name,
          company_id: data.data.company_id,
          exp: Math.floor(Date.now() / 1000) + 7200 // 2시간 후 만료
        });
        
        
        // 즉시 페이지 이동 (불필요한 API 호출 제거)
        router.push('/submit_receipt');
      } else {
        throw new Error('로그인에 성공했으나 사용자 정보를 받지 못했습니다.');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>로그인</h1>
          
          {/* 쿠키 비활성화 에러 표시 */}
          {cookieError && (
            <div style={styles.cookieWarning}>
              <strong>⚠️ 쿠키 설정 필요</strong>
              <p>{cookieError}</p>
              <details style={styles.details}>
                <summary>브라우저별 쿠키 활성화 방법</summary>
                <ul style={styles.helpList}>
                  <li><strong>Chrome:</strong> 설정 → 개인정보 보호 및 보안 → 쿠키 및 기타 사이트 데이터 → 쿠키 허용</li>
                  <li><strong>Firefox:</strong> 설정 → 개인 정보 보호 및 보안 → 쿠키 및 사이트 데이터 → 표준</li>
                  <li><strong>Safari:</strong> 환경설정 → 개인정보 보호 → 쿠키 차단 해제</li>
                  <li><strong>Edge:</strong> 설정 → 쿠키 및 사이트 권한 → 쿠키 및 사이트 데이터 관리 및 삭제 → 쿠키 허용</li>
                </ul>
              </details>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label htmlFor="userName" style={styles.label}>사용자 이름</label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={styles.input}
                disabled={isLoading || !!cookieError}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>비밀번호</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                disabled={isLoading || !!cookieError}
                required
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button 
              type="submit" 
              style={{
                ...styles.button,
                opacity: (isLoading || !!cookieError) ? 0.5 : 1,
                cursor: (isLoading || !!cookieError) ? 'not-allowed' : 'pointer'
              }}
              disabled={isLoading || !!cookieError}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>

      {/* 쿠키 동의 배너 */}
      <CookieConsentBanner
        isVisible={showCookieConsent}
        onAccept={handleCookieAccept}
        onDecline={handleCookieDecline}
      />
    </>
  );
};

// ... (styles 객체는 이전과 동일) ...
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
  },
  card: {
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    marginBottom: '24px',
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '16px',
  },
  cookieWarning: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
    color: '#856404',
    fontSize: '14px',
  },
  details: {
    marginTop: '12px',
    fontSize: '13px',
  },
  helpList: {
    marginTop: '8px',
    paddingLeft: '20px',
    lineHeight: '1.5',
  },
};

export default LoginPage;