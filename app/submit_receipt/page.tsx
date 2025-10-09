"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { checkClient } from '../../utils/apiClient';

// API 응답의 구조를 Clients 테이블에 맞게 수정합니다.
interface ClientResponse {
  success: boolean;
  message?: string;
  client: {
    business_registration_number: string;
    client_name: string;
  };
}

const ClientCheckPage: React.FC = () => {
  const [businessNumber, setBusinessNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // 인증 확인
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/kieco_login');
    }
  }, [isAuthenticated, authLoading, router]);

  // 사업자등록번호 유효성 검사 함수
  const validateBusinessNumber = (value: string): string => {
    // 숫자만 남기고 모든 특수문자, 공백, 띄어쓰기 제거
    const cleaned = value.replace(/[^0-9]/g, '');
    return cleaned;
  };

  // 사업자등록번호 기본 형식 검증 (체크섬은 서버에서 처리)
  const isValidBusinessNumber = (brn: string): boolean => {
    // 10자리 숫자인지만 확인 (실제 체크섬 검증은 서버에서 처리)
    return brn.length === 10 && /^\d{10}$/.test(brn);
  };

  // 입력값 sanitization
  const sanitizeInput = (input: string): string => {
    return input.replace(/[<>'"&]/g, '').trim();
  };

  // 사업자등록번호 입력 핸들러
  const handleBusinessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = validateBusinessNumber(e.target.value);
    setBusinessNumber(cleanedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 강화된 검증
    const cleanedBusinessNumber = validateBusinessNumber(businessNumber);
    const sanitizedClientName = sanitizeInput(clientName.trim());

    if (cleanedBusinessNumber.length !== 10) {
      setError("사업자등록번호는 10자리 숫자여야 합니다.");
      setIsLoading(false);
      return;
    }

    if (!isValidBusinessNumber(cleanedBusinessNumber)) {
      setError("사업자등록번호는 10자리 숫자여야 합니다.");
      setIsLoading(false);
      return;
    }

    if (!sanitizedClientName || sanitizedClientName.length < 2) {
      setError("상호는 2글자 이상이어야 합니다.");
      setIsLoading(false);
      return;
    }

    if (sanitizedClientName.length > 100) {
      setError("상호는 100글자를 초과할 수 없습니다.");
      setIsLoading(false);
      return;
    }

    try {
      // CSRF 토큰이 포함된 API 클라이언트 사용
      const response = await checkClient({
        businessRegistrationNumber: cleanedBusinessNumber,
        clientName: sanitizedClientName
      });

      const data: ClientResponse = await response.json();

      if (response.status !== 200 || !data.client.business_registration_number) {
        throw new Error(data.message || "사업자 확인 또는 생성에 실패했습니다.");
      }

      // 성공 시, business_registration_number를 쿼리 파라미터로 넘겨주며 다음 페이지로 이동합니다.
      router.push(`/submit_receipt/details?businessNumber=${data.client.business_registration_number}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // 미인증 상태
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <p className="text-red-600">로그인이 필요합니다.</p>
          <p className="text-gray-600 mt-2">잠시 후 로그인 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">영수증 제출 (1/2): 사업자 확인</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700">사업자등록번호</label>
          <input
            id="businessNumber"
            type="text"
            value={businessNumber}
            onChange={handleBusinessNumberChange}
            required
            maxLength={10}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="숫자만 입력 (자동으로 특수문자 제거)"
          />
          {businessNumber && businessNumber.length !== 10 && (
            <p className="mt-1 text-xs text-gray-500">사업자등록번호는 10자리 숫자입니다.</p>
          )}
        </div>
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">상호</label>
          <input
            id="clientName"
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {isLoading ? "확인 중..." : "다음"}
        </button>
      </form>
    </div>
  );
};

export default ClientCheckPage;