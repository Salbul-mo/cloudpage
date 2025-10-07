"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, User } from '../providers/AuthContext'; // 👈 User 타입을 AuthContext에서 import

// 1. /api/login API의 응답 타입을 정의합니다.
interface LoginApiResponse {
  success: boolean;
  message?: string;
  user?: User; // 로그인 성공 시 user 객체를 포함하도록 가정
}

const LoginPage: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const auth = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName, password }),
      });
      
      // 2. API 응답에 명시적인 타입을 지정합니다.
      const data: LoginApiResponse = await response.json();

      if (response.status !== 200 || !data.success) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }
      
      // 3. 로그인 성공 시, 응답으로 받은 user 객체로 AuthContext 상태를 업데이트합니다.
      if (data.user) {
        //auth.login(data.user); // 👈 수정됨
        router.push('/sudokuBoard');
      } else {
        // user 객체가 없는 경우 에러 처리
        throw new Error('로그인에 성공했으나 사용자 정보를 받지 못했습니다.');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // ... (return JSX 부분은 이전과 동일) ...
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>로그인</h1>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label htmlFor="userName" style={styles.label}>사용자 이름</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={styles.input}
              disabled={isLoading}
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
              disabled={isLoading}
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
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
};

export default LoginPage;