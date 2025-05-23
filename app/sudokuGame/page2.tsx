"use client";

/*
1. 숫자 가리기
2. 가려진 숫자 눌러서 드러내기
3. 해당 조건에서 답이 하나 밖에 없는지
or 제시된 보드와 같은 답인지 체크
4. 메모 기능 추가
5. 스도쿠 해결 검사 추가

현재 상태
1. 탐색 중인 노드를 스택 구조로 저장
2. 해답이 나왔을 때의 노드를 로그로 출력
*/


/**
 * 데이터 흐름:
 * 1. 게임 상태와 훅 초기화
 * 2. 게임판과 컨트롤 패널 레이아웃 구성
 * 3. 게임 컨트롤을 위한 키보드 이벤트 처리
 * 4. 자식 컴포넌트에 상태와 핸들러 전달
 */

import { 
  GameMode,
} from './types';
import useSudokuGame from './useSudokuGame';
import Link from 'next/link';
import SudokuBoard from './components/SudokuBoard';
import NumberPad from './components/NumberPad';
import GameControls from './components/GameControls';

/**
 * Main Game Page Component
 * 
 * State Management:
 * - Uses useSudokuGame custom hook for all game state and logic
 * - Manages keyboard event listeners for number input
 * - Renders the main game layout with board and controls
 */
export default function SudokuGamePage() {
    const {
        gameState,
        isMemoMode,
        selectedCell,
        isActive,
        handleCellSelect,
        handleNumberPadClick,
        toggleMemoMode,
        startNewGame,
        startGame,
    } = useSudokuGame();

    const { mode, revealedBoard } = gameState;


    return (
        <div className="min-h-screen bg-tokyo_night-900 text-white p-4">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-8">
                    <Link href="/" className="inline-block mb-4">
                        <h1 className="text-4xl font-bold text-tokyo_green-500 hover:text-tokyo_green-400 transition-colors">
                            Sudoku Game
                        </h1>
                    </Link>
                    <p className="text-tokyo_night-300">
                        {mode === GameMode.PRE_START 
                            ? "Select cells to reveal numbers, then click Start Game"
                            : "Solve the puzzle by filling in the empty cells"}
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
                                onStartGame={startGame}
                                onNewGame={startNewGame}
                                onToggleMemo={toggleMemoMode}
                                isMemoMode={isMemoMode}
                            />
                            
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-tokyo_night-800 p-6 rounded-lg shadow-lg h-full">
                            <h2 className="text-xl font-bold mb-4 text-tokyo_blue-400">How to Play</h2>
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
                                <h3 className="text-lg font-semibold mb-3 text-tokyo_orange-400">Game Status</h3>
                                <div className="space-y-2">
                                    <p className="flex justify-between">
                                        <span>Mode:</span>
                                        <span className="font-mono">
                                            {mode === GameMode.PLAYING ? 'Playing' : 'Setup'}
                                        </span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Memo Mode:</span>
                                        <span className={`font-mono ${isMemoMode ? 'text-tokyo_blue-400' : 'text-tokyo_night-400'}`}>
                                            {isMemoMode ? 'ON' : 'OFF'}
                                        </span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Selected Cell:</span>
                                        <span className="font-mono">
                                            {selectedCell !== null 
                                                ? `R${Math.floor(selectedCell / 9) + 1}C${(selectedCell % 9) + 1}` 
                                                : 'None'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
