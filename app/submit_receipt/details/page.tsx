"use client";

// 1. next/router 대신 next/navigation에서 훅을 가져옵니다.
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { submitReceipt } from "../../../utils/apiClient";

// API 응답 타입 정의는 그대로 둡니다.
interface SubmitResponse {
  success: boolean;
  message?: string;
}

// 용도 범주별 플레이스홀더 및 설정 매핑
interface AccountTitleConfig {
  placeholder: string;
  description?: string;
  example: string;
}

const ACCOUNT_TITLE_CONFIG: Record<string, AccountTitleConfig> = {
  차량유지비: {
    placeholder: "예: 휘발유, 경유, 주차비, 세차비, 톨게이트비 등",
    description: "차량 번호와 지출 목적을 함께 기재해 주세요.",
    example: "차량번호,목적",
  },
  복리후생비: {
    placeholder: "예: 점심식사, 저녁식사, 커피, 간식, 회식비 등",
    description:
      "동석하신 분들을 모두 기재하고, 식사 내용을 간단히 적어주세요.",
    example: "점심식사, 동석자1, 동석자2",
  },
  "소모품비(제품)": {
    placeholder: "예: 센서, 모터, 케이블, 볼트, 너트, 공구 등",
    description: "사용처와 구매목록을 구체적으로 기재해 주세요.",
    example: "OOO 설치 위한 부품 구입",
  },
  "소모품비(판)": {
    placeholder: "예: 문구용품, 청소용품, 포장재, 테이프, 접착제 등",
    description: "사용처와 구매목록을 구체적으로 기재해 주세요.",
    example: "문구용품, 청소용품",
  },
  기타: {
    placeholder: "그 외 기타 업무 관련 비용",
    description: "기타 업무 관련 비용을 구체적으로 기재해 주세요.",
    example: "택배비, 인쇄비, 교육비 등",
  },
};

const ReceiptDetailsForm: React.FC = () => {
  // useRouter는 페이지 이동(push)을 위해 사용합니다.
  const router = useRouter();

  // 2. useSearchParams 훅으로 쿼리 파라미터를 가져옵니다.
  const searchParams = useSearchParams();
  const businessNumber = searchParams.get("businessNumber");

  // 인증 상태 확인
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // 인증 확인
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/kieco_login");
    }
  }, [isAuthenticated, authLoading, router]);

  const [accountTitle, setAccountTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [payee, setPayee] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [projectPurpose, setProjectPurpose] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 유효성 검사 함수들
  const validateAmount = (value: string): string => {
    // 숫자와 소수점만 허용, 음수 방지
    const cleaned = value.replace(/[^0-9.]/g, "");
    // 소수점이 여러 개인 경우 첫 번째만 유지
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    return cleaned;
  };

  const validateItemDescription = (value: string): string => {
    // 앞뒤 공백 제거, 연속된 공백을 하나로 변경
    return value.replace(/\s+/g, " ").trim();
  };

  const validatePayee = (value: string): string => {
    // 앞뒤 공백 제거, 연속된 공백을 하나로 변경
    return value.replace(/\s+/g, " ").trim();
  };

  // 입력 핸들러들
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = validateAmount(e.target.value);
    setAmount(cleanedValue);
  };

  const handleItemDescriptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const cleanedValue = validateItemDescription(e.target.value);
    setItemDescription(cleanedValue);
  };

  const handlePayeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = validatePayee(e.target.value);
    setPayee(cleanedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessNumber) {
      setError("잘못된 접근입니다. 거래처를 먼저 확인해주세요.");
      return;
    }

    // 폼 유효성 검사
    if (!accountTitle.trim()) {
      setError("용도 범주를 선택해주세요.");
      return;
    }

    if (!itemDescription.trim()) {
      setError("품목을 입력해주세요.");
      return;
    }

    const numericAmount = Number(amount);
    if (!amount || numericAmount <= 0) {
      setError("올바른 금액을 입력해주세요.");
      return;
    }

    if (numericAmount > 10000000) {
      setError("금액이 너무 큽니다. (최대 1천만원)");
      return;
    }

    // 추가 보안 검증
    if (itemDescription.length > 200) {
      setError("품목 설명이 너무 깁니다. (최대 200자)");
      return;
    }

    if (payee && payee.length > 100) {
      setError("비고가 너무 깁니다. (최대 100자)");
      return;
    }

    // 의심스러운 패턴 감지 (XSS, SQL Injection 방지)
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i,
    ];
    const allInputs = [
      accountTitle,
      itemDescription,
      payee || "",
      projectPurpose || "",
    ].join(" ");

    if (suspiciousPatterns.some((pattern) => pattern.test(allInputs))) {
      setError("유효하지 않은 입력이 감지되었습니다.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // CSRF 토큰이 포함된 API 클라이언트 사용
      const response = await submitReceipt({
        clientBrn: businessNumber,
        accountTitle,
        itemDescription,
        amount: Number(amount),
        payee,
        projectPurpose,
      });
      const data: SubmitResponse = await response.json();
      if (response.status !== 201 || !data.success) {
        throw new Error(data.message || "영수증 제출에 실패했습니다.");
      }
      setSuccessMessage(
        "영수증이 성공적으로 제출되었습니다! 5초 후 거래처 확인 페이지로 이동합니다."
      );
      setTimeout(() => {
        router.push("/submit_receipt"); // 이 부분은 동일하게 작동합니다.
      }, 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Suspense가 로딩을 처리하므로, router.isReady 체크는 필요 없습니다.
  // businessNumber가 없는 경우만 체크합니다.
  if (!businessNumber) {
    return (
      <div className="text-center mt-10">
        <p>
          잘못된 접근입니다.{" "}
          <a href="/submit-receipt" className="text-indigo-600 hover:underline">
            사업자 확인 페이지로 돌아가기
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-center">
        영수증 제출 (2/2): 상세 정보 입력
      </h1>
      <p className="text-center text-gray-600 mb-6">
        사업자등록번호: {businessNumber}
      </p>

      {/* 지출 내용 입력 안내 문구 */}
      <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-orange-400 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800 mb-1">
              지출 내용 정확 입력 안내
            </h3>
            <p className="text-sm text-orange-700">
              영수증에 적힌 <strong>품목과 금액</strong>을 정확하게 입력하고,
              <br />
              <strong>지출 목적</strong>을 명확하게 기재해 주세요.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 폼 내부는 변경할 필요가 없습니다. */}
        <div>
          <label
            htmlFor="accountTitle"
            className="block text-sm font-medium text-gray-700"
          >
            용도 범주 *
          </label>
          <select
            id="accountTitle"
            value={accountTitle}
            onChange={(e) => setAccountTitle(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">선택해주세요</option>
            <option value="차량유지비">차량유지비(주유, 주차)</option>
            <option value="복리후생비">식대비(접대 포함)</option>
            <option value="소모품비(제품)">설치, 제작용 부품 및 장비</option>
            <option value="소모품비(판)">기타 소모품</option>
            <option value="기타">기타</option>
          </select>
          {!accountTitle ? (
            <p className="mt-1 text-xs text-gray-500">
              용도 범주를 선택해야 합니다.
            </p>
          ) : (
            accountTitle &&
            ACCOUNT_TITLE_CONFIG[accountTitle] && (
              <p className="mt-1 text-xs text-blue-600">
                📋 {ACCOUNT_TITLE_CONFIG[accountTitle].description}
              </p>
            )
          )}
        </div>
        <div>
          <label
            htmlFor="itemDescription"
            className="block text-sm font-medium text-gray-700"
          >
            품목
          </label>
          <input
            id="itemDescription"
            type="text"
            value={itemDescription}
            onChange={handleItemDescriptionChange}
            required
            maxLength={100}
            placeholder={
              accountTitle && ACCOUNT_TITLE_CONFIG[accountTitle]
                ? ACCOUNT_TITLE_CONFIG[accountTitle].placeholder
                : "구체적인 품목명을 입력해주세요"
            }
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {itemDescription && itemDescription.length > 80 && (
            <p className="mt-1 text-xs text-orange-500">
              품목명이 길어집니다. ({itemDescription.length}/100자)
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            금액
          </label>
          <input
            id="amount"
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={handleAmountChange}
            required
            placeholder="숫자만 입력 (예: 50000)"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {amount && Number(amount) > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              입력된 금액: {Number(amount).toLocaleString()}원
            </p>
          )}
          {amount && Number(amount) > 100000000 && (
            <p className="mt-1 text-xs text-orange-500">
              고액입니다. 3층에 직접 제출해주세요.
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="payee"
            className="block text-sm font-medium text-gray-700"
          >
            비고
          </label>
          <input
            id="payee"
            type="text"
            value={payee}
            onChange={handlePayeeChange}
            maxLength={200}
            placeholder={
              accountTitle && ACCOUNT_TITLE_CONFIG[accountTitle]
                ? ACCOUNT_TITLE_CONFIG[accountTitle].example
                : "구체적인 지출내역을 입력해주세요"
            }
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {payee && payee.length > 150 && (
            <p className="mt-1 text-xs text-orange-500">
              비고가 길어집니다. ({payee.length}/200자)
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="projectPurpose"
            className="block text-sm font-medium text-gray-700"
          >
            프로젝트/목적 (선택 사항)
          </label>
          <select
            id="projectPurpose"
            value={projectPurpose}
            onChange={(e) => setProjectPurpose(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">선택해주세요</option>
            <option value="재활용무인회수기">재활용무인회수기</option>
            <option value="종량기">종량기</option>
            <option value="감량기">감량기</option>
            <option value="도서관리시스템">도서관리시스템</option>
            <option value="출입통제시스템">출입통제시스템</option>
            <option value="물품관리시스템">물품관리시스템</option>
            <option value="기타">기타</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {successMessage && (
          <p className="text-sm text-green-600 text-center">{successMessage}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || !!successMessage}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {isLoading ? "제출 중..." : "제출하기"}
        </button>
      </form>
    </div>
  );
};

// 이 부분은 변경할 필요가 없습니다.
const ReceiptDetailsPage: React.FC = () => (
  <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
    <ReceiptDetailsForm />
  </Suspense>
);

export default ReceiptDetailsPage;
