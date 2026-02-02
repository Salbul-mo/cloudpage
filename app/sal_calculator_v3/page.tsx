"use client";

import React, { useState, useCallback } from "react";

// ----------------------------------------------------------------------
// 1. 타입 및 유틸리티 함수 정의
// ----------------------------------------------------------------------

interface CalculationResult {
  hourlyWage: number;
  overtimeHours: string;
  basePay: number;
  overtimeAllowance: number;
  mealAllowance: number;
  carAllowance: number;
  taxableIncome: number;
  nonTaxableIncome: number;
  totalGrossSalary: number;
  totalDeductions: number;
  netSalary: number;
}

// 숫자에 콤마(,) 추가
function formatNumber(num: number | string): string {
  if (num === "" || num === null || num === undefined) return "";
  const numValue =
    typeof num === "string" ? parseFloat(num.replace(/,/g, "")) : num;
  if (isNaN(numValue)) return "";
  return numValue.toLocaleString("ko-KR");
}

// 콤마 제거 및 숫자 변환
function unformatNumber(str: string | number): number {
  if (!str && str !== 0) return 0;
  if (typeof str === "number") return str;
  const cleaned = str.replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// 1원 단위 절삭 (10원 단위로 내림)
function floorTo10(num: number): number {
  return Math.floor(num / 10) * 10;
}

// ----------------------------------------------------------------------
// 2. 메인 컴포넌트
// ----------------------------------------------------------------------

const SalaryCalculator: React.FC = () => {
  // --- State 관리 ---
  const [netSalary, setNetSalary] = useState<string>("");
  const [totalDeductions, setTotalDeductions] = useState<string>("");
  const [minHourlyWage, setMinHourlyWage] = useState<number>(10320); // 2026년 기준
  const [maxOvertimeHours, setMaxOvertimeHours] = useState<number>(52);
  const [mealAllowanceChecked, setMealAllowanceChecked] =
    useState<boolean>(false);
  const [carAllowanceChecked, setCarAllowanceChecked] =
    useState<boolean>(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>("");

  // --- 입력 핸들러 ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter:
      | React.Dispatch<React.SetStateAction<string>>
      | React.Dispatch<React.SetStateAction<number>>,
  ) => {
    const unformatted = unformatNumber(e.target.value);
    // 금액 입력 필드는 포맷팅(콤마) 적용, 시간/시급은 숫자 그대로 적용
    if (
      typeof setter === typeof setNetSalary ||
      typeof setter === typeof setTotalDeductions
    ) {
      (setter as React.Dispatch<React.SetStateAction<string>>)(
        formatNumber(unformatted),
      );
    } else {
      (setter as React.Dispatch<React.SetStateAction<number>>)(unformatted);
    }
  };

  // --- 핵심 계산 로직 ---
  const calculateSalary = useCallback(() => {
    // 1. 입력값 파싱
    const parsedNetSalary = unformatNumber(netSalary);
    const parsedTotalDeductions = unformatNumber(totalDeductions);
    const parsedMinHourlyWage = unformatNumber(minHourlyWage);
    const parsedMaxOvertimeHours = unformatNumber(maxOvertimeHours);

    // 2. 유효성 검사
    if (
      parsedNetSalary <= 0 ||
      parsedTotalDeductions < 0 ||
      parsedMinHourlyWage <= 0 ||
      parsedMaxOvertimeHours <= 0
    ) {
      setError("올바른 금액을 입력해주세요.");
      setResult(null);
      return;
    }

    // 3. 비과세 설정
    const mealAllowance = mealAllowanceChecked ? 200000 : 0;
    const carAllowance = carAllowanceChecked ? 200000 : 0;
    const totalNonTaxable = mealAllowance + carAllowance;

    // 💡 [중요] 목표 총급여 자체를 10원 단위로 절삭 (1원 단위 제거)
    // 이렇게 해야 최종 결과값도 무조건 0원으로 끝납니다.
    const rawGross = parsedNetSalary + parsedTotalDeductions;
    const targetGrossSalary = floorTo10(rawGross);

    // 4. 시급 및 연장시간 역산 시작
    let hourlyWage = parsedMinHourlyWage;
    let overtimeHours = 0;

    const baseWorkHours = 209; // 월 소정근로시간
    const monthlyStandardHours = baseWorkHours;

    // (목표급여 / 시급 - 기본시간) / 1.5 = 필요 연장시간
    const requiredOvertimeHours =
      (targetGrossSalary / hourlyWage - monthlyStandardHours) / 1.5;

    if (requiredOvertimeHours < 0) {
      // Case A: 연장근로 불필요 (기본급만으로 충분하거나 시급 낮춰야 함)
      overtimeHours = 0;
      hourlyWage = targetGrossSalary / monthlyStandardHours;

      // 계산된 시급이 최저시급 미달인지 확인
      if (hourlyWage < parsedMinHourlyWage) {
        hourlyWage = parsedMinHourlyWage;
        const minPossibleGross = monthlyStandardHours * hourlyWage;
        setError(
          `최저시급 기준 최소 급여(${formatNumber(
            floorTo10(minPossibleGross),
          )}원)보다 목표 총급여가 낮습니다.`,
        );
        setResult(null);
        return;
      }
    } else if (requiredOvertimeHours > parsedMaxOvertimeHours) {
      // Case B: 최대 연장 시간을 초과함 -> 시간을 최대로 고정하고 시급을 높임
      overtimeHours = parsedMaxOvertimeHours;
      // 역산 공식: 총액 / (209 + 시간*1.5)
      hourlyWage =
        targetGrossSalary / (monthlyStandardHours + overtimeHours * 1.5);

      if (hourlyWage < parsedMinHourlyWage) {
        const maxPossibleGross =
          monthlyStandardHours * parsedMinHourlyWage +
          parsedMaxOvertimeHours * parsedMinHourlyWage * 1.5;
        setError(
          `설정된 조건으로 달성 가능한 최대 급여(${formatNumber(
            floorTo10(maxPossibleGross),
          )}원)보다 목표 총급여가 높습니다.`,
        );
        setResult(null);
        return;
      }
    } else {
      // Case C: 정상 범위 (최저시급 유지, 연장시간만 조절)
      overtimeHours = requiredOvertimeHours;
    }

    // 5. 급여 항목 확정 (짜맞추기 로직)

    // (1) 연장 수당 계산 (10원 단위 절삭)
    // 소수점 시간까지 반영하여 정확히 계산 후 절삭
    const overtimeAllowance = floorTo10(overtimeHours * hourlyWage * 1.5);

    // (2) 기본급 역산
    // 목표 총액에서 (연장수당 + 비과세)를 뺀 나머지를 모두 기본급으로 설정
    // 이렇게 해야 [기본급 + 연장수당 + 비과세 = 목표총액] 공식이 성립함
    const basePay = Math.max(
      0,
      targetGrossSalary - overtimeAllowance - totalNonTaxable,
    );

    // (3) 최종 합계 (검증용)
    const calculatedGrossSalary = basePay + overtimeAllowance + totalNonTaxable;

    // 6. 결과 세팅
    setResult({
      hourlyWage: Math.round(hourlyWage), // 보여주기용 반올림
      overtimeHours: (isNaN(overtimeHours) ? 0 : overtimeHours).toFixed(2),
      basePay: basePay,
      overtimeAllowance: overtimeAllowance,
      mealAllowance,
      carAllowance,
      taxableIncome: basePay + overtimeAllowance,
      nonTaxableIncome: totalNonTaxable,
      totalGrossSalary: calculatedGrossSalary,
      totalDeductions: parsedTotalDeductions,
      netSalary: calculatedGrossSalary - parsedTotalDeductions,
    });
    setError("");
  }, [
    netSalary,
    totalDeductions,
    minHourlyWage,
    maxOvertimeHours,
    mealAllowanceChecked,
    carAllowanceChecked,
  ]);

  // --- 렌더링 ---
  const renderResults = (): JSX.Element => {
    if (error) {
      return (
        <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
          ⚠️ {error}
        </div>
      );
    }

    if (!result) {
      return (
        <div className="text-center text-gray-500 py-16">
          <p>
            좌측에 목표 금액과 조건을 입력하고
            <br />
            <span className="font-bold text-indigo-600">
              '급여 명세서 생성'
            </span>{" "}
            버튼을 눌러주세요.
          </p>
        </div>
      );
    }

    return (
      <div className="animate-fade-in">
        {/* 요약 정보 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">역산 시급</div>
            <div className="text-xl font-bold text-indigo-700">
              {formatNumber(result.hourlyWage)}원
            </div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">필요 연장근로</div>
            <div className="text-xl font-bold text-indigo-700">
              {result.overtimeHours}시간
            </div>
          </div>
        </div>

        {/* 상세 명세서 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-bold text-gray-700">
            지급 내역 (1원 단위 절삭)
          </div>

          <div className="divide-y divide-gray-100">
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-gray-600">기본급 (209시간)</span>
              <span className="font-medium">
                {formatNumber(result.basePay)} 원
              </span>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-gray-600">연장수당</span>
              <span className="font-medium">
                {formatNumber(result.overtimeAllowance)} 원
              </span>
            </div>

            {(result.mealAllowance > 0 || result.carAllowance > 0) && (
              <div className="bg-gray-50/50">
                {result.mealAllowance > 0 && (
                  <div className="flex justify-between items-center px-4 py-2 text-sm">
                    <span className="text-gray-500">└ 식대 (비과세)</span>
                    <span>{formatNumber(result.mealAllowance)} 원</span>
                  </div>
                )}
                {result.carAllowance > 0 && (
                  <div className="flex justify-between items-center px-4 py-2 text-sm">
                    <span className="text-gray-500">└ 차량유지비 (비과세)</span>
                    <span>{formatNumber(result.carAllowance)} 원</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
            <span className="font-bold text-gray-700">총 지급액 (세전)</span>
            <span className="font-bold text-xl text-blue-600">
              {formatNumber(result.totalGrossSalary)} 원
            </span>
          </div>
        </div>

        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-bold text-gray-700">
            공제 및 실지급
          </div>
          <div className="px-4 py-3 flex justify-between items-center text-red-600">
            <span>총 공제액 (입력값)</span>
            <span>- {formatNumber(result.totalDeductions)} 원</span>
          </div>
          <div className="bg-indigo-600 px-4 py-4 flex justify-between items-center text-white rounded-b-lg">
            <span className="font-bold text-lg">실 실수령액</span>
            <span className="font-bold text-2xl">
              {formatNumber(result.netSalary)} 원
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="container mx-auto max-w-5xl p-4 sm:p-6 md:p-8"
      style={{ fontFamily: "Pretendard, -apple-system, sans-serif" }}
    >
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">
          💰 급여 역산 계산기
        </h1>
        <p className="text-gray-600">
          실수령액을 입력하면 기본급과 연장수당을 자동으로 계산합니다.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* 왼쪽: 입력 폼 */}
        <aside className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg h-fit border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
            <span className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">
              1
            </span>
            목표 금액 설정
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                목표 실수령액
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-right font-bold text-lg text-gray-800"
                  placeholder="0"
                  value={formatNumber(netSalary)}
                  onChange={(e) => handleInputChange(e, setNetSalary)}
                />
                <span className="absolute right-3 top-3.5 text-gray-400 font-medium">
                  원
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                총 공제액 (4대보험+세금)
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-right font-bold text-lg text-gray-800"
                  placeholder="0"
                  value={formatNumber(totalDeductions)}
                  onChange={(e) => handleInputChange(e, setTotalDeductions)}
                />
                <span className="absolute right-3 top-3.5 text-gray-400 font-medium">
                  원
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs">
                  2
                </span>
                계산 조건
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    최저시급
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 text-right border rounded text-sm"
                    value={formatNumber(minHourlyWage)}
                    onChange={(e) => handleInputChange(e, setMinHourlyWage)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    최대 연장시간
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 text-right border rounded text-sm"
                    value={formatNumber(maxOvertimeHours)}
                    onChange={(e) => handleInputChange(e, setMaxOvertimeHours)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    checked={mealAllowanceChecked}
                    onChange={(e) => setMealAllowanceChecked(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    식대 20만원 포함 (비과세)
                  </span>
                </label>
                <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    checked={carAllowanceChecked}
                    onChange={(e) => setCarAllowanceChecked(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    차량유지비 20만원 포함 (비과세)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={calculateSalary}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            급여 명세서 생성하기
          </button>
        </aside>

        {/* 오른쪽: 결과 화면 */}
        <main className="lg:col-span-3">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg min-h-full border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
              📄 생성된 급여 명세서
            </h2>
            {renderResults()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SalaryCalculator;
