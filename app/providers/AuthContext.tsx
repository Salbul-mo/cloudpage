// src/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// 1. 재사용을 위해 User 타입을 명확하게 정의합니다.
type User = {
  employee_id: string;
  employee_name: string;
  company_id?: string;
};

// 2. /api/me API의 응답 타입을 정의합니다.
interface MeApiResponse {
  user: User | null;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  // 3. login 함수의 매개변수 타입을 User | null로 수정합니다. (token: string 대신)
  login: (user: User | null) => void; // 👈 수정됨
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch('/api/me');
        if (response.ok) {
          // 4. API 응답에 명시적인 타입을 지정합니다.
          const data: MeApiResponse = await response.json(); // 👈 수정됨
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserStatus();
  }, []);
  
  // 5. login 함수의 매개변수에 User | null 타입을 지정합니다.
  const login = (userData: User | null) => setUser(userData); // 👈 수정됨
  
  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { User };