"use client"
import React, { useState, useEffect } from "react";

type CellMemo = boolean[]; // 각 셀의 메모: 1-9 숫자에 대해 true/false로 표시 (9개 요소)
type Board = (number | null)[]; // 81개 요소를 가진 일차원 배열 (셀 값)
type MemoBoard = CellMemo[]; // 81개 요소를 가진 일차원 배열 (각 셀의 메모)
type RevealedBoard = boolean[]; // 81개 요소를 가진 일차원 배열 (셀 개방 여부)

interface GameState {
  board: Board;
  memoBoard: MemoBoard;
  revealedBoard: RevealedBoard;
  initialBoard: Board;
}

// localStorage에 저장된 게임 상태를 불러오거나 기본값 반환
const loadGameState = (initialData: Board): GameState => {
  const savedState = localStorage.getItem("sudokuGameState");
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      // 저장된 데이터의 유효성 검사
      if (
        Array.isArray(parsedState.board) &&
        parsedState.board.length === 81 &&
        Array.isArray(parsedState.memoBoard) &&
        parsedState.memoBoard.length === 81 &&
        Array.isArray(parsedState.revealedBoard) &&
        parsedState.revealedBoard.length === 81 &&
        Array.isArray(parsedState.initialBoard) &&
        parsedState.initialBoard.length === 81
      ) {
        return parsedState;
      }
    } catch (e) {
      console.error("Failed to parse saved game state:", e);
    }
  }
  // 저장된 상태가 없거나 유효하지 않으면 기본값 반환
  return {
    board: Array(81).fill(null),
    memoBoard: Array(81).fill(null).map(() => Array(9).fill(false)),
    revealedBoard: Array(81).fill(false),
    initialBoard: initialData,
  };
};

// 게임 상태를 localStorage에 저장
const saveGameState = (state: GameState) => {
  localStorage.setItem("sudokuGameState", JSON.stringify(state));
};

const SudokuBoard: React.FC = () => {
  // 초기 숫자 배열 (예시 데이터, 실제로는 props나 API로 받을 수 있음)
  const defaultInitialData: Board = [
    5, 3, null, null, 7, null, null, null, null,
    6, null, null, 1, 9, 5, null, null, null,
    null, 9, 8, null, null, null, null, 6, null,
    8, null, null, null, 6, null, null, null, 3,
    4, null, null, 8, null, 3, null, null, 1,
    7, null, null, null, 2, null, null, null, 6,
    null, 6, null, null, null, null, 2, 8, null,
    null, null, null, 4, 1, 9, null, null, 5,
    null, null, null, null, 8, null, null, 7, 9,
  ];

  // 페이지 로드 시 저장된 상태 또는 기본 상태 로드
  const [gameState, setGameState] = useState<GameState>(() =>
    loadGameState(defaultInitialData)
  );
  const [isMemoMode, setIsMemoMode] = useState<boolean>(false); // 메모 모드 여부

  const { board, memoBoard, revealedBoard, initialBoard } = gameState;

  // 상태 변경 시 localStorage에 저장
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // 셀 개방 핸들러 (클릭 시 가려진 셀 개방)
  const handleCellReveal = (index: number) => {
    if (revealedBoard[index]) return; // 이미 개방된 셀은 무시

    const newRevealedBoard = [...revealedBoard];
    newRevealedBoard[index] = true;

    const newBoard = [...board];
    // 초기 숫자가 있는 경우 board에 반영
    if (initialBoard[index] !== null) {
      newBoard[index] = initialBoard[index];
    }

    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      revealedBoard: newRevealedBoard,
    }));
  };

  // 셀 값 변경 핸들러 (메모 모드가 아닐 때, 개방된 셀에만 입력 가능)
  const handleCellChange = (index: number, value: string) => {
    if (isMemoMode || !revealedBoard[index]) return; // 메모 모드이거나 가려진 셀은 입력 불가

    const numValue = value === "" ? null : Number(value);

    // 입력값이 1-9 사이의 숫자가 아니면 무시
    if (numValue !== null && (isNaN(numValue) || numValue < 1 || numValue > 9)) {
      return;
    }

    // 보드 업데이트
    const newBoard = [...board];
    newBoard[index] = numValue;

    // 값이 입력되면 해당 셀의 메모 초기화
    const newMemoBoard = [...memoBoard];
    if (numValue !== null) {
      newMemoBoard[index] = Array(9).fill(false);
    }

    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      memoBoard: newMemoBoard,
    }));
  };

  // 메모 토글 핸들러 (메모 모드일 때 또는 Shift + 클릭/키보드 입력)
  const toggleMemo = (index: number, memoNum: number) => {
    // 셀이 개방되지 않았거나 값이 이미 있으면 메모 추가 불가
    if (!revealedBoard[index] || board[index] !== null) return;

    const newMemoBoard = [...memoBoard];
    const memoIndex = memoNum - 1; // 1-9를 0-8 인덱스로 변환
    newMemoBoard[index][memoIndex] = !newMemoBoard[index][memoIndex];

    setGameState((prev) => ({
      ...prev,
      memoBoard: newMemoBoard,
    }));
  };

  // 키보드 이벤트 핸들러 (메모 모드에서 숫자 입력)
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.shiftKey && /[1-9]/.test(e.key)) {
      e.preventDefault();
      toggleMemo(index, Number(e.key));
    }
  };

  // 메모 모드 토글 버튼 핸들러
  const toggleMemoMode = () => {
    setIsMemoMode(!isMemoMode);
  };

  // 새 게임 시작 핸들러 (상태 초기화 및 localStorage 업데이트)
  const startNewGame = () => {
    const newState = {
      board: Array(81).fill(null),
      memoBoard: Array(81).fill(null).map(() => Array(9).fill(false)),
      revealedBoard: Array(81).fill(false),
      initialBoard: defaultInitialData,
    };
    setGameState(newState);
    saveGameState(newState);
  };

  return (
    <div className="text-center mt-5">
      <h1 className="text-2xl font-bold mb-2">Sudoku Game</h1>
      <div className="flex justify-center gap-2 mb-3">
        <button
          onClick={toggleMemoMode}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 border border-gray-500 rounded-md transition-colors"
        >
          {isMemoMode ? "Memo Mode: ON" : "Memo Mode: OFF"}
        </button>
        <button
          onClick={startNewGame}
          className="px-4 py-2 bg-blue-300 hover:bg-blue-400 border border-blue-500 rounded-md transition-colors"
        >
          New Game
        </button>
      </div>
      <div className="grid grid-cols-9 grid-rows-9 gap-[1px] bg-gray-400 mx-auto w-fit">
        {board.map((cell, index) => {
          const rowIndex = Math.floor(index / 9);
          const colIndex = index % 9;
          return (
            <div
              key={index}
              className={`w-[50px] h-[50px] text-center border border-gray-400 bg-white relative cursor-pointer ${
                (rowIndex % 3 === 0 && rowIndex !== 0) ||
                (colIndex % 3 === 0 && colIndex !== 0)
                  ? "border-t-2 border-l-2 border-black"
                  : ""
              } ${revealedBoard[index] ? "" : "bg-gray-500"}`}
              onClick={() => handleCellReveal(index)}
            >
              {revealedBoard[index] ? (
                cell !== null ? (
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => handleCellChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-full h-full text-center text-xl border-none bg-transparent focus:outline-none focus:bg-gray-100"
                    maxLength={1}
                    aria-label={`Cell at row ${rowIndex + 1}, column ${colIndex + 1}`}
                  />
                ) : (
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3 text-xs pointer-events-none hover:bg-gray-100">
                    {memoBoard[index].map((isMemo, memoIndex) => (
                      <span
                        key={memoIndex}
                        className={`flex items-center justify-center text-gray-500 cursor-pointer pointer-events-auto ${
                          isMemo ? "text-black font-bold" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation(); // 셀 개방 클릭 방지
                          if (isMemoMode) toggleMemo(index, memoIndex + 1);
                        }}
                      >
                        {isMemo ? memoIndex + 1 : ""}
                      </span>
                    ))}
                    <input
                      type="text"
                      value=""
                      onChange={(e) =>
                        !isMemoMode && handleCellChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="absolute opacity-0 w-full h-full text-center border-none bg-transparent focus:outline-none"
                      maxLength={1}
                      aria-label={`Cell at row ${rowIndex + 1}, column ${colIndex + 1}`}
                    />
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  ?
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SudokuBoard;