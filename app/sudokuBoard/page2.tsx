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

  const [gameState, setGameState] = useState<GameState>(() =>
    loadGameState(defaultInitialData)
  );
  const [isMemoMode, setIsMemoMode] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<number | null>(null); // 선택된 셀 인덱스

  const { board, memoBoard, revealedBoard, initialBoard } = gameState;

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // 셀 선택 핸들러
  const handleCellSelect = (index: number) => {
    if (!revealedBoard[index]) {
      handleCellReveal(index); // 가려진 셀이면 개방
    }
    setSelectedCell(index);
  };

  // 셀 개방 핸들러
  const handleCellReveal = (index: number) => {
    if (revealedBoard[index]) return;

    const newRevealedBoard = [...revealedBoard];
    newRevealedBoard[index] = true;

    const newBoard = [...board];
    if (initialBoard[index] !== null) {
      newBoard[index] = initialBoard[index];
    }

    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      revealedBoard: newRevealedBoard,
    }));
  };

  // 셀 값 변경 핸들러
  const handleCellChange = (index: number, value: number | null) => {
    if (isMemoMode || !revealedBoard[index]) return;

    const newBoard = [...board];
    newBoard[index] = value;

    const newMemoBoard = [...memoBoard];
    if (value !== null) {
      newMemoBoard[index] = Array(9).fill(false);
    }

    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      memoBoard: newMemoBoard,
    }));
  };

  // 메모 토글 핸들러
  const toggleMemo = (index: number, memoNum: number) => {
    if (!revealedBoard[index] || board[index] !== null) return;

    const newMemoBoard = [...memoBoard];
    const memoIndex = memoNum - 1;
    newMemoBoard[index][memoIndex] = !newMemoBoard[index][memoIndex];

    setGameState((prev) => ({
      ...prev,
      memoBoard: newMemoBoard,
    }));
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.shiftKey && /[1-9]/.test(e.key)) {
      e.preventDefault();
      toggleMemo(index, Number(e.key));
    } else if (/[1-9]/.test(e.key)) {
      e.preventDefault();
      handleCellChange(index, Number(e.key));
    }
  };

  // 숫자 패드 클릭 핸들러
  const handleNumberPadClick = (num: number) => {
    if (selectedCell === null) return;
    if (isMemoMode) {
      toggleMemo(selectedCell, num);
    } else {
      handleCellChange(selectedCell, num);
    }
  };

  // 메모 모드 토글 버튼 핸들러
  const toggleMemoMode = () => {
    setIsMemoMode(!isMemoMode);
  };

  // 새 게임 시작 핸들러
  const startNewGame = () => {
    const newState = {
      board: Array(81).fill(null),
      memoBoard: Array(81).fill(null).map(() => Array(9).fill(false)),
      revealedBoard: Array(81).fill(false),
      initialBoard: defaultInitialData,
    };
    setGameState(newState);
    saveGameState(newState);
    setSelectedCell(null);
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
      <div className="grid grid-cols-9 grid-rows-9 gap-[1px] bg-gray-400 mx-auto w-fit mb-3">
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
              } ${revealedBoard[index] ? "" : "bg-gray-500"} ${
                selectedCell === index ? "bg-yellow-200" : ""
              }`}
              onClick={() => handleCellSelect(index)}
            >
              {revealedBoard[index] ? (
                cell !== null ? (
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) =>
                      handleCellChange(index, e.target.value ? Number(e.target.value) : null)
                    }
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-full h-full text-center text-xl border-none bg-transparent focus:outline-none focus:bg-yellow-300"
                    maxLength={1}
                    aria-label={`Cell at row ${rowIndex + 1}, column ${colIndex + 1}`}
                  />
                ) : (
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3 text-xs pointer-events-none hover:bg-yellow-100">
                    {memoBoard[index].map((isMemo, memoIndex) => (
                      <span
                        key={memoIndex}
                        className={`flex items-center justify-center text-gray-500 cursor-pointer pointer-events-auto ${
                          isMemo ? "text-black font-bold" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
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
                        !isMemoMode &&
                        handleCellChange(
                          index,
                          e.target.value ? Number(e.target.value) : null
                        )
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
      <div className="grid grid-cols-9 gap-2 mx-auto w-fit">
        {Array.from({ length: 9 }).map((_, i) => {
          const num = i + 1;
          return (
            <button
              key={num}
              onClick={() => handleNumberPadClick(num)}
              className="w-[50px] h-[50px] bg-gray-200 hover:bg-gray-300 border border-gray-400 rounded-md text-xl transition-colors"
              disabled={selectedCell === null}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SudokuBoard;