// app/submit-receipt/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// ✅ API 응답의 구조를 설명하는 interface를 추가합니다.
interface VendorCheckResponse {
  success: boolean;
  message?: string;
  vendor: {
    id: number;
    business_number: string;
    name: string;
  };
}

const VendorCheckPage: React.FC = () => {
  const [businessNumber, setBusinessNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vendors/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessNumber, businessName }),
      });
      // ✅ data 변수에 위에서 정의한 타입을 지정합니다.
      const data: VendorCheckResponse = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "거래처 확인에 실패했습니다.");
      }
      // 성공 시, 거래처 ID를 쿼리 파라미터로 넘겨주며 다음 페이지로 이동
      router.push(`/submit-receipt/details?vendorId=${data.vendor.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>영수증 제출 (1/2): 거래처 확인</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>사업자등록번호</label>
          <input
            type="text"
            value={businessNumber}
            onChange={(e) => setBusinessNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label>상호</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "확인 중..." : "다음"}
        </button>
      </form>
    </div>
  );
};

export default VendorCheckPage;