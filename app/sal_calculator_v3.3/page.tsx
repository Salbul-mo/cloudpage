"use client";

import React, { useState, useCallback } from "react";

// ----------------------------------------------------------------------
// 1. 타입 및 유틸리티 함수 정의
// ----------------------------------------------------------------------

interface CalculationResult {
  hourlyWage: number;
  overtimeHours: string;
  basePay: number;
  annualLeaveAllowance: number;
  overtimeAllowance: number;
  mealAllowance: number;
  carAllowance: number;
  taxableIncome: number;
  nonTaxableIncome: number;
  totalGrossSalary: number;
  totalDeductions: number;
  netSalary: number;
}

function formatNumber(num: number | string): string {
  if (num === "" || num === null || num === undefined) return "";
  const numValue =
    typeof num === "string" ? parseFloat(num.replace(/,/g, "")) : num;
  if (isNaN(numValue)) return "";
  return numValue.toLocaleString("ko-KR");
}

function unformatNumber(str: string | number): number {
  if (!str && str !== 0) return 0;
  if (typeof str === "number") return str;
  const cleaned = str.replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function floorTo10(num: number): number {
  return Math.floor(num / 10) * 10;
}

// ----------------------------------------------------------------------
// 2. 메인 컴포넌트
// ----------------------------------------------------------------------

const SalaryCalculatorFinalIncluded: React.FC = () => {
  const [netSalary, setNetSalary] = useState<string>("");
  const [totalDeductions, setTotalDeductions] = useState<string>("");
  const [minHourlyWage, setMinHourlyWage] = useState<number>(10030);
  const [maxOvertimeHours, setMaxOvertimeHours] = useState<number>(52);
  const [mealAllowanceChecked, setMealAllowanceChecked] =
    useState<boolean>(false);
  const [carAllowanceChecked, setCarAllowanceChecked] =
    useState<boolean>(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter:
      | React.Dispatch<React.SetStateAction<string>>
      | React.Dispatch<React.SetStateAction<number>>,
  ) => {
    const unformatted = unformatNumber(e.target.value);
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

  const calculateSalary = useCallback(() => {
    // 1. 입력값 파싱
    const parsedNetSalary = unformatNumber(netSalary);
    const parsedTotalDeductions = unformatNumber(totalDeductions);
    const parsedMinHourlyWage = unformatNumber(minHourlyWage);
    const parsedMaxOvertimeHours = unformatNumber(maxOvertimeHours);

    if (
      parsedNetSalary <= 0 ||
      parsedTotalDeductions < 0 ||
      parsedMinHourlyWage <= 0 ||
      parsedMaxOvertimeHours <= 0
    ) {
      setError("금액과 시간을 올바르게 입력해주세요.");
      setResult(null);
      return;
    }

    const mealAllowance = mealAllowanceChecked ? 200000 : 0;
    const carAllowance = carAllowanceChecked ? 200000 : 0;
    const totalNonTaxable = mealAllowance + carAllowance;

    // 2. 목표 총급여 설정
    const rawGross = parsedNetSalary + parsedTotalDeductions;
    const targetGrossSalary = floorTo10(rawGross);

    // 3. 기준 시간 설정 (209 + 8 = 217시간)
    const baseWorkHours = 209;
    const annualLeaveHours = 8;
    const monthlyStandardHours = baseWorkHours + annualLeaveHours;

    let hourlyWage = parsedMinHourlyWage;
    let overtimeHours = 0;

    // [핵심 변경 사항]
    // 비과세를 미리 빼지 않고 '전체 총급여(targetGrossSalary)'를 기준으로 역산합니다.
    // 이렇게 하면 시급 안에 비과세 가치가 포함되어 계산됩니다.

    // 공식: (총급여 / 시급 - 217시간) / 1.5 = 필요 연장시간
    const requiredOvertimeHours =
      (targetGrossSalary / hourlyWage - monthlyStandardHours) / 1.5;

    if (requiredOvertimeHours < 0) {
      // Case A: 연장근로 불필요
      overtimeHours = 0;
      // 총급여 기준으로 시급 산출
      hourlyWage = targetGrossSalary / monthlyStandardHours;

      if (hourlyWage < parsedMinHourlyWage) {
        hourlyWage = parsedMinHourlyWage;
        const minPossibleGross = monthlyStandardHours * hourlyWage;
        setError(
          `최저시급 기준 최소 급여(${formatNumber(floorTo10(minPossibleGross))}원)보다 목표 총급여가 낮습니다.`,
        );
        setResult(null);
        return;
      }
    } else if (requiredOvertimeHours > parsedMaxOvertimeHours) {
      // Case B: 최대 연장시간 초과
      overtimeHours = parsedMaxOvertimeHours;
      // 총급여 기준으로 시급 산출
      hourlyWage =
        targetGrossSalary / (monthlyStandardHours + overtimeHours * 1.5);

      if (hourlyWage < parsedMinHourlyWage) {
        const maxPossibleGross =
          monthlyStandardHours * parsedMinHourlyWage +
          parsedMaxOvertimeHours * parsedMinHourlyWage * 1.5;

        setError(
          `최대 연장근로(${parsedMaxOvertimeHours}시간) 기준 최대 급여(${formatNumber(floorTo10(maxPossibleGross))}원)보다 목표 총급여가 높습니다.`,
        );
        setResult(null);
        return;
      }
    } else {
      // Case C: 정상 범위
      overtimeHours = requiredOvertimeHours;
    }

    // 4. 급여 항목 확정

    // (1) 연장수당 (10원 단위 절삭)
    const overtimeAllowance = floorTo10(overtimeHours * hourlyWage * 1.5);

    // (2) 연차수당 (10원 단위 절삭)
    const annualLeaveAllowance = floorTo10(annualLeaveHours * hourlyWage);

    // (3) 기본급 계산 (목표 총액 맞춤 로직)
    // 총급여 - (연장 + 연차 + 비과세) = 표기용 기본급
    // *주의*: 시급이 '비과세 포함'으로 계산되었으므로, 기본급 총액(209*시급)에는 비과세가 묻어있습니다.
    // 따라서 여기서 비과세(totalNonTaxable)를 빼주어야 항목별 합계가 맞습니다.
    const basePay = Math.max(
      0,
      targetGrossSalary -
        overtimeAllowance -
        annualLeaveAllowance -
        totalNonTaxable,
    );

    // (4) 최종 합계 검증
    const calculatedGrossSalary =
      basePay + annualLeaveAllowance + overtimeAllowance + totalNonTaxable;

    setResult({
      hourlyWage: Math.round(hourlyWage),
      overtimeHours: (isNaN(overtimeHours) ? 0 : overtimeHours).toFixed(2),
      basePay,
      annualLeaveAllowance,
      overtimeAllowance,
      mealAllowance,
      carAllowance,
      // 과세 대상 = 기본급 + 연차 + 연장
      taxableIncome: basePay + annualLeaveAllowance + overtimeAllowance,
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

  const renderResults = (): JSX.Element => {
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center animate-fade-in">
          <p className="text-red-600 font-bold mb-2">계산 불가</p>
          <p className="text-sm text-gray-700">{error}</p>
        </div>
      );
    }

    if (!result) {
      return (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
          <p className="text-gray-500 text-lg">
            왼쪽에서 금액을 입력하고
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
      <div className="animate-fade-in space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 text-center shadow-sm">
            <div className="text-sm text-gray-600 mb-1">
              역산 시급{" "}
              <span className="text-xs text-indigo-400">(비과세 포함)</span>
            </div>
            <div className="text-2xl font-bold text-indigo-700">
              {formatNumber(result.hourlyWage)}원
            </div>
          </div>
          <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 text-center shadow-sm">
            <div className="text-sm text-gray-600 mb-1">필요 연장근로</div>
            <div className="text-2xl font-bold text-indigo-700">
              {result.overtimeHours}시간
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <span className="font-bold text-gray-800">지급 내역 (세전)</span>
            <span className="text-xs bg-white border border-gray-300 px-2 py-1 rounded text-gray-500">
              1원 단위 절삭
            </span>
          </div>

          <div className="divide-y divide-gray-100 bg-white">
            <div className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col">
                <span className="text-gray-600 font-medium">기본급 (209H)</span>
                {result.nonTaxableIncome > 0 && (
                  <span className="text-xs text-gray-400">
                    비과세 제외 후 표기
                  </span>
                )}
              </div>
              <span className="font-bold text-lg text-gray-800">
                {formatNumber(result.basePay)} 원
              </span>
            </div>
            <div className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition-colors">
              <span className="text-gray-600 font-medium">연차수당 (8H)</span>
              <span className="font-bold text-lg text-gray-800">
                {formatNumber(result.annualLeaveAllowance)} 원
              </span>
            </div>
            <div className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition-colors">
              <span className="text-gray-600 font-medium">연장수당</span>
              <span className="font-bold text-lg text-gray-800">
                {formatNumber(result.overtimeAllowance)} 원
              </span>
            </div>

            {(result.mealAllowance > 0 || result.carAllowance > 0) && (
              <div className="bg-gray-50/50 border-t border-dashed border-gray-200">
                {result.mealAllowance > 0 && (
                  <div className="flex justify-between items-center px-6 py-3 text-sm">
                    <span className="text-gray-500">└ 식대 (비과세)</span>
                    <span className="text-gray-700">
                      {formatNumber(result.mealAllowance)} 원
                    </span>
                  </div>
                )}
                {result.carAllowance > 0 && (
                  <div className="flex justify-between items-center px-6 py-3 text-sm">
                    <span className="text-gray-500">└ 차량유지비 (비과세)</span>
                    <span className="text-gray-700">
                      {formatNumber(result.carAllowance)} 원
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <span className="font-bold text-gray-700">총 지급액</span>
            <span className="font-bold text-xl text-blue-600">
              {formatNumber(result.totalGrossSalary)} 원
            </span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-white px-6 py-4 flex justify-between items-center text-red-500 border-b border-gray-100">
            <span className="font-medium">총 공제액</span>
            <span className="font-bold text-lg">
              - {formatNumber(result.totalDeductions)} 원
            </span>
          </div>
          <div className="bg-indigo-600 px-6 py-6 flex justify-between items-center text-white">
            <div className="flex flex-col">
              <span className="font-bold text-lg">실 실수령액</span>
              <span className="text-indigo-200 text-xs font-light mt-1">
                목표 금액과 일치
              </span>
            </div>
            <span className="font-bold text-3xl">
              {formatNumber(result.netSalary)} 원
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-5xl p-4 sm:p-6 md:p-8 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-3">
          💰 급여 역산 계산기
        </h1>
        <p className="text-gray-600 text-lg">
          <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium align-middle mr-2">
            비과세 포함 역산
          </span>
          비과세 수당을{" "}
          <span className="font-bold text-gray-800">시급 계산에 포함</span>하여
          역산합니다.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <aside className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit">
          <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center border-b pb-4">
            <span className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-2 text-sm">
              1
            </span>
            목표 금액 설정
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                목표 실수령액
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-3 pr-9 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right font-bold text-xl text-gray-800 transition-all"
                  placeholder="0"
                  value={formatNumber(netSalary)}
                  onChange={(e) => handleInputChange(e, setNetSalary)}
                />
                <span className="absolute right-4 top-4 text-gray-400 font-medium">
                  원
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                총 공제액 (세금+4대보험)
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-3 pr-9 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right font-bold text-xl text-gray-800 transition-all"
                  placeholder="0"
                  value={formatNumber(totalDeductions)}
                  onChange={(e) => handleInputChange(e, setTotalDeductions)}
                />
                <span className="absolute right-4 top-4 text-gray-400 font-medium">
                  원
                </span>
              </div>
            </div>
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs">
                  2
                </span>
                계산 조건
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-medium">
                    최저시급
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 text-right border border-gray-300 rounded-lg text-sm font-medium"
                    value={formatNumber(minHourlyWage)}
                    onChange={(e) => handleInputChange(e, setMinHourlyWage)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-medium">
                    최대 연장근로
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 text-right border border-gray-300 rounded-lg text-sm font-medium"
                    value={formatNumber(maxOvertimeHours)}
                    onChange={(e) => handleInputChange(e, setMaxOvertimeHours)}
                  />
                </div>
              </div>
              <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold mb-2">
                  비과세 항목
                </p>
                <label className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    checked={mealAllowanceChecked}
                    onChange={(e) => setMealAllowanceChecked(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    식대 200,000원
                  </span>
                </label>
                <label className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    checked={carAllowanceChecked}
                    onChange={(e) => setCarAllowanceChecked(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    차량유지비 200,000원
                  </span>
                </label>
              </div>
            </div>
          </div>
          <button
            onClick={calculateSalary}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] text-lg"
          >
            급여 명세서 생성하기
          </button>
        </aside>

        <main className="lg:col-span-3">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 min-h-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4 flex items-center">
              📄 생성된 급여 명세서
            </h2>
            {renderResults()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SalaryCalculatorFinalIncluded;
