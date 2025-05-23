// Game state types
export type SudokuNumber = (number | null)[];
export type CellMemo = boolean[];
export type MemoBoard = CellMemo[];
export type RevealedBoard = boolean[];

// Game mode
export enum GameMode {
    PRE_START = "PRE_START",
    PLAYING = "PLAYING"
}

// Game state interface
export interface GameState {
    sudokuNumber: SudokuNumber;
    memoBoard: MemoBoard;
    revealedBoard: RevealedBoard;
    initialBoard: SudokuNumber;
    mode: GameMode;
}

// Props interfaces
export interface NumberBoxProps {
    value: number | null;
    index: number;
    isActive: boolean[];
    id: string;
    box: number;
    row: number;
    col: number;
    className: string;
    onBoxClick: (e: React.MouseEvent) => void;
    isRevealed: boolean;
}

export interface SudokuBoardProps {
    sudokuNumber: SudokuNumber;
    isActive: boolean[][];
    setActive: (active: boolean[][]) => void;
    onPlay: () => void;
    gameMode: GameMode;
    onCellClick: (index: number) => void;
    revealedBoard: RevealedBoard;
}

export interface NumberPadProps {
    onNumberClick: (num: number) => void;
    onToggleMemo: () => void;
    isMemoMode: boolean;
    onNewGame: () => void;
    gameMode: GameMode;
}

// Utility types
export type ConstraintFunction = (row: number, dim: number) => number;
