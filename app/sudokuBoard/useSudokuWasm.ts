"use client";

import { useState, useEffect, useCallback } from 'react';
import { GameMode, DifficultyLevel, GameState, CellStatus } from './types';
import { 
  generateSudoku, 
  solveSudoku, 
  validateSudoku,
  hasUniqueSolution,
  getSudokuDifficulty
} from './wasmModule';

/**
 * WASM을 사용한 스도쿠 게임 로직 훅
 */
export default function useSudokuWasm() {
  // 게임 상태 관리
  const [gameState, setGameState] = useState<GameState>({
    mode: GameMode.PRE_START,
    sudokuNumber: Array(81).fill(null).map(() => ({
      value: 0,
      revealed: false,
      isFixed: false,
      isSelected: false,
      isError: false,
      memos: []
    })),
    difficulty: DifficultyLevel.MEDIUM,
    startTime: null,
    endTime: null,
    revealedBoard: Array(81).fill(0),
    solution: null,
    isLoading: false
  });

  // 선택된 셀 관리
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  
  // 메모 모드 상태
  const [isMemoMode, setIsMemoMode] = useState<boolean>(false);
  
  // 셀 활성화 상태
  const [isActive, setIsActive] = useState<boolean>(true);

  // 게임 상태 업데이트 헬퍼 함수
  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  // 새 게임 시작
  const startNewGame = useCallback(async (difficulty: DifficultyLevel = DifficultyLevel.MEDIUM) => {
    updateGameState({ isLoading: true });
    
    try {
      // WASM으로 새 스도쿠 퍼즐 생성
      const newPuzzle = await generateSudoku(9, difficulty);
      
      if (!newPuzzle) {
        throw new Error("스도쿠 퍼즐 생성에 실패했습니다.");
      }
      
      // 솔루션 계산
      const solution = await solveSudoku(newPuzzle);
      
      if (!solution) {
        throw new Error("스도쿠 솔루션 계산에 실패했습니다.");
      }
      
      // 셀 상태 초기화
      const newSudokuNumber: CellStatus[] = Array(81).fill(null).map((_, index) => {
        const value = newPuzzle[index];
        return {
          value: value,
          revealed: value > 0,
          isFixed: value > 0,
          isSelected: false,
          isError: false,
          memos: []
        };
      });
      
      // 게임 상태 업데이트
      updateGameState({
        mode: GameMode.PLAYING,
        sudokuNumber: newSudokuNumber,
        difficulty,
        startTime: Date.now(),
        endTime: null,
        revealedBoard: [...newPuzzle],
        solution,
        isLoading: false
      });
      
      // 선택된 셀 초기화
      setSelectedCell(null);
      setIsMemoMode(false);
      
    } catch (error) {
      console.error("게임 시작 중 오류 발생:", error);
      updateGameState({ isLoading: false });
    }
  }, [updateGameState]);
  
  // 셀 선택 처리
  const handleCellSelect = useCallback((cellIndex: number) => {
    if (gameState.mode !== GameMode.PLAYING) return;
    
    // 이미 고정된 셀이면 선택 불가
    if (gameState.sudokuNumber[cellIndex].isFixed) return;
    
    // 이전 선택된 셀의 강조 제거
    const updatedNumbers = gameState.sudokuNumber.map(cell => ({
      ...cell,
      isSelected: false
    }));
    
    // 새로 선택된 셀 강조
    updatedNumbers[cellIndex] = {
      ...updatedNumbers[cellIndex],
      isSelected: true
    };
    
    updateGameState({ sudokuNumber: updatedNumbers });
    setSelectedCell(cellIndex);
  }, [gameState, updateGameState]);
  
  // 숫자 패드 클릭 처리
  const handleNumberPadClick = useCallback((number: number) => {
    if (selectedCell === null || gameState.mode !== GameMode.PLAYING) return;
    
    // 메모 모드인 경우
    if (isMemoMode) {
      const updatedNumbers = [...gameState.sudokuNumber];
      const currentCell = updatedNumbers[selectedCell];
      
      // 메모 배열 업데이트
      let updatedMemos = [...currentCell.memos];
      
      if (number === 0) {
        // 지우기 기능
        updatedMemos = [];
      } else {
        // 메모 토글
        const memoIndex = updatedMemos.indexOf(number);
        if (memoIndex === -1) {
          updatedMemos.push(number);
        } else {
          updatedMemos.splice(memoIndex, 1);
        }
      }
      
      updatedNumbers[selectedCell] = {
        ...currentCell,
        memos: updatedMemos
      };
      
      updateGameState({ sudokuNumber: updatedNumbers });
    } 
    // 일반 입력 모드
    else {
      const updatedNumbers = [...gameState.sudokuNumber];
      const currentCell = updatedNumbers[selectedCell];
      
      // 셀 값 업데이트
      updatedNumbers[selectedCell] = {
        ...currentCell,
        value: number,
        revealed: number > 0,
        memos: []  // 값을 입력하면 메모 초기화
      };
      
      updateGameState({ sudokuNumber: updatedNumbers });
      
      // 게임 완료 체크
      checkGameCompletion(updatedNumbers);
    }
  }, [selectedCell, gameState, isMemoMode, updateGameState]);
  
  // 게임 완료 체크
  const checkGameCompletion = useCallback(async (currentBoard: CellStatus[]) => {
    // 모든 셀이 채워졌는지 확인
    const allFilled = currentBoard.every(cell => cell.value > 0);
    if (!allFilled) return;
    
    // 플레이어의 현재 보드 추출
    const playerBoard = currentBoard.map(cell => cell.value);
    
    // WASM으로 보드 검증
    const isValid = await validateSudoku(playerBoard);
    
    if (isValid) {
      updateGameState({
        mode: GameMode.COMPLETED,
        endTime: Date.now()
      });
    }
  }, [updateGameState]);
  
  // 메모 모드 토글
  const toggleMemoMode = useCallback(() => {
    setIsMemoMode(prev => !prev);
  }, []);
  
  // 컴포넌트 마운트 시 새 게임 시작
  useEffect(() => {
    startNewGame(DifficultyLevel.MEDIUM);
  }, [startNewGame]);

  return {
    gameState,
    isMemoMode,
    selectedCell,
    isActive,
    handleCellSelect,
    handleNumberPadClick,
    toggleMemoMode,
    startNewGame,
    setIsActive
  };
}
