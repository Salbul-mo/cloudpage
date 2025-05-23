"use client"
import React, { useState, useEffect } from "react";

// 타입 정의
// 각 셀의 메모 상태를 나타내는 타입
// 1-9까지의 숫자에 대해 각각 true/false로 표시
/**
 * 각 셀의 메모 상태를 나타내는 타입
 * 1-9까지의 숫자에 대해 각각 true/false로 표시
 */
type CellMemo = boolean[]; 

// 게임 보드의 상태를 나타내는 타입
/**
 * 게임 보드의 상태를 나타내는 타입
 * 81개의 셀을 일차원 배열로 표현
 */
type Board = (number | null)[]; 

// 메모 보드의 상태를 나타내는 타입
/**
 * 메모 보드의 상태를 나타내는 타입
 * 각 셀의 메모 상태를 저장
 */
type MemoBoard = CellMemo[]; 

// 셀의 공개 여부를 나타내는 타입
/**
 * 셀의 공개 여부를 나타내는 타입
 * 각 셀이 공개되었는지 여부를 저장
 */
type RevealedBoard = boolean[]; 

// 게임 모드 enum
/**
 * 게임의 진행 상태를 나타내는 enum
 * PRE_START: 게임 시작 전 상태
 * PLAYING: 게임 진행 중 상태
 */
enum GameMode {
  PRE_START = "PRE_START", // 게임 시작 전: 셀 공개만 가능
  PLAYING = "PLAYING", // 게임 진행 중: 숫자 입력 및 메모 가능
}

// 게임 상태 인터페이스
/**
 * 게임의 전체 상태를 정의하는 인터페이스
 * 보드, 메모, 공개 상태 등을 포함
 */
interface GameState {
  board: Board;
  memoBoard: MemoBoard;
  revealedBoard: RevealedBoard;
  initialBoard: Board;
  mode: GameMode;
}

// 게임 상태 저장/로드 관련 함수
/**
 * localStorage에서 게임 상태를 로드하거나 기본값 반환
 * @param initialData 초기 보드 데이터
 * @returns 게임 상태 객체
 */
const loadGameState = (initialData: Board): GameState => {
  // 구현 내용은 동일
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
        parsedState.initialBoard.length === 81 &&
        (parsedState.mode === GameMode.PRE_START || parsedState.mode === GameMode.PLAYING)
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
    mode: GameMode.PRE_START, // 기본값은 시작 전 상태
  };
};

/**
 * 게임 상태를 localStorage에 저장
 * @param state 저장할 게임 상태
 */
const saveGameState = (state: GameState) => {
  localStorage.setItem("sudokuGameState", JSON.stringify(state));
};

const SudokuBoard: React.FC = () => {
  const defaultInitialData: Board = [
    // 기본 스도쿠 퍼즐 데이터
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

  // 상태 관리
  const [gameState, setGameState] = useState<GameState>(() =>
    loadGameState(defaultInitialData)
  );
  const [isMemoMode, setIsMemoMode] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  // 게임 상태 분해
  const { board, memoBoard, revealedBoard, initialBoard, mode } = gameState;

  // useEffect: 게임 상태 변경 시 저장
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // 셀 관련 이벤트 핸들러
  /**
   * 셀 선택 핸들러
   * 시작 전 상태에서는 셀 공개, 시작 후 상태에서는 셀 선택
   * @param index 선택할 셀의 인덱스
   */
  const handleCellSelect = (index: number) => {
    if (mode === GameMode.PRE_START) {
      handleCellReveal(index);
    } else {
      setSelectedCell(index);
    }
  };

  /**
   * 셀 공개 핸들러
   * 시작 전 상태에서만 동작
   * @param index 공개할 셀의 인덱스
   */
  const handleCellReveal = (index: number) => {
    if (mode !== GameMode.PRE_START || revealedBoard[index]) return;

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

  // 입력 관련 이벤트 핸들러
  /**
   * 셀 값 변경 핸들러
   * 시작 후 상태에서만 동작
   * @param index 변경할 셀의 인덱스
   * @param value 변경할 값
   */
  const handleCellChange = (index: number, value: number | null) => {
    if (mode !== GameMode.PLAYING || isMemoMode || !revealedBoard[index]) return;

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

  /**
   * 메모 토글 핸들러
   * 시작 후 상태에서만 동작
   * @param index 메모를 토글할 셀의 인덱스
   * @param memoNum 토글할 메모 번호 (1-9)
   */
  const toggleMemo = (index: number, memoNum: number) => {
    if (mode !== GameMode.PLAYING || !revealedBoard[index] || board[index] !== null) return;

    const newMemoBoard = [...memoBoard];
    const memoIndex = memoNum - 1;
    newMemoBoard[index][memoIndex] = !newMemoBoard[index][memoIndex];

    setGameState((prev) => ({
      ...prev,
      memoBoard: newMemoBoard,
    }));
  };

  /**
   * 키보드 이벤트 핸들러
   * 시작 후 상태에서만 동작
   * @param e 키보드 이벤트
   * @param index 이벤트가 발생한 셀의 인덱스
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (mode !== GameMode.PLAYING) return;
    if (e.shiftKey && /[1-9]/.test(e.key)) {
      e.preventDefault();
      toggleMemo(index, Number(e.key));
    } else if (/[1-9]/.test(e.key)) {
      e.preventDefault();
      handleCellChange(index, Number(e.key));
    }
  };

  // 게임 제어 관련 핸들러
  /**
   * 숫자 패드 클릭 핸들러
   * 시작 후 상태에서만 동작
   * @param num 클릭된 숫자
   */
  const handleNumberPadClick = (num: number) => {
    if (mode !== GameMode.PLAYING || selectedCell === null) return;
    if (isMemoMode) {
      toggleMemo(selectedCell, num);
    } else {
      handleCellChange(selectedCell, num);
    }
  };

  /**
   * 메모 모드 토글 핸들러
   */
  const toggleMemoMode = () => {
    if (mode === GameMode.PLAYING) {
      setIsMemoMode(!isMemoMode);
    }
  };

  /**
   * 게임 시작 핸들러
   */
  const startGame = () => {
    setGameState((prev) => ({
      ...prev,
      mode: GameMode.PLAYING,
    }));
  };

  /**
   * 새 게임 시작 핸들러
   */
  const startNewGame = () => {
    const newState = {
      board: Array(81).fill(null),
      memoBoard: Array(81).fill(null).map(() => Array(9).fill(false)),
      revealedBoard: Array(81).fill(false),
      initialBoard: defaultInitialData,
      mode: GameMode.PRE_START,
    };
    setGameState(newState);
    saveGameState(newState);
    setSelectedCell(null);
  };

  // JSX 리턴
  return (
    <div className="text-center mt-5">
      <h1 className="text-2xl font-bold mb-2">Sudoku Game</h1>
      <div className="flex justify-center gap-2 mb-3">
        {mode === GameMode.PRE_START ? (
          <button
            onClick={startGame}
            className="px-4 py-2 bg-green-300 hover:bg-green-400 border border-green-500 rounded-md transition-colors"
          >
            Start Game
          </button>
        ) : (
          <button
            onClick={toggleMemoMode}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 border border-gray-500 rounded-md transition-colors"
            disabled={mode !== GameMode.PLAYING}
          >
            {isMemoMode ? "Memo Mode: ON" : "Memo Mode: OFF"}
          </button>
        )}
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
                selectedCell === index && mode === GameMode.PLAYING
                  ? "bg-yellow-200"
                  : ""
              }`}
              onClick={() => handleCellSelect(index)}
            >
              {revealedBoard[index] ? (
                cell !== null ? (
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) =>
                      handleCellChange(
                        index,
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-full h-full text-center text-xl border-none bg-transparent focus:outline-none focus:bg-yellow-300"
                    maxLength={1}
                    readOnly={mode !== GameMode.PLAYING || isMemoMode}
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
                          if (mode === GameMode.PLAYING && isMemoMode)
                            toggleMemo(index, memoIndex + 1);
                        }}
                      >
                        {isMemo ? memoIndex + 1 : ""}
                      </span>
                    ))}
                    <input
                      type="text"
                      value=""
                      onChange={(e) =>
                        mode === GameMode.PLAYING &&
                        !isMemoMode &&
                        handleCellChange(
                          index,
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="absolute opacity-0 w-full h-full text-center border-none bg-transparent focus:outline-none"
                      maxLength={1}
                      readOnly={mode !== GameMode.PLAYING || isMemoMode}
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
              disabled={mode !== GameMode.PLAYING || selectedCell === null}
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
