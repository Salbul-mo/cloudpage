"use client"

import React, { useEffect, useState } from 'react'

// 예제 스도쿠 퍼즐 (1차원 배열)
const EXAMPLE_PUZZLE = [
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

export default function Page() {
    // WASM 모듈 상태 관리
    const [solver, setSolver] = useState<any>(null);

    // WASM 모듈 로드
    useEffect(() => {
        const loadWasm = async () => {
            try {
                console.log('WASM 모듈을 로드 중입니다...');
                
                // Emscripten 모듈 초기화
                const Module: any = {
                    // WASM 파일을 찾는 방법 설정
                    locateFile: (path: string) => {
                        console.log('Locating file:', path);
                        return `/wasm/${path}`;
                    },
                    // 런타임 초기화 콜백
                    onRuntimeInitialized: () => {
                        console.log('WASM 런타임 초기화 완료!');
                        setSolver(Module);
                    },
                    // 오류 발생 콜백
                    onAbort: (reason: string) => {
                        console.error('WASM 런타임 중단:', reason);
                    },
                    // 오류 로깅
                    printErr: (text: string) => {
                        console.error('WASM 오류:', text);
                    },
                    // 로그 출력
                    print: (text: string) => {
                        console.log('WASM 로그:', text);
                    }
                };
                
                // 전역 변수로 Module 설정
                // @ts-ignore
                window.Module = Module;
                
                // Emscripten JS 파일 로드
                const scriptElement = document.createElement('script');
                scriptElement.src = '/wasm/sudoku_solver.js';
                scriptElement.async = true;
                scriptElement.onerror = (event) => {
                    console.error('Script 로드 실패:', event);
                };
                
                document.body.appendChild(scriptElement);
            } catch (error) {
                console.error('WASM 로드 오류:', error);
            }
        };
        
        loadWasm();
        
        // 컴포넌트 언마운트 시 스크립트 정리
        return () => {
            const script = document.querySelector('script[src="/wasm/sudoku_solver.js"]');
            if (script) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // 스도쿠 풀기
    // const handleSolve = () => {
    //     if (!solver) {
    //         console.log('WASM 모듈이 아직 로드되지 않았습니다.');
    //         return;
    //     }

    //     try {
    //         console.log('원본 스도쿠:', EXAMPLE_PUZZLE);
            
    //         // 배열을 Int32Array로 변환
    //         const boardArray = new Int32Array(EXAMPLE_PUZZLE);
            
    //         const resultPtr = solver.ccall(
    //             'solve_sudoku',
    //             'number',
    //             ['array', 'number'],
    //             [boardArray, EXAMPLE_PUZZLE.length]
    //         )
            
    //         const resultView = new Int32Array(solver.HEAP8.buffer, resultPtr, 81);
    //         const resultArray = Array.from(resultView);
    //         console.log('해결된 스도쿠:', resultArray);
            
    //     } catch (error) {
    //         console.error('스도쿠 해결 오류:', error);
    //     }
    // };
const handleSolve = () => {
    if (!solver) {
        console.log('WASM 모듈이 아직 로드되지 않았습니다.');
        return;
    }

    try {
        console.log('원본 스도쿠:', EXAMPLE_PUZZLE);
            
        // 배열을 Int32Array로 변환
        const boardArray = new Int32Array(EXAMPLE_PUZZLE);
        
        // solve_sudoku 함수 호출
        const resultPtr = solver.ccall(
            'solve_sudoku',  // 함수 이름
            'number',       // 반환 타입
            ['array', 'number'], // 인자 타입
            [boardArray, EXAMPLE_PUZZLE.length] // 인자
        );
        
        // 결과 포인터에서 데이터 읽기
        const resultView = new Int32Array(solver.HEAP8.buffer, resultPtr, 81);
        const resultArray = Array.from(resultView);
        console.log('해결된 스도쿠:', resultArray);
        
    } catch (error) {
        console.error('스도쿠 해결 오류:', error);
    }
};
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold text-center mb-8">간단한 스도쿠 솔버</h1>
            
            {/* 스도쿠 보드 시각화 (옵션) */}
            <div className="mb-6 grid grid-cols-9 gap-0.5 border-2 border-gray-800 w-fit mx-auto">
                {EXAMPLE_PUZZLE.map((cell, index) => {
                    const rowIndex = Math.floor(index / 9);
                    const colIndex = index % 9;
                    
                    // 테두리 클래스 계산
                    const borderClasses = [];
                    if (rowIndex % 3 === 0 && rowIndex !== 0) borderClasses.push('border-t-2 border-t-gray-800');
                    if (colIndex % 3 === 0 && colIndex !== 0) borderClasses.push('border-l-2 border-l-gray-800');
                    
                    return (
                        <div 
                            key={index}
                            className={`
                                w-10 h-10 flex items-center justify-center bg-white
                                ${cell === 0 ? 'text-gray-300' : 'font-bold text-black'}
                                ${borderClasses.join(' ')}
                                border border-gray-300
                            `}
                        >
                            {cell !== 0 ? cell : '·'}
                        </div>
                    );
                })}
            </div>
            
            {/* 버튼 영역 */}
            <div className="flex justify-center mb-4">
                <button 
                    onClick={handleSolve}
                    disabled={!solver}
                    className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    스도쿠 풀기 (콘솔에 결과 출력)
                </button>
            </div>
            
            {/* 안내 */}
            <div className="mt-4 text-center text-gray-600">
                <p>결과는 브라우저 콘솔에 출력됩니다. (F12 키를 눌러 개발자 도구를 열어서 확인하세요)</p>
            </div>
        </div>
    );
}
