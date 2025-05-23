/**
 * 스도쿠 게임 타입 정의
 */

// 게임 모드 열거형
export enum GameMode {
  PRE_START = 'PRE_START',  // 게임 시작 전 준비 상태
  PLAYING = 'PLAYING',      // 게임 진행 중
  COMPLETED = 'COMPLETED',  // 게임 완료
}

// 난이도 레벨
export enum DifficultyLevel {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
  EXPERT = 4,
  EVIL = 5,
}

// 셀 상태 타입
export type CellStatus = {
  value: number;       // 셀의 값 (0은 빈 셀)
  revealed: boolean;   // 공개된 셀인지 여부
  isFixed: boolean;    // 고정된 값인지 (처음 제시된 숫자)
  isSelected: boolean; // 현재 선택된 셀인지
  isError: boolean;    // 오류가 있는 셀인지
  memos: number[];     // 메모 값들
};

// 게임 상태 타입
export type GameState = {
  mode: GameMode;                  // 현재 게임 모드
  sudokuNumber: CellStatus[];      // 각 셀의 상태
  difficulty: DifficultyLevel;     // 게임 난이도
  startTime: number | null;        // 게임 시작 시간
  endTime: number | null;          // 게임 종료 시간
  revealedBoard: number[];         // 공개된 보드 (힌트)
  solution: number[] | null;       // 솔루션
  isLoading: boolean;              // 로딩 상태
};

// 셀 메모 타입
export interface CellMemo {
  rowIndex: number;
  colIndex: number;
  numbers: number[];
}
