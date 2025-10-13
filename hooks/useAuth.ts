"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUserInfo,
  clearUserInfo,
  checkAuthStatus,
  UserInfo,
} from "../utils/authUtils";

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });

  // 인증 상태 확인
  const checkAuth = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      // 로컬 스토리지에서 사용자 정보 확인
      const userInfo = getUserInfo();

      if (!userInfo) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      // 서버에 직접 인증 상태 확인
      const isValid = await checkAuthStatus();

      if (isValid) {
        setAuthState({
          isAuthenticated: true,
          user: userInfo,
          isLoading: false,
          error: null,
        });
      } else {
        // 인증 실패 시 로컬 정보 정리
        clearUserInfo();
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: "세션이 만료되었습니다.",
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: "인증 확인 중 오류가 발생했습니다.",
      });
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      // 서버에 로그아웃 요청 (선택사항)
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // 로컬 상태 정리
      clearUserInfo();
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // 인증 상태 갱신
  const refreshAuth = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    const isValid = await checkAuthStatus();
    const userInfo = getUserInfo();

    setAuthState({
      isAuthenticated: isValid,
      user: isValid ? userInfo : null,
      isLoading: false,
      error: isValid ? null : "세션이 만료되었습니다.",
    });
  }, []);

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    checkAuth,
    logout,
    refreshAuth,
  };
};
