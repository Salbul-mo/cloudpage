'use client';

/**
 * useSudokuGame - 커스텀 훅
 * 
 * 이 훅은 수독 게임의 핵심 로직을 관리합니다:
 * - 게임 상태 (게임판, 선택된 셀, 게임 모드)
 * - 사용자 상호작용 (셀 선택, 숫자 입력, 메모 모드)
 * - 게임 흐름 (새 게임, 게임 시작)
 * - 상태 저장 (localStorage에 게임 상태 저장)
 * 
 * 데이터 흐름:
 * 1. localStorage에서 게임 상태를 로드하거나 새 게임 생성
 * 2. 컴포넌트에 상태와 핸들러 함수 노출
 * 3. 사용자 상호작용에 따른 상태 업데이트
 * 4. 상태 변경 시 localStorage에 저장
 */

import { useState, useCallback, useEffect } from 'react';
import { GameState, GameMode } from './types';
import { sudokuCreator } from './sudokuUtils';

type SudokuNumber = (number | null)[];

const useSudokuGame = () => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') {
        return {
            gameState: createInitialState(sudokuCreator()),
            isMemoMode: false,
            selectedCell: null,
            isActive: Array(81).fill([false, false]),
            handleCellSelect: () => {},
            handleNumberPadClick: () => {},
            toggleMemoMode: () => {},
            startNewGame: () => {},
            startGame: () => {}
        };
    }

    // 게임 상태 관리
    const [gameState, setGameState] = useState<GameState>(() => loadGameState());

    // 게임판 초기화
    useEffect(() => {
        if (!gameState.sudokuNumber.length) {
            const initialBoard = sudokuCreator();
            setGameState(prev => ({
                ...prev,
                sudokuNumber: initialBoard,
                initialBoard: initialBoard,
                revealedBoard: Array(81).fill(false)
            }));
        }
    }, []); // 빈 의존성 배열을 사용하여 한 번만 실행
    
    // UI 상태 관리
    const [isMemoMode, setIsMemoMode] = useState(false);
    const [selectedCell, setSelectedCell] = useState<number | null>(null);
    const [isActive, setIsActive] = useState<boolean[][]>(Array(81).fill([false, false]));

    const { sudokuNumber, memoBoard, revealedBoard, initialBoard, mode } = gameState;

    /**
     * 게임 상태 구조:
     * - sudokuNumber: 현재 게임판 상태 (81개 셀)
     * - memoBoard: 메모 노트 (81x9 boolean 매트릭스)
     * - revealedBoard: 공개된 셀 (81개 boolean)
     * - initialBoard: 초기 퍼즐 (리셋/검증용)
     * - mode: 현재 게임 모드 (PRE_START 또는 PLAYING)
     */

    /**
     * Effect: 게임 상태 자동 저장
     * 
     * 실행 조건:
     * - gameState가 변경될 때마다 실행
     * - 현재 게임 상태를 localStorage에 저장
     */
    useEffect(() => {
        saveGameState(gameState);
    }, [gameState]);

    /**
     * Highlights related cells based on the selected cell
     * 
     * Highlighting rules:
     * - Same row
     * - Same column
     * - Same 3x3 box
     * - Cells with the same number
     * 
     * @param index - Index of the selected cell (0-80)
     */
    const highlightRelatedCells = useCallback((index: number) => {
        if (mode !== GameMode.PLAYING) return;
    
        console.log("highlightRelatedCells", index);

        // Initialize all cells as inactive
        const newActive = Array(81).fill([false, false]);
        
        // Calculate position information
        const row = Math.floor(index / 9);
        console.log("row", row);
        const col = index % 9;
        console.log("col", col);
        const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
        console.log("box", box);
        const value = sudokuNumber[index];
        console.log("value", value);

        // Check each cell to see if it should be highlighted
        for (let i = 0; i < 81; i++) {
            const currentRow = Math.floor(i / 9);
            const currentCol = i % 9;
            const currentBox = Math.floor(currentRow / 3) * 3 + Math.floor(currentCol / 3);
            
            // Check if cell is in same row, column, box, or has same value
            if (currentRow === row || currentCol === col || currentBox === box || 
                (value !== null && sudokuNumber[i] === value)) {
                // [isHighlighted, isSelected]
                newActive[i] = [true, i === index];
            }
        }
        setIsActive(newActive);
    }, [mode, sudokuNumber]);

    const handleCellReveal = useCallback((index: number) => {
        if (mode !== GameMode.PRE_START || revealedBoard[index]) return;

        const newRevealedBoard = [...revealedBoard];
        newRevealedBoard[index] = true;
        
        const newSudokuNumber = [...sudokuNumber];
        if (initialBoard[index] !== null) {
            newSudokuNumber[index] = initialBoard[index];
        }
        
        setGameState(prev => ({
            ...prev,
            sudokuNumber: newSudokuNumber,
            revealedBoard: newRevealedBoard,
        }));
    }, [mode, revealedBoard, sudokuNumber, initialBoard]);

    const handleCellSelect = useCallback((index: number) => {
        if (mode === GameMode.PRE_START) {
            handleCellReveal(index);
        } else {
            setSelectedCell(index);
            highlightRelatedCells(index);
        }
    }, [mode, handleCellReveal, highlightRelatedCells]);

    const handleCellChange = useCallback((index: number, value: number | null) => {
        if (mode !== GameMode.PLAYING || isMemoMode || !revealedBoard[index]) return;

        const newSudokuNumber = [...sudokuNumber];
        newSudokuNumber[index] = value;

        const newMemoBoard = [...memoBoard];
        if (value !== null) {
            newMemoBoard[index] = Array(9).fill(false);
        }

        setGameState(prev => ({
            ...prev,
            sudokuNumber: newSudokuNumber,
            memoBoard: newMemoBoard,
        }));
    }, [mode, isMemoMode, revealedBoard, sudokuNumber, memoBoard]);

    const toggleMemo = useCallback((index: number, memoNum: number) => {
        if (mode !== GameMode.PLAYING || !revealedBoard[index] || sudokuNumber[index] !== null) return;

        const newMemoBoard = [...memoBoard];
        const memoIndex = memoNum - 1;
        newMemoBoard[index][memoIndex] = !newMemoBoard[index][memoIndex];

        setGameState(prev => ({
            ...prev,
            memoBoard: newMemoBoard,
        }));
    }, [mode, revealedBoard, sudokuNumber, memoBoard]);

    const toggleMemoMode = useCallback(() => {
        if (mode === GameMode.PLAYING) {
            setIsMemoMode(prev => !prev);
        }
    }, [mode]);

    const startNewGame = useCallback(() => {
        const newPuzzle = sudokuCreator();
        const newState = {
            sudokuNumber: [...newPuzzle],
            memoBoard: Array(81).fill(null).map(() => Array(9).fill(false)),
            revealedBoard: Array(81).fill(false),
            initialBoard: [...newPuzzle],
            mode: GameMode.PRE_START,
        };
        setGameState(newState);
        setIsMemoMode(false);
        setSelectedCell(null);
        setIsActive(Array(81).fill([false, false]));
    }, []);

    const startGame = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            mode: GameMode.PLAYING
        }));
    }, []);

    const handleNumberPadClick = useCallback((num: number) => {
        if (mode !== GameMode.PLAYING || selectedCell === null) return;

        if (isMemoMode) {
            toggleMemo(selectedCell, num);
        } else {
            handleCellChange(selectedCell, num);
        }
    }, [mode, selectedCell, isMemoMode, toggleMemo, handleCellChange]);

    return {
        gameState,
        isMemoMode,
        selectedCell,
        isActive,
        handleCellSelect,
        handleNumberPadClick,
        toggleMemoMode,
        startNewGame,
        startGame,
        setSelectedCell,
        setIsActive
    };
}

const loadGameState = (): GameState => {
    try {
        const savedState = localStorage.getItem('sudokuGameState');
        if (savedState) {
            return JSON.parse(savedState);
        }
        return createInitialState(sudokuCreator()); // 빈 배열로 초기 상태 생성
    } catch (error) {
        console.error('Error loading game state:', error);
        return createInitialState(sudokuCreator()); // 에러 발생 시 빈 배열로 초기 상태 생성
    }
};

// Save game state to localStorage
const saveGameState = (state: GameState) => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('sudokuGameState', JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    }
};

// Create initial game state
const createInitialState = (initialData: SudokuNumber): GameState => ({
    sudokuNumber: [...initialData],
    memoBoard: Array(81).fill(null).map(() => Array(9).fill(false)),
    revealedBoard: Array(81).fill(false),
    initialBoard: [...initialData],
    mode: GameMode.PRE_START,
});

export default useSudokuGame;
