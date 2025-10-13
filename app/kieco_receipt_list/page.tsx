"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { apiRequest } from '../../utils/apiClient';
import { getReceipts } from '../../utils/apiClient';

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

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

interface ApiResponse {
  success: boolean;
  data?: ExpenseReport[];
  pagination?: PaginationInfo;
  message?: string;
}

const ReceiptListPage: React.FC = () => {
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // 인증 확인
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/kieco_login');
    }
  }, [isAuthenticated, authLoading, router]);

  // 데이터 조회 (페이지네이션)
  const fetchReports = async (page: number = 1, append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setReports([]);
    }
    setError(null);
    
    try {
      const response = await apiRequest(`/api/expense-reports?page=${page}&limit=20`, { method: 'GET' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '데이터를 불러오는데 실패했습니다.');
      }

      if (append) {
        setReports(prev => [...prev, ...(data.data || [])]);
      } else {
        setReports(data.data || []);
      }
      
      setPagination(data.pagination || null);
      setHasMore(data.pagination?.hasMore || false);
      setCurrentPage(page);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 더 많은 데이터 로드
  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchReports(currentPage + 1, true);
    }
  };

  // 인증 완료 후 데이터 조회
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchReports(1);
    }
  }, [isAuthenticated, authLoading]);

  // 무한 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 1000 >=
        document.documentElement.offsetHeight
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, hasMore, isLoadingMore]);

  // 전체 데이터 조회 (CSV 다운로드용)
  const fetchAllReports = async (): Promise<ExpenseReport[]> => {
    const response = await apiRequest('/api/expense-reports?page=1&limit=10000', { method: 'GET' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || '전체 데이터를 불러오는데 실패했습니다.');
    }

    return data.data || [];
  };

  // CSV 다운로드
  const downloadCSV = async () => {
    setIsDownloading(true);

    try {
      const allReports = await fetchAllReports();
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
        ...allReports.map(report => [
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

  // 인증 확인 중인 경우 로딩 표시
  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">인증 확인 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">영수증 리스트를 보려면 로그인해주세요.</p>
          <button
            onClick={() => router.push('/kieco_login')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">영수증 리스트</h1>
        <p className="text-gray-600">등록된 모든 영수증을 확인할 수 있습니다.</p>
      </div>

      {/* 액션 버튼들 */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => fetchReports(1)}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isLoading ? '조회 중...' : '새로고침'}
        </button>
        <button
          onClick={downloadCSV}
          disabled={isDownloading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {isDownloading ? '다운로드 중...' : `CSV 다운로드 (전체 ${pagination?.totalCount || 0}건)`}
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
        
        {/* 무한 스크롤 로딩 인디케이터 */}
        {isLoadingMore && (
          <div className="py-8 text-center">
            <div className="inline-flex items-center px-4 py-2 text-sm text-gray-600">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              더 많은 데이터를 불러오는 중...
            </div>
          </div>
        )}
        
        {/* 더 이상 데이터가 없을 때 */}
        {!hasMore && reports.length > 0 && (
          <div className="py-8 text-center text-gray-500">
            <p>모든 데이터를 불러왔습니다.</p>
          </div>
        )}
      </div>

      {/* 통계 정보 */}
      {pagination && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">통계</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">전체 건수</p>
              <p className="text-2xl font-bold text-blue-600">{pagination?.totalCount || 0}건</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">현재 표시</p>
              <p className="text-2xl font-bold text-indigo-600">{reports.length}건</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">현재 페이지 총액</p>
              <p className="text-2xl font-bold text-green-600">
                {reports.reduce((sum, report) => sum + report.amount, 0).toLocaleString()}원
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">평균 금액</p>
              <p className="text-2xl font-bold text-orange-600">
                {reports.length > 0 ? Math.round(reports.reduce((sum, report) => sum + report.amount, 0) / reports.length).toLocaleString() : '0'}원
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptListPage;