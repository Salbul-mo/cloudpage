/**
 * 스도쿠 퍼즐을 풀어주는 함수
 * @param puzzle 81 길이의 숫자 배열 (0은 빈 칸)
 * @returns 해결된 스도쿠 퍼즐 (81 길이의 숫자 배열)
 */
export function solvePuzzle(puzzle: number[]): number[];

/**
 * 스도쿠 퍼즐의 유효성을 검사하는 함수
 * @param puzzle 검사할 스도쿠 퍼즐 (81 길이의 숫자 배열)
 * @returns 퍼즐이 유효하면 true, 그렇지 않으면 false
 */
export function isValidPuzzle(puzzle: number[]): boolean;
