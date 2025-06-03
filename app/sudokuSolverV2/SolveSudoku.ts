/**
 * 스도쿠 퍼즐을 해결하는 함수
 * @param board 9x9 2차원 숫자 배열 (0은 빈 칸)
 * @returns 해결된 스도쿠 보드
 */
function SolveSudoku(board: number[][]): number[][] {
    // 보드의 깊은 복사본 생성
    const solution = board.map(row => [...row]);
    
    // 백트래킹을 사용하여 퍼즐 풀기
    function solve(): boolean {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                // 빈 칸 찾기
                if (solution[row][col] === 0) {
                    // 1부터 9까지 시도
                    for (let num = 1; num <= 9; num++) {
                        // 현재 숫자가 유효한지 확인
                        if (isValid(row, col, num)) {
                            // 유효하면 숫자 배치
                            solution[row][col] = num;
                            
                            // 재귀적으로 다음 빈 칸 풀기
                            if (solve()) {
                                return true;
                            }
                            
                            // 백트래킹: 유효한 해가 없으면 되돌리기
                            solution[row][col] = 0;
                        }
                    }
                    // 모든 숫자를 시도했는데 해를 찾지 못한 경우
                    return false;
                }
            }
        }
        // 모든 칸이 채워진 경우
        return true;
    }
    
    // 숫자 배치가 유효한지 확인하는 함수
    function isValid(row: number, col: number, num: number): boolean {
        // 행 검사
        for (let x = 0; x < 9; x++) {
            if (solution[row][x] === num) return false;
        }
        
        // 열 검사
        for (let x = 0; x < 9; x++) {
            if (solution[x][col] === num) return false;
        }
        
        // 3x3 박스 검사
        const boxRowStart = Math.floor(row / 3) * 3;
        const boxColStart = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (solution[boxRowStart + i][boxColStart + j] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // 풀이 시작
    solve();
    return solution;
}

export default SolveSudoku;
