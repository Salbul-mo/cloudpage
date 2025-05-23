"use client";

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// WASM 게임 컴포넌트는 클라이언트 측에서만 로드 (SSR 비활성화)
const SudokuWasmGame = dynamic(
  () => import('./wasmGame'), 
  { ssr: false }
);

/**
 * WebAssembly 기반 스도쿠 게임 페이지
 * C 코드를 WASM으로 컴파일하여 빠른 속도와 정확한 계산을 제공합니다.
 */
export default function SudokuBoardPage() {
  return (
    <div className="min-h-screen bg-tokyo_night-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-tokyo_green-500 mb-4">
            WebAssembly 스도쿠 게임
          </h1>
          <p className="text-tokyo_night-300 max-w-2xl mx-auto">
            C 언어로 구현된 스도쿠 알고리즘을 WebAssembly로 컴파일하여 실행하는 고성능 스도쿠 게임입니다.
          </p>
        </header>

        <div className="flex justify-center">
          <div className="bg-tokyo_night-800 p-4 rounded-lg shadow-lg mb-8 max-w-4xl mx-auto">
            <div className="mb-4 flex justify-center">
              <Link href="/"
                className="px-4 py-2 bg-tokyo_night-700 hover:bg-tokyo_night-600 text-tokyo_night-200 rounded-lg transition-colors"
              >
                ← 홈으로 돌아가기
              </Link>
            </div>
            
            {/* WASM 게임 컴포넌트 로드 */}
            <SudokuWasmGame />
          </div>
        </div>
      </div>
    </div>
  );
}