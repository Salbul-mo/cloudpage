// app/submit-receipt/details/page.tsx
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, Suspense } from 'react';

interface ReceiptDetails{
    success: boolean;
    message?: string;
    receipt?: {
        item: string;
        amount: number;
        reason?: string;
        projectName?: string;
    };
}

const ReceiptDetailsForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorId = searchParams.get('vendorId');

  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
      setError("잘못된 접근입니다. 거래처를 먼저 확인해주세요.");
      return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/receipts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vendorId: Number(vendorId), 
          item, 
          amount: Number(amount),
          reason,
          projectName 
        }),
      });
      const data: ReceiptDetails = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "영수증 제출에 실패했습니다.");
      }
      alert("영수증이 성공적으로 제출되었습니다!");
      router.push('/dashboard'); // 제출 완료 후 대시보드로 이동
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!vendorId) {
    return <div>잘못된 접근입니다. <a href="/submit-receipt">거래처 확인 페이지로 돌아가기</a></div>;
  }
  
  return (
    <div>
      <h1>영수증 제출 (2/2): 상세 정보 입력</h1>
      <form onSubmit={handleSubmit}>
        {/* 품목, 금액, 사용 이유, 프로젝트 이름 입력 폼 */}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "제출 중..." : "제출하기"}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

// Suspense로 감싸서 useSearchParams를 안전하게 사용
const ReceiptDetailsPage: React.FC = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ReceiptDetailsForm />
  </Suspense>
);

export default ReceiptDetailsPage;