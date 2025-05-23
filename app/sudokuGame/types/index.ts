// Game state types
export type CellMemo = boolean[]
export type SudokuNumber = number[]
export type MemoBoard = CellMemo[]
export type RevealedBoard = boolean[]

// Game mode enum
export enum GameMode {
    PRE_START = "PRE_START",
    PLAYING = "PLAYING"
}

// Game state interface
export interface GameState {
    sudokuNumber: SudokuNumber
    memoBoard: MemoBoard
    revealedBoard: RevealedBoard
    initialBoard: SudokuNumber
    mode: GameMode
    solution?: number[]
}

// DLX Algorithm types
export interface DL_Node {
    row: number
    col: number
    count: number
    matrix: DL_Matrix
    up: DL_Node
    down: DL_Node
    left: DL_Node
    right: DL_Node
    insertNode: (row: number, col: number) => DL_Node
}

export interface DL_Matrix {
    root: DL_Node
    rows: DL_Node[]
    cols: DL_Node[]
    solved: boolean
    selectMinCol: () => DL_Node
    isEmpty: () => boolean
    cover: (node: DL_Node) => void
    uncover: (node: DL_Node) => void
    alg_x_search: () => Generator<number, void, unknown>
    search: () => number[]
}

export interface SearchStack {
    items: DL_Node[]
    push: (element: DL_Node) => void
    pop: () => DL_Node | undefined
    peek: () => DL_Node | undefined
    isEmpty: () => boolean
    size: () => number
}

// Component props
export interface NumberBoxProps {
    value: number | null
    index: number
    isActive: boolean[]
    id: string
    box: number
    row: number
    col: number
    className: string
    onBoxClick: (e: React.MouseEvent) => void
}

export interface SudokuBoardProps {
    sudokuNumber: SudokuNumber
    isActive: boolean[][]
    setActive: (active: boolean[][]) => void
    onPlay: () => void
    gameMode: GameMode
    onCellClick: (index: number) => void
    revealedBoard: RevealedBoard
    solution: number[]
}

export interface GameControlsProps {
    gameMode: GameMode
    onStartGame: () => void
    onNewGame: () => void
    onToggleMemo: () => void
    isMemoMode: boolean
}

// Utility types
export type NumberBoxComponent = React.FC<NumberBoxProps>;
export type SudokuBoardComponent = React.FC<SudokuBoardProps>;
export type GameControlsComponent = React.FC<GameControlsProps>;
