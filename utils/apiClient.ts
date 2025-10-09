// API 클라이언트 유틸리티 (CSRF 토큰 포함)

import { getCSRFToken, initCSRFToken } from './cookieUtils';

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  includeCSRF?: boolean;
}

/**
 * CSRF 토큰이 포함된 API 요청
 */
export const apiRequest = async (
  url: string, 
  options: ApiOptions = {}
): Promise<Response> => {
  const {
    method = 'GET',
    body,
    headers = {},
    includeCSRF = method !== 'GET'
  } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // POST, PUT, DELETE 요청에 CSRF 토큰 추가
  if (includeCSRF) {
    let csrfToken = getCSRFToken();
    if (!csrfToken) {
      csrfToken = initCSRFToken();
    }
    requestHeaders['X-CSRF-Token'] = csrfToken;
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  return fetch(url, requestOptions);
};

/**
 * 영수증 제출 API
 */
export const submitReceipt = async (receiptData: any) => {
  return apiRequest('/api/vendors/submit', {
    method: 'POST',
    body: receiptData,
  });
};

/**
 * 고객사 확인 API
 */
export const checkClient = async (clientData: any) => {
  return apiRequest('/api/vendors/check', {
    method: 'POST',
    body: clientData,
  });
};

/**
 * 영수증 목록 조회 API
 */
export const getReceipts = async (page = 1, limit = 20) => {
  return apiRequest(`/api/expense-reports?page=${page}&limit=${limit}`, {
    method: 'GET',
    includeCSRF: false,
  });
};

/**
 * 사용자 정보 조회 API (최소화된 호출)
 */
export const getUserProfile = async () => {
  return apiRequest('/api/me', {
    method: 'GET',
    includeCSRF: false,
  });
};