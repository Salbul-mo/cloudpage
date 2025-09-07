"use client";

import React, { useState, useCallback } from 'react';

// Tailwind CSS 클래스를 사용하는 컴포넌트이므로 별도 CSS 파일은 필요하지 않습니다.

function formatNumber(num: any) {
    if (isNaN(num)) return '';
    return num.toLocaleString('ko-KR');
}

function unformatNumber(str: any) {
    if (!str) return 0;
    const cleaned = str.replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

const SalaryCalculator = () => {
    // 상태 관리 (State Management)
    const [netSalary, setNetSalary] = useState('');
    const [totalDeductions, setTotalDeductions] = useState('');
    const [minHourlyWage, setMinHourlyWage] = useState(9860);
    const [mealAllowanceChecked, setMealAllowanceChecked] = useState(false);
    const [carAllowanceChecked, setCarAllowanceChecked] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    // 입력값 변경 핸들러
    const handleInputChange = (e: any, setter: any) => {
        const unformatted = unformatNumber(e.target.value);
        setter(unformatted);
    };

    // 계산 로직 (Calculation Logic)
    const calculateSalary = useCallback(() => {
        const parsedNetSalary = unformatNumber(netSalary);
        const parsedTotalDeductions = unformatNumber(totalDeductions);
        const parsedMinHourlyWage = unformatNumber(minHourlyWage);

        if (parsedNetSalary <= 0 || parsedTotalDeductions < 0 || parsedMinHourlyWage <= 0) {
            setError('올바른 금액을 입력해주세요.');
            setResult(null);
            return;
        }

        const mealAllowance = mealAllowanceChecked ? 200000 : 0;
        const carAllowance = carAllowanceChecked ? 200000 : 0;
        const targetGrossSalary = parsedNetSalary + parsedTotalDeductions;
        const nonHourlyBasedPay = mealAllowance + carAllowance;
        const adjustableGross = targetGrossSalary - nonHourlyBasedPay;

        if (adjustableGross < 0) {
            setError('총 급여가 비과세 항목 합계보다 작을 수 없습니다.');
            setResult(null);
            return;
        }

        let hourlyWage = parsedMinHourlyWage;
        let overtimeHours = 0;

        const baseWorkHours = 209;
        const annualLeaveHours = 8;
        const monthlyStandardHours = baseWorkHours + annualLeaveHours;

        const requiredOvertimeHours = ((adjustableGross / hourlyWage) - monthlyStandardHours) / 1.5;

        if (requiredOvertimeHours < 0) {
            const minPossibleGross = (monthlyStandardHours * hourlyWage) + nonHourlyBasedPay;
            setError(`최저시급 기준 최소 급여(${formatNumber(Math.round(minPossibleGross))}원)보다 목표 총급여가 낮습니다.`);
            setResult(null);
            return;
        } else if (requiredOvertimeHours > 52) {
            overtimeHours = 52;
            hourlyWage = adjustableGross / (monthlyStandardHours + (overtimeHours * 1.5));
        } else {
            overtimeHours = requiredOvertimeHours;
        }

        const basePay = Math.round(baseWorkHours * hourlyWage);
        const annualLeaveAllowance = Math.round(annualLeaveHours * hourlyWage);
        const overtimeAllowance = Math.round(overtimeHours * hourlyWage * 1.5);
        const calculatedGrossSalary = basePay + annualLeaveAllowance + overtimeAllowance + mealAllowance + carAllowance;

        // 최종 결과 상태 업데이트
        setResult({
            hourlyWage: Math.round(hourlyWage),
            overtimeHours: overtimeHours.toFixed(2),
            basePay: basePay,
            annualLeaveAllowance: annualLeaveAllowance,
            overtimeAllowance: overtimeAllowance,
            mealAllowance,
            carAllowance,
            taxableIncome: basePay + annualLeaveAllowance + overtimeAllowance,
            nonTaxableIncome: mealAllowance + carAllowance,
            totalGrossSalary: calculatedGrossSalary,
            totalDeductions: parsedTotalDeductions,
            netSalary: calculatedGrossSalary - parsedTotalDeductions,
        });
        setError('');
    }, [netSalary, totalDeductions, minHourlyWage, mealAllowanceChecked, carAllowanceChecked]);

    const renderResults = () => {
        if (error) {
            return (
                <div id="error-display" className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
                    {error}
                </div>
            );
        }

        if (!result) {
            return (
                <div id="result-display" className="text-center text-gray-500 py-16">
                    <p>좌측에 목표 금액과 조건을 입력하고<br />'급여 명세서 생성' 버튼을 눌러주세요.</p>
                </div>
            );
        }

        return (
            <div>
                <div className="space-y-2">
                    <div className="result-table-row bg-gray-50 rounded-t-lg">
                        <span className="result-label">산출 시급</span>
                        <span className="result-value text-lg text-indigo-600 font-bold">{formatNumber(result.hourlyWage)} 원</span>
                    </div>
                    <div className="result-table-row bg-gray-50">
                        <span className="result-label">산출 연장근로</span>
                        <span className="result-value text-lg text-indigo-600 font-bold">{result.overtimeHours} 시간</span>
                    </div>
                </div>
                <div className="mt-6 border-t pt-4">
                    <h3 className="text-xl font-semibold mb-3 text-gray-700">지급 내역</h3>
                    <div className="result-table-row">
                        <span className="result-label">기본급 (209시간)</span>
                        <span className="result-value">{formatNumber(result.basePay)} 원</span>
                    </div>
                    <div className="result-table-row">
                        <span className="result-label">연차수당 (주휴수당 대체)</span>
                        <span className="result-value">{formatNumber(result.annualLeaveAllowance)} 원</span>
                    </div>
                    <div className="result-table-row">
                        <span className="result-label">연장수당</span>
                        <span className="result-value">{formatNumber(result.overtimeAllowance)} 원</span>
                    </div>
                    <div className="result-table-row">
                        <span className="result-label">식대 (비과세)</span>
                        <span className="result-value">{formatNumber(result.mealAllowance)} 원</span>
                    </div>
                    <div className="result-table-row">
                        <span className="result-label">차량유지비 (비과세)</span>
                        <span className="result-value">{formatNumber(result.carAllowance)} 원</span>
                    </div>
                    <div className="result-table-row bg-amber-50 font-bold">
                        <span className="result-label">과세 대상 급여</span>
                        <span className="result-value">{formatNumber(result.taxableIncome)} 원</span>
                    </div>
                    <div className="result-table-row bg-blue-50 font-bold">
                        <span className="result-label">비과세 급여</span>
                        <span className="result-value">{formatNumber(result.nonTaxableIncome)} 원</span>
                    </div>
                </div>
                <div className="mt-6 border-t pt-4">
                    <div className="result-table-row">
                        <span className="result-label text-xl">총 지급액</span>
                        <span className="result-value text-xl font-bold">{formatNumber(result.totalGrossSalary)} 원</span>
                    </div>
                    <div className="result-table-row">
                        <span className="result-label text-xl">총 공제액</span>
                        <span className="result-value text-xl font-bold text-red-600">- {formatNumber(result.totalDeductions)} 원</span>
                    </div>
                    <div className="result-table-row text-2xl font-extrabold bg-indigo-50 p-4 rounded-b-lg">
                        <span className="result-label text-indigo-800">실 지급액</span>
                        <span className="result-value text-indigo-800">{formatNumber(result.netSalary)} 원</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto max-w-5xl p-4 sm:p-6 md:p-8" style={{ fontFamily: 'Pretendard, sans-serif' }}>
            <header className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-indigo-600">실수령액 기준 급여 역산 계산기</h1>
                <p className="mt-3 text-lg text-gray-600">원하는 실수령액을 입력하면, 급여 명세서를 자동으로 완성해 드립니다.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <aside className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-700">1. 목표 금액 입력</h2>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="net-salary" className="block text-base font-medium text-gray-700 mb-2">목표 실수령액 (원)</label>
                            <input
                                type="text"
                                id="net-salary"
                                className="form-input text-right"
                                placeholder="예: 3,000,000"
                                value={formatNumber(netSalary)}
                                onChange={(e) => handleInputChange(e, setNetSalary)}
                            />
                        </div>
                        <div>
                            <label htmlFor="total-deductions" className="block text-base font-medium text-gray-700 mb-2">총 공제액 (원)</label>
                            <input
                                type="text"
                                id="total-deductions"
                                className="form-input text-right"
                                placeholder="4대보험, 소득세 등"
                                value={formatNumber(totalDeductions)}
                                onChange={(e) => handleInputChange(e, setTotalDeductions)}
                            />
                            <p className="text-xs text-gray-500 mt-2">국민연금, 건강보험, 고용보험, 근로소득세 등의 합계 금액을 입력하세요.</p>
                        </div>
                        <h3 className="text-xl font-semibold pt-4 border-t mt-4 text-gray-700">2. 기본 조건 설정</h3>
                        <div>
                            <label htmlFor="min-hourly-wage" className="block text-base font-medium text-gray-700 mb-2">최저 시급 기준 (원)</label>
                            <input
                                type="text"
                                id="min-hourly-wage"
                                className="form-input text-right"
                                value={formatNumber(minHourlyWage)}
                                onChange={(e) => handleInputChange(e, setMinHourlyWage)}
                            />
                            <p className="text-xs text-gray-500 mt-2">2024년 최저시급은 9,860원입니다.</p>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-base font-medium text-gray-700">비과세 항목 (선택)</label>
                            <div className="flex items-center">
                                <input
                                    id="meal-allowance-check"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    checked={mealAllowanceChecked}
                                    onChange={(e) => setMealAllowanceChecked(e.target.checked)}
                                />
                                <label htmlFor="meal-allowance-check" className="ml-2 block text-sm text-gray-900">식대 (200,000원)</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="car-allowance-check"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    checked={carAllowanceChecked}
                                    onChange={(e) => setCarAllowanceChecked(e.target.checked)}
                                />
                                <label htmlFor="car-allowance-check" className="ml-2 block text-sm text-gray-900">차량유지비 (200,000원)</label>
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
                    <div id="result-container" className="bg-white p-6 md:p-8 rounded-xl shadow-lg min-h-full">
                        <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-700">급여 명세서</h2>
                        {renderResults()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SalaryCalculator;
