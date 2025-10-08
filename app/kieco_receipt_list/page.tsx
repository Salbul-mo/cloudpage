"use client";

import React, { useState, useEffect } from 'react';

interface ExpenseReport {
  report_id: string;
  report_date: number;
  account_title: string;
  client_brn: string;
  item_description: string;
  amount: number;
  payee?: string;
  project_purpose?: string;
  employee_id: string;
  employee_name?: string;
  client_name?: string;
}

interface ApiResponse {
  success: boolean;
  data?: ExpenseReport[];
  message?: string;
}

const ReceiptListPage: React.FC = () => {
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // 데이터 조회
  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/expense-reports', {
        method: 'GET',
        credentials: 'include', // 쿠키 포함
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '데이터를 불러오는데 실패했습니다.');
      }

      setReports(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 데이터 조회
  useEffect(() => {
    fetchReports();
  }, []);

  // CSV 다운로드
  const downloadCSV = () => {
    if (reports.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    setIsDownloading(true);

    try {
      // CSV 헤더
      const headers = [
        '보고서ID',
        '보고일자',
        '용도범주',
        '고객사사업자번호',
        '고객사상호명',
        '품목',
        '금액',
        '비고',
        '프로젝트목적',
        '직원ID',
        '직원명'
      ];

      // CSV 데이터 생성
      const csvRows = [
        headers.join(','), // 헤더 행
        ...reports.map(report => [
          `"${report.report_id}"`,
          `"${new Date(report.report_date).toLocaleDateString('ko-KR')}"`,
          `"${report.account_title}"`,
          `"${report.client_brn}"`,
          `"${report.client_name || '알 수 없음'}"`,
          `"${report.item_description}"`,
          `"${report.amount.toLocaleString()}"`,
          `"${report.payee || ''}"`,
          `"${report.project_purpose || ''}"`,
          `"${report.employee_id}"`,
          `"${report.employee_name || '알 수 없음'}"`
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      
      // BOM 추가 (한글 인코딩 문제 해결)
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // 다운로드 링크 생성
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `expense_reports_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('CSV 다운로드 중 오류가 발생했습니다.');
      console.error('CSV download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // 날짜 포맷팅
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">영수증 목록</h1>
        <p className="mt-2 text-gray-600">등록된 모든 영수증 데이터를 조회하고 CSV로 다운로드할 수 있습니다.</p>
      </div>

      {/* 액션 버튼들 */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={fetchReports}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isLoading ? '조회 중...' : '새로고침'}
        </button>
        <button
          onClick={downloadCSV}
          disabled={isDownloading || reports.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {isDownloading ? '다운로드 중...' : `CSV 다운로드 (${reports.length}건)`}
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {/* 데이터 테이블 */}
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">보고일자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직원명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">용도범주</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">품목</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객사</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상호명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">프로젝트</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비고</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    데이터를 불러오는 중...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    등록된 영수증이 없습니다.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.report_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(report.report_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {report.employee_name || '알 수 없음'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.account_title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {report.item_description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {report.amount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.client_brn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {report.client_name || '알 수 없음'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {report.project_purpose || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {report.payee || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 통계 정보 */}
      {reports.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">통계</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">총 건수</p>
              <p className="text-2xl font-bold text-blue-600">{reports.length}건</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">총 금액</p>
              <p className="text-2xl font-bold text-green-600">
                {reports.reduce((sum, report) => sum + report.amount, 0).toLocaleString()}원
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">평균 금액</p>
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(reports.reduce((sum, report) => sum + report.amount, 0) / reports.length).toLocaleString()}원
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptListPage;