"use client";

import React, { useState, useCallback } from "react";

// Type definitions for better type safety
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

const SalaryCalculator: React.FC = () => {
  // State management with proper types
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

  // Input change handler with proper typing
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter:
      | React.Dispatch<React.SetStateAction<string>>
      | React.Dispatch<React.SetStateAction<number>>
  ) => {
    const unformatted = unformatNumber(e.target.value);
    if (
      typeof setter === typeof setNetSalary ||
      typeof setter === typeof setTotalDeductions
    ) {
      (setter as React.Dispatch<React.SetStateAction<string>>)(
        formatNumber(unformatted)
      );
    } else {
      (setter as React.Dispatch<React.SetStateAction<number>>)(unformatted);
    }
  };

  // Calculation logic
  const calculateSalary = useCallback(() => {
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
      setError("올바른 금액을 입력해주세요.");
      setResult(null);
      return;
    }

    const mealAllowance = mealAllowanceChecked ? 200000 : 0;
    const carAllowance = carAllowanceChecked ? 200000 : 0;
    const targetGrossSalary = parsedNetSalary + parsedTotalDeductions;
    const nonHourlyBasedPay = mealAllowance + carAllowance;

    let hourlyWage = parsedMinHourlyWage;
    let overtimeHours = 0;

    const baseWorkHours = 209;
    const annualLeaveHours = 8;
    const monthlyStandardHours = baseWorkHours + annualLeaveHours;

    // 전체 총급여를 기준으로 필요한 연장근로시간 계산
    const requiredOvertimeHours =
      (targetGrossSalary / hourlyWage - monthlyStandardHours) / 1.5;

    if (requiredOvertimeHours < 0) {
      // 연장근로 없이 최저시급으로 계산
      overtimeHours = 0;
      hourlyWage = targetGrossSalary / monthlyStandardHours;

      // 계산된 시급이 최저시급보다 낮으면 최저시급 적용
      if (hourlyWage < parsedMinHourlyWage) {
        hourlyWage = parsedMinHourlyWage;
        const minPossibleGross = monthlyStandardHours * hourlyWage;
        setError(
          `최저시급 기준 최소 급여(${formatNumber(
            Math.round(minPossibleGross)
          )}원)보다 목표 총급여가 낮습니다.`
        );
        setResult(null);
        return;
      }
    } else if (requiredOvertimeHours > parsedMaxOvertimeHours) {
      overtimeHours = parsedMaxOvertimeHours;
      hourlyWage =
        targetGrossSalary / (monthlyStandardHours + overtimeHours * 1.5);

      // 계산된 시급이 최저시급보다 낮으면 오류 처리
      if (hourlyWage < parsedMinHourlyWage) {
        const maxPossibleGross =
          monthlyStandardHours * parsedMinHourlyWage +
          parsedMaxOvertimeHours * parsedMinHourlyWage * 1.5;
        setError(
          `최대 연장근로시간과 최저시급 기준으로 달성 가능한 최대 급여(${formatNumber(
            Math.round(maxPossibleGross)
          )}원)보다 목표 총급여가 높습니다.`
        );
        setResult(null);
        return;
      }
    } else {
      overtimeHours = requiredOvertimeHours;
    }

    // 비과세 수당을 포함한 hourlyWage로 통일하여 계산
    const totalBasePay = Math.round(baseWorkHours * hourlyWage);
    const basePay = totalBasePay - mealAllowance - carAllowance; // 비과세 금액 제외한 순수 기본급
    const annualLeaveAllowance = Math.round(annualLeaveHours * hourlyWage);
    const overtimeAllowance = Math.round(overtimeHours * hourlyWage * 1.5);

    const calculatedGrossSalary =
      totalBasePay +
      annualLeaveAllowance +
      overtimeAllowance +
      mealAllowance +
      carAllowance;

    // Final result state update
    setResult({
      hourlyWage: Math.round(hourlyWage),
      overtimeHours: (isNaN(overtimeHours) ? 0 : overtimeHours).toFixed(2),
      basePay: Math.max(0, basePay), // 음수 방지
      annualLeaveAllowance: annualLeaveAllowance,
      overtimeAllowance: overtimeAllowance,
      mealAllowance,
      carAllowance,
      taxableIncome:
        Math.max(0, basePay) + annualLeaveAllowance + overtimeAllowance,
      nonTaxableIncome: mealAllowance + carAllowance,
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
        <div
          id="error-display"
          className="text-center text-red-600 bg-red-50 p-4 rounded-lg"
        >
          {error}
        </div>
      );
    }

    if (!result) {
      return (
        <div id="result-display" className="text-center text-gray-500 py-16">
          <p>
            좌측에 목표 금액과 조건을 입력하고
            <br />
            '급여 명세서 생성' 버튼을 눌러주세요.
          </p>
        </div>
      );
    }

    return (
      <div>
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-gray-50 rounded-t-lg p-3">
            <span className="font-medium text-gray-700">산출 시급</span>
            <span className="text-lg text-indigo-600 font-bold">
              {formatNumber(result.hourlyWage)} 원
            </span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-3">
            <span className="font-medium text-gray-700">산출 연장근로</span>
            <span className="text-lg text-indigo-600 font-bold">
              {result.overtimeHours} 시간
            </span>
          </div>
        </div>
        <div className="mt-6 border-t pt-4">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">
            지급 내역
          </h3>
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-medium text-gray-700">기본급 (209시간)</span>
            <span className="font-medium">
              {formatNumber(result.basePay)} 원
            </span>
          </div>
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-medium text-gray-700">연차수당</span>
            <span className="font-medium">
              {formatNumber(result.annualLeaveAllowance)} 원
            </span>
          </div>
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-medium text-gray-700">연장수당</span>
            <span className="font-medium">
              {formatNumber(result.overtimeAllowance)} 원
            </span>
          </div>
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-medium text-gray-700">식대 (비과세)</span>
            <span className="font-medium">
              {formatNumber(result.mealAllowance)} 원
            </span>
          </div>
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-medium text-gray-700">
              차량유지비 (비과세)
            </span>
            <span className="font-medium">
              {formatNumber(result.carAllowance)} 원
            </span>
          </div>
          <div className="flex justify-between items-center bg-amber-50 font-bold p-3">
            <span className="text-gray-700">과세 대상 급여</span>
            <span>{formatNumber(result.taxableIncome)} 원</span>
          </div>
          <div className="flex justify-between items-center bg-blue-50 font-bold p-3">
            <span className="text-gray-700">비과세 급여</span>
            <span>{formatNumber(result.nonTaxableIncome)} 원</span>
          </div>
        </div>
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center p-3 border-b">
            <span className="text-xl font-medium text-gray-700">총 지급액</span>
            <span className="text-xl font-bold">
              {formatNumber(result.totalGrossSalary)} 원
            </span>
          </div>
          <div className="flex justify-between items-center p-3 border-b">
            <span className="text-xl font-medium text-gray-700">총 공제액</span>
            <span className="text-xl font-bold text-red-600">
              - {formatNumber(result.totalDeductions)} 원
            </span>
          </div>
          <div className="flex justify-between items-center text-2xl font-extrabold bg-indigo-50 p-4 rounded-b-lg">
            <span className="text-indigo-800">실 지급액</span>
            <span className="text-indigo-800">
              {formatNumber(result.netSalary - result.nonTaxableIncome)} 원
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="container mx-auto max-w-5xl p-4 sm:p-6 md:p-8"
      style={{ fontFamily: "Pretendard, sans-serif" }}
    >
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-600">
          실수령액 기준 급여 역산 계산기
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          원하는 실수령액을 입력하면, 급여 명세서를 자동으로 완성해 드립니다.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <aside className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-700">
            1. 목표 금액 입력
          </h2>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="net-salary"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                목표 실수령액 (원)
              </label>
              <input
                type="text"
                id="net-salary"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right"
                placeholder="예: 3,000,000"
                value={formatNumber(netSalary)}
                onChange={(e) => handleInputChange(e, setNetSalary)}
              />
            </div>
            <div>
              <label
                htmlFor="total-deductions"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                총 공제액 (원)
              </label>
              <input
                type="text"
                id="total-deductions"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right"
                placeholder="4대보험, 소득세 등"
                value={formatNumber(totalDeductions)}
                onChange={(e) => handleInputChange(e, setTotalDeductions)}
              />
              <p className="text-xs text-gray-500 mt-2">
                국민연금, 건강보험, 고용보험, 근로소득세 등의 합계 금액을
                입력하세요.
              </p>
            </div>
            <h3 className="text-xl font-semibold pt-4 border-t mt-4 text-gray-700">
              2. 기본 조건 설정
            </h3>
            <div>
              <label
                htmlFor="min-hourly-wage"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                최저 시급 기준 (원)
              </label>
              <input
                type="text"
                id="min-hourly-wage"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right"
                value={formatNumber(minHourlyWage)}
                onChange={(e) => handleInputChange(e, setMinHourlyWage)}
              />
              <p className="text-xs text-gray-500 mt-2">
                2025년 최저시급은 10,030 원입니다.
              </p>
            </div>
            <div>
              <label
                htmlFor="max-overtime-hours"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                최대 연장근로 시간 (시간)
              </label>
              <input
                type="text"
                id="max-overtime-hours"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right"
                value={formatNumber(maxOvertimeHours)}
                onChange={(e) => handleInputChange(e, setMaxOvertimeHours)}
              />
              <p className="text-xs text-gray-500 mt-2">
                법정 최대 연장근로시간은 52시간입니다.
              </p>
            </div>
            <div className="space-y-3">
              <label className="block text-base font-medium text-gray-700">
                비과세 항목 (선택)
              </label>
              <div className="flex items-center">
                <input
                  id="meal-allowance-check"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={mealAllowanceChecked}
                  onChange={(e) => setMealAllowanceChecked(e.target.checked)}
                />
                <label
                  htmlFor="meal-allowance-check"
                  className="ml-2 block text-sm text-gray-900"
                >
                  식대 (200,000원)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="car-allowance-check"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={carAllowanceChecked}
                  onChange={(e) => setCarAllowanceChecked(e.target.checked)}
                />
                <label
                  htmlFor="car-allowance-check"
                  className="ml-2 block text-sm text-gray-900"
                >
                  차량유지비 (200,000원)
                </label>
              </div>
            </div>
          </div>
          <button
            id="calculate-btn"
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300 mt-8 text-lg"
            onClick={calculateSalary}
          >
            급여 명세서 생성
          </button>
        </aside>

        <main className="lg:col-span-3">
          <div
            id="result-container"
            className="bg-white p-6 md:p-8 rounded-xl shadow-lg min-h-full"
          >
            <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-700">
              급여 명세서
            </h2>
            {renderResults()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SalaryCalculator;
