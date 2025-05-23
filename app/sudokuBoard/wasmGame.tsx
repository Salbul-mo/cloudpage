"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { GameMode, DifficultyLevel } from './types';
import useSudokuWasm from './useSudokuWasm';
import SudokuBoard from './components/SudokuBoard';
import NumberPad from './components/NumberPad';
import GameControls from './components/GameControls';

/**
 * WebAssembly를 이용한 스도쿠 게임 페이지
 * 
 * C 코드로 작성된 스도쿠 솔버와 생성기를 WASM으로 컴파일하여 사용
 * 보다 빠른 성능과 복잡한 퍼즐 생성 및 검증 기능 제공
 */
export default function SudokuWasmGame() {
  const {
    gameState,
    isMemoMode,
    selectedCell,
    isActive,
    handleCellSelect,
    handleNumberPadClick,
    toggleMemoMode,
    startNewGame,
  } = useSudokuWasm();

  const { mode, revealedBoard } = gameState;

  // 페이지 로드 시 키보드 이벤트 리스너 등록
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== GameMode.PLAYING) return;
      
      // 숫자 키 1-9
      if (/^[1-9]$/.test(e.key)) {
        handleNumberPadClick(parseInt(e.key));
      }
      // Backspace 또는 Delete: 지우기
      else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleNumberPadClick(0);
      }
      // 'm' 키: 메모 모드 토글
      else if (e.key.toLowerCase() === 'm') {
        toggleMemoMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, handleNumberPadClick, toggleMemoMode]);

  return (
    <div className="min-h-screen bg-tokyo_night-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-4xl font-bold text-tokyo_green-500 hover:text-tokyo_green-400 transition-colors">
              WebAssembly 스도쿠 게임
            </h1>
          </Link>
          <p className="text-tokyo_night-300">
            C 코드로 작성된 고성능 스도쿠 엔진을 WebAssembly로 컴파일하여 실행
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex justify-center">
            <div className="bg-tokyo_night-800 p-6 rounded-lg shadow-lg">
              <SudokuBoard
                sudokuNumber={gameState.sudokuNumber}
                isActive={isActive}
                setActive={() => {}}
                onPlay={() => {}}
                gameMode={gameState.mode}
                onCellClick={handleCellSelect}
                revealedBoard={revealedBoard}
              />
              
              <GameControls
                gameMode={gameState.mode}
                onStartGame={() => startNewGame(gameState.difficulty)}
                onNewGame={startNewGame}
                onToggleMemo={toggleMemoMode}
                isMemoMode={isMemoMode}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-tokyo_night-800 p-6 rounded-lg shadow-lg h-full">
              <h2 className="text-xl font-bold mb-4 text-tokyo_blue-400">게임 도움말</h2>
              <div className="space-y-4 text-tokyo_night-200">
                <div className="bg-tokyo_night-700 p-4 rounded-lg">
                  <NumberPad
                    onNumberClick={handleNumberPadClick}
                    onClear={() => handleNumberPadClick(0)}
                    isMemoMode={isMemoMode}
                    gameMode={gameState.mode}
                  />
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3 text-tokyo_orange-400">게임 상태</h3>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span>모드:</span>
                    <span className="font-mono">
                      {mode === GameMode.PLAYING ? '게임 중' : 
                       mode === GameMode.COMPLETED ? '완료' : '준비'}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>메모 모드:</span>
                    <span className={`font-mono ${isMemoMode ? 'text-tokyo_blue-400' : 'text-tokyo_night-400'}`}>
                      {isMemoMode ? 'ON' : 'OFF'}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>난이도:</span>
                    <span className="font-mono">
                      {gameState.difficulty === DifficultyLevel.EASY ? '쉬움' :
                       gameState.difficulty === DifficultyLevel.MEDIUM ? '보통' :
                       gameState.difficulty === DifficultyLevel.HARD ? '어려움' :
                       gameState.difficulty === DifficultyLevel.EXPERT ? '전문가' : '매우 어려움'}
                    </span>
                  </p>
                  
                  <div className="mt-4 p-3 bg-tokyo_night-700 rounded text-sm">
                    <p className="mb-2 text-tokyo_blue-300">단축키:</p>
                    <ul className="list-disc list-inside space-y-1 text-tokyo_night-300">
                      <li>숫자 1-9: 숫자 입력</li>
                      <li>Backspace: 지우기</li>
                      <li>M: 메모 모드 전환</li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 text-sm text-tokyo_blue-300">
                    <p>WebAssembly 기반 스도쿠 엔진은 고성능 C 코드를 브라우저에서 실행하여 빠른 속도와 정확한 계산을 제공합니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
