import SolveSudoku from './SolveSudoku';

/**
 * 스도쿠 퍼즐을 풀어주는 함수
 * @param puzzle 81 길이의 숫자 배열 (0은 빈 칸)
 * @returns 해결된 스도쿠 퍼즐 (81 길이의 숫자 배열)
 */
export function solvePuzzle(puzzle: number[]): number[] {
    // 1차원 배열을 9x9 2차원 배열로 변환
    const grid: number[][] = [];
    for (let i = 0; i < 9; i++) {
        grid.push(puzzle.slice(i * 9, (i + 1) * 9));
    }

    // SolveSudoku 함수로 풀이
    const solvedGrid = SolveSudoku(grid);
    
    // 2차원 배열을 1차원 배열로 변환하여 반환
    return solvedGrid.flat();
}

/**
 * 스도쿠 퍼즐의 유효성을 검사하는 함수
 * @param puzzle 검사할 스도쿠 퍼즐 (81 길이의 숫자 배열)
 * @returns 퍼즐이 유효하면 true, 그렇지 않으면 false
 */
export function isValidPuzzle(puzzle: number[]): boolean {
    // 길이 검사
    if (puzzle.length !== 81) return false;
    
    // 각 셀이 0~9 사이의 숫자인지 검사
    if (!puzzle.every(num => num >= 0 && num <= 9)) {
        return false;
    }
    
    // 2차원 배열로 변환
    const grid: number[][] = [];
    for (let i = 0; i < 9; i++) {
        grid.push(puzzle.slice(i * 9, (i + 1) * 9));
    }
    
    // 행, 열, 박스 검사
    for (let i = 0; i < 9; i++) {
        const row = new Set<number>();
        const col = new Set<number>();
        const box = new Set<number>();
        
        for (let j = 0; j < 9; j++) {
            // 행 검사
            const rowVal = grid[i][j];
            if (rowVal !== 0 && row.has(rowVal)) return false;
            row.add(rowVal);
            
            // 열 검사
            const colVal = grid[j][i];
            if (colVal !== 0 && col.has(colVal)) return false;
            col.add(colVal);
            
            // 박스 검사
            const boxRow = 3 * Math.floor(i / 3) + Math.floor(j / 3);
            const boxCol = 3 * (i % 3) + (j % 3);
            const boxVal = grid[boxRow][boxCol];
            if (boxVal !== 0 && box.has(boxVal)) return false;
            box.add(boxVal);
        }
    }
    
    return true;
}
