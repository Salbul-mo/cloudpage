"use client";

import { useRouter } from 'next/router';
import React, { useState, Suspense } from 'react';

// API 응답 타입을 정의합니다.
interface SubmitResponse {
    success: boolean;
    message?: string;
}

const ReceiptDetailsForm: React.FC = () => {
    const router = useRouter();
    // useSearchParams() 대신 router.query에서 파라미터를 가져옵니다.
    const { businessNumber } = router.query;

    const [accountTitle, setAccountTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [projectPurpose, setProjectPurpose] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessNumber) {
            setError("잘못된 접근입니다. 고객사를 먼저 확인해주세요.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        
        try {
            const response = await fetch('/api/vendors/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Expense_Reports 테이블 스키마에 맞게 요청 본문을 수정합니다.
                body: JSON.stringify({ 
                    clientBrn: businessNumber, 
                    accountTitle, 
                    amount: Number(amount),
                    itemDescription,
                    projectPurpose 
                }),
            });
            const data: SubmitResponse = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "영수증 제출에 실패했습니다.");
            }
            setSuccessMessage("영수증이 성공적으로 제출되었습니다!");
            // 2초 후 대시보드로 이동
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (router.isReady && !businessNumber) {
        return (
            <div className="text-center mt-10">
                <p>잘못된 접근입니다. <a href="/submit-receipt" className="text-indigo-600 hover:underline">고객사 확인 페이지로 돌아가기</a></p>
            </div>
        );
    }
  
    return (
        <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl">
            <h1 className="text-2xl font-bold mb-6 text-center">영수증 제출 (2/2): 상세 정보 입력</h1>
            <p className="text-center text-gray-600 mb-6">고객사 사업자번호: {businessNumber}</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="accountTitle" className="block text-sm font-medium text-gray-700">계정 과목 (품목)</label>
                    <input id="accountTitle" type="text" value={accountTitle} onChange={(e) => setAccountTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                 <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">금액</label>
                    <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                 <div>
                    <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700">사용 내역 (상세 설명)</label>
                    <textarea id="itemDescription" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} required rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                 <div>
                    <label htmlFor="projectPurpose" className="block text-sm font-medium text-gray-700">프로젝트/목적 (선택 사항)</label>
                    <input id="projectPurpose" type="text" value={projectPurpose} onChange={(e) => setProjectPurpose(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                {successMessage && <p className="text-sm text-green-600 text-center">{successMessage}</p>}

                <button type="submit" disabled={isLoading || !!successMessage} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
                    {isLoading ? "제출 중..." : "제출하기"}
                </button>
            </form>
        </div>
    );
}

const ReceiptDetailsPage: React.FC = () => (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
        <ReceiptDetailsForm />
    </Suspense>
);

export default ReceiptDetailsPage;