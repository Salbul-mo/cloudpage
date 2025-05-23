/**
 * WebAssembly 스도쿠 모듈 인터페이스
 * C 코드로 작성된 스도쿠 솔버와 생성기를 JavaScript에서 사용하기 위한 인터페이스
 */

// WASM 모듈 타입 정의
export interface SudokuWasmModule {
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  _allocate_sudoku_array: (dim: number) => number;
  _free_sudoku_array: (ptr: number) => void;
  _set_sudoku_value: (ptr: number, index: number, value: number) => void;
  _get_sudoku_value: (ptr: number, index: number) => number;
  _solve_sudoku: (puzzlePtr: number, dim: number, solutionPtr: number) => number;
  _validate_sudoku: (solutionPtr: number, dim: number) => number;
  _has_unique_sudoku_solution: (puzzlePtr: number, dim: number) => number;
  _get_sudoku_difficulty: (puzzlePtr: number, dim: number) => number;
  _generate_sudoku: (puzzlePtr: number, dim: number, difficulty: number) => number;
  HEAPU32: Uint32Array;
}

let wasmModule: SudokuWasmModule | null = null;
let isWasmLoaded = false;
let loadPromise: Promise<SudokuWasmModule> | null = null;

/**
 * WASM 모듈 로드 함수
 * 최초 호출 시 WASM 모듈을 로드하고, 이후 호출 시 캐시된 모듈 반환
 */
export const loadWasmModule = async (): Promise<SudokuWasmModule> => {
  if (isWasmLoaded && wasmModule) {
    console.log('[WASM] Using cached module');
    return wasmModule;
  }

  if (loadPromise) {
    console.log('[WASM] Using existing load promise');
    return loadPromise;
  }

  console.log('[WASM] Starting to load WASM module');
  loadPromise = new Promise<SudokuWasmModule>((resolve, reject) => {
    try {
      // WASM 모듈 중복 로드 방지를 위한 검사
      const existingScript = document.querySelector('script[src="/sudoku-wasm.js"]');
      if (existingScript) {
        console.log('[WASM] Script already exists in the document');
        // 기존 스크립트가 있으면 제거
        existingScript.remove();
      }
      
      // 타임아웃 설정
      const timeout = setTimeout(() => {
        console.error('[WASM] Module loading timeout');
        reject(new Error('WASM module loading timeout'));
      }, 15000); // 15초로 늘림
      
      // 간소화된 방식으로 모듈 설정
      // @ts-ignore
      window.Module = {
        onRuntimeInitialized: function() {
          console.log('[WASM] Runtime initialized successfully');
          clearTimeout(timeout);
          // @ts-ignore
          wasmModule = window.Module as SudokuWasmModule;
          if (wasmModule) {
            console.log('[WASM] Module initialization complete');
            const availableFunctions = Object.keys(wasmModule)
              .filter(key => key.startsWith('_'));
            console.log('[WASM] Available functions:', availableFunctions);
            
            isWasmLoaded = true;
            resolve(wasmModule);
          } else {
            const error = new Error('Module is null after initialization');
            console.error('[WASM]', error);
            reject(error);
          }
        },
        print: function(text: string) {
          console.log('[WASM stdout]', text);
        },
        printErr: function(text: string) {
          console.error('[WASM stderr]', text);
        },
        // 경로 지정 함수
        locateFile: function(path: string) {
          console.log('[WASM] Locating file:', path);
          if (path.endsWith('.wasm')) {
            return `/sudoku-wasm.wasm`; // 정확한 경로 지정
          }
          return path;
        }
      };
      
      // 스크립트 요소 생성 및 추가
      const script = document.createElement('script');
      script.src = '/sudoku-wasm.js';
      script.async = true;
      
      script.onload = () => {
        console.log('[WASM] Script loaded successfully');
      };
      
      script.onerror = (e) => {
        console.error('[WASM] Script loading error:', e);
        clearTimeout(timeout);
        reject(new Error('Failed to load WASM module'));
      };
      
      console.log('[WASM] Appending script to body');
      document.body.appendChild(script);
      
    } catch (error) {
      console.error('[WASM] Setup error:', error);
      reject(error);
    }
  });

  return loadPromise;
};

/**
 * 스도쿠 보드 배열을 WASM 메모리에 전달
 */
export const setWasmSudokuBoard = (
  wasmModule: SudokuWasmModule, 
  board: number[], 
  dim: number = 9
): number => {
  const boardPtr = wasmModule._allocate_sudoku_array(dim);
  
  for (let i = 0; i < dim * dim; i++) {
    wasmModule._set_sudoku_value(boardPtr, i, board[i] || 0);
  }
  
  return boardPtr;
};

/**
 * WASM 메모리에서 스도쿠 보드 배열 가져오기
 */
export const getWasmSudokuBoard = (
  wasmModule: SudokuWasmModule, 
  boardPtr: number, 
  dim: number = 9
): number[] => {
  const board: number[] = [];
  
  for (let i = 0; i < dim * dim; i++) {
    board.push(wasmModule._get_sudoku_value(boardPtr, i));
  }
  
  return board;
};

/**
 * 스도쿠 퍼즐 풀기
 */
export const solveSudoku = async (board: number[], dim: number = 9): Promise<number[] | null> => {
  const wasm = await loadWasmModule();
  
  const puzzlePtr = setWasmSudokuBoard(wasm, board, dim);
  const solutionPtr = wasm._allocate_sudoku_array(dim);
  
  const result = wasm._solve_sudoku(puzzlePtr, dim, solutionPtr);
  
  let solution: number[] | null = null;
  if (result === 1) {
    solution = getWasmSudokuBoard(wasm, solutionPtr, dim);
  }
  
  wasm._free_sudoku_array(puzzlePtr);
  wasm._free_sudoku_array(solutionPtr);
  
  return solution;
};

/**
 * 스도쿠 퍼즐 생성
 * difficulty: 1(쉽움), 2(중간), 3(어려움), 4(전문가), 5(매우 어려움)
 */
export const generateSudoku = async (dim: number = 9, difficulty: number = 2): Promise<number[] | null> => {
  console.log('[generateSudoku] 시작: 차원=', dim, '난이도=', difficulty);
  
  // 기본 스도쿠 퍼즐 데이터 (9x9)
  // 0은 비어 있는 셀을 나타냄
  const defaultEasySudoku = [
    5, 3, 0, 0, 7, 0, 0, 0, 0,
    6, 0, 0, 1, 9, 5, 0, 0, 0,
    0, 9, 8, 0, 0, 0, 0, 6, 0,
    8, 0, 0, 0, 6, 0, 0, 0, 3,
    4, 0, 0, 8, 0, 3, 0, 0, 1,
    7, 0, 0, 0, 2, 0, 0, 0, 6,
    0, 6, 0, 0, 0, 0, 2, 8, 0,
    0, 0, 0, 4, 1, 9, 0, 0, 5,
    0, 0, 0, 0, 8, 0, 0, 7, 9
  ];
  
  const defaultMediumSudoku = [
    0, 0, 0, 2, 6, 0, 7, 0, 1,
    6, 8, 0, 0, 7, 0, 0, 9, 0,
    1, 9, 0, 0, 0, 4, 5, 0, 0,
    8, 2, 0, 1, 0, 0, 0, 4, 0,
    0, 0, 4, 6, 0, 2, 9, 0, 0,
    0, 5, 0, 0, 0, 3, 0, 2, 8,
    0, 0, 9, 3, 0, 0, 0, 7, 4,
    0, 4, 0, 0, 5, 0, 0, 3, 6,
    7, 0, 3, 0, 1, 8, 0, 0, 0
  ];
  
  const defaultHardSudoku = [
    0, 2, 0, 6, 0, 8, 0, 0, 0,
    5, 8, 0, 0, 0, 9, 7, 0, 0,
    0, 0, 0, 0, 4, 0, 0, 0, 0,
    3, 7, 0, 0, 0, 0, 5, 0, 0,
    6, 0, 0, 0, 0, 0, 0, 0, 4,
    0, 0, 8, 0, 0, 0, 0, 1, 3,
    0, 0, 0, 0, 2, 0, 0, 0, 0,
    0, 0, 9, 8, 0, 0, 0, 3, 6,
    0, 0, 0, 3, 0, 6, 0, 9, 0
  ];
  
  // 난이도에 따른 기본 스도쿠 선택
  let defaultSudoku: number[];
  if (difficulty === 1) {
    defaultSudoku = defaultEasySudoku;
  } else if (difficulty === 3 || difficulty === 4 || difficulty === 5) {
    defaultSudoku = defaultHardSudoku;
  } else { // difficulty === 2 (default) 또는 기타 경우
    defaultSudoku = defaultMediumSudoku;
  }
  
  try {
    const wasm = await loadWasmModule();
    console.log('[generateSudoku] WASM 모듈 로드 완료');
    
    if (!wasm._allocate_sudoku_array) {
      console.error('[generateSudoku] _allocate_sudoku_array 함수가 없습니다');
      console.log('[generateSudoku] 사용 가능한 함수들:', Object.keys(wasm).filter(key => key.startsWith('_')));
      console.log('[generateSudoku] 기본 스도쿠 데이터 사용');
      return defaultSudoku;
    }
    
    const puzzlePtr = wasm._allocate_sudoku_array(dim);
    console.log('[generateSudoku] sudoku 배열 할당, 포인터=', puzzlePtr);
    
    if (!wasm._generate_sudoku) {
      console.error('[generateSudoku] _generate_sudoku 함수가 없습니다');
      wasm._free_sudoku_array(puzzlePtr);
      console.log('[generateSudoku] 기본 스도쿠 데이터 사용');
      return defaultSudoku;
    }
    
    console.log('[generateSudoku] 스도쿠 생성 시작');
    const result = wasm._generate_sudoku(puzzlePtr, dim, difficulty);
    console.log('[generateSudoku] 생성 결과=', result);
    
    let puzzle: number[] | null = null;
    if (result === 1) {
      console.log('[generateSudoku] 스도쿠 생성 성공, 보드 가져오기');
      puzzle = getWasmSudokuBoard(wasm, puzzlePtr, dim);
      console.log('[generateSudoku] 생성된 스도쿠 보드:', puzzle);
    } else {
      console.error('[generateSudoku] 스도쿠 생성 실패, 결과 코드=', result);
      console.log('[generateSudoku] 기본 스도쿠 데이터 사용');
      puzzle = defaultSudoku;
    }
    
    console.log('[generateSudoku] 메모리 해제 중');
    wasm._free_sudoku_array(puzzlePtr);
    
    return puzzle;
  } catch (error) {
    console.error('[generateSudoku] 예외 발생:', error);
    console.log('[generateSudoku] 기본 스도쿠 데이터 사용');
    return defaultSudoku;
  }
};

/**
 * 스도쿠 솔루션 검증
 */
export const validateSudoku = async (solution: number[], dim: number = 9): Promise<boolean> => {
  const wasm = await loadWasmModule();
  
  const solutionPtr = setWasmSudokuBoard(wasm, solution, dim);
  
  const result = wasm._validate_sudoku(solutionPtr, dim);
  
  wasm._free_sudoku_array(solutionPtr);
  
  return result === 1;
};

/**
 * 유일한 솔루션을 가지는지 검증
 */
export const hasUniqueSolution = async (puzzle: number[], dim: number = 9): Promise<boolean> => {
  const wasm = await loadWasmModule();
  
  const puzzlePtr = setWasmSudokuBoard(wasm, puzzle, dim);
  
  const result = wasm._has_unique_sudoku_solution(puzzlePtr, dim);
  
  wasm._free_sudoku_array(puzzlePtr);
  
  return result === 1;
};

/**
 * 스도쿠 난이도 구하기
 */
export const getSudokuDifficulty = async (puzzle: number[], dim: number = 9): Promise<number> => {
  const wasm = await loadWasmModule();
  
  const puzzlePtr = setWasmSudokuBoard(wasm, puzzle, dim);
  
  const difficulty = wasm._get_sudoku_difficulty(puzzlePtr, dim);
  
  wasm._free_sudoku_array(puzzlePtr);
  
  return difficulty;
};
