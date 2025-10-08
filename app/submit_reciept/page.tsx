"use client";

import { useRouter } from 'next/router';
import React, { useState } from 'react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Clients 테이블을 조회/삽입하는 API 경로로 변경합니다.
      const response = await fetch('/api/vendors/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 테이블 컬럼에 맞게 요청 본문을 수정합니다.
        body: JSON.stringify({
          businessRegistrationNumber: businessNumber,
          clientName: clientName
        }),
      });

      const data: ClientResponse = await response.json();

      if (response.status !== 200 || !data.client.business_registration_number) {
        throw new Error(data.message || "고객사 확인 또는 생성에 실패했습니다.");
      }

      // 성공 시, business_registration_number를 쿼리 파라미터로 넘겨주며 다음 페이지로 이동합니다.
      router.push(`/submit-receipt/details?businessNumber=${data.client.business_registration_number}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">영수증 제출 (1/2): 고객사 확인</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700">사업자등록번호</label>
          <input
            id="businessNumber"
            type="text"
            value={businessNumber}
            onChange={(e) => setBusinessNumber(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="'-' 없이 숫자만 입력"
          />
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