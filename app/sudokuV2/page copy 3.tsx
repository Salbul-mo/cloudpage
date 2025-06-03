"use client"

import React, { useEffect, useState } from 'react'

const EMPTY_BOARD = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const EXAMPLE_PUZZLE = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

export default function Page() {
    // 상태 관리
    const [board, setBoard] = useState<number[][]>(JSON.parse(JSON.stringify(EMPTY_BOARD)));
    const [originalBoard, setOriginalBoard] = useState<number[][]>(JSON.parse(JSON.stringify(EMPTY_BOARD)));
    const [solver, setSolver] = useState<any>(null);
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    // WASM 모듈 로드
    useEffect(() => {
        const loadWasm = async () => {
            try {
                setIsLoading(true);
                setMessage('WASM 모듈을 로드 중입니다...');
                
                // Emscripten 모듈 초기화
                // Emscripten으로 컴파일된 JS 파일은 모듈을 전역 변수로 참조하기를 기대합니다
                const Module: any = {
                    // WASM 파일을 찾는 방법을 설정
                    locateFile: (path: string) => {
                        console.log('Locating file:', path);
                        return `/wasm/${path}`;
                    },
                    // 런타임이 초기화되었을 때 호출되는 콜백
                    onRuntimeInitialized: () => {
                        console.log('WASM 런타임 초기화 완료!');
                        setSolver(Module);
                        setMessage('WASM 모듈 로드 완료!');
                        setIsLoading(false);
                    },
                    // 오류 발생시 호출되는 콜백
                    onAbort: (reason: string) => {
                        console.error('WASM 런타임 중단:', reason);
                        setMessage(`WASM 중단: ${reason}`);
                        setIsLoading(false);
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
                
                // Emscripten이 생성한 JS 파일 로드
                // 이 JS 파일은 WASM 바이너리를 로드하고 실행합니다
                const scriptElement = document.createElement('script');
                scriptElement.src = '/wasm/a.out.js';
                scriptElement.async = true;
                scriptElement.onerror = (event) => {
                    console.error('Script 로드 실패:', event);
                    setMessage('스크립트 로드 실패');
                    setIsLoading(false);
                };
                
                document.body.appendChild(scriptElement);
            } catch (error) {
                console.error('WASM 로드 오류:', error);
                const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
                setMessage(`오류 발생: ${errorMessage}`);
                setIsLoading(false);
            }
        };
        
        loadWasm();
        
        // 클린업 함수
        return () => {
            // 전역 변수 정리
            // @ts-ignore
            if (window.Module) {
                // @ts-ignore
                delete window.Module;
            }
            
            // 주의: 페이지를 떠날 때 스크립트 태그 제거
            const scriptElements = document.querySelectorAll('script[src="/wasm/a.out.js"]');
            scriptElements.forEach(element => {
                element.remove();
            });
        };
    }, []);

    // 셀 선택 핸들러
    const handleCellClick = (row: number, col: number) => {
        // 초기 보드의 값이 있는 셀은 변경 불가
        if (originalBoard[row][col] !== 0) return;
        
        setSelectedCell([row, col]);
    };

    // 숫자 입력 핸들러
    const handleNumberInput = (num: number) => {
        if (!selectedCell) return;
        
        const [row, col] = selectedCell;
        const newBoard = JSON.parse(JSON.stringify(board));
        newBoard[row][col] = num;
        setBoard(newBoard);
    };

    // 셀 지우기
    const handleClearCell = () => {
        if (!selectedCell) return;
        
        const [row, col] = selectedCell;
        const newBoard = JSON.parse(JSON.stringify(board));
        newBoard[row][col] = 0;
        setBoard(newBoard);
    };

    // 보드 초기화
    const handleResetBoard = () => {
        setBoard(JSON.parse(JSON.stringify(originalBoard)));
        setSelectedCell(null);
        setMessage('');
    };

    // 예제 퍼즐 로드
    const handleLoadExample = () => {
        const newBoard = JSON.parse(JSON.stringify(EXAMPLE_PUZZLE));
        setBoard(newBoard);
        setOriginalBoard(JSON.parse(JSON.stringify(newBoard)));
        setSelectedCell(null);
        setMessage('예제 퍼즐이 로드되었습니다.');
    };

    // 스도쿠 풀기
    const handleSolve = () => {
        if (!solver) {
            setMessage('WASM 모듈이 아직 로드되지 않았습니다.');
            return;
        }

        try {
            // 보드를 1차원 배열로 변환 (WASM에 전달하기 위해)
            const flatBoard = board.flat();
            const boardArray = new Int32Array(flatBoard);
            
            // C 함수를 직접 호출하여 스도쿠 해결
            const result = solver.cwrap("solve_sudoku", "number", ["array", "number"])(boardArray, flatBoard.length);
            
            // 결과 확인
            if (result) {
                // 결과가 1차원 Int32Array이므로 9x9 2차원 배열로 변환
                const solution = [];
                for (let i = 0; i < 9; i++) {
                    const row = [];
                    for (let j = 0; j < 9; j++) {
                        // 결과 배열에서 값 가져오기
                        row.push(result[i * 9 + j]);
                    }
                    solution.push(row);
                }
                
                setBoard(solution);
                setMessage('스도쿠가 성공적으로 해결되었습니다!');
            } else {
                setMessage('이 스도쿠 퍼즐은 해결할 수 없습니다.');
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('스도쿠 해결 오류:', error);
                setMessage(`오류 발생: ${error.message}`);
            }
        }
    };

    // 유일 해 확인
    const handleCheckUnique = () => {
        if (!solver) {
            setMessage('WASM 모듈이 아직 로드되지 않았습니다.');
            return;
        }
        
        try {
            // 보드를 1차원 배열로 변환
            const flatBoard = board.flat();

            const boardArray = new Int32Array(flatBoard);
            
            // C 함수를 직접 호출하여 유일 해 여부 확인
            const hasUnique = solver.cwrap("has_unique_solution", "number", ["array", "number"])(boardArray, flatBoard.length);
            
            if (hasUnique === 1) {
                setMessage('이 퍼즐은 유일한 해결책이 있습니다.');
            } else if (hasUnique === 0) {
                setMessage('이 퍼즐은 여러 개의 해결책이 있습니다.');
            } else {
                setMessage('이 퍼즐은 해결할 수 없습니다.');
            }
            
        } catch (error) {
            if (error instanceof Error) {
                console.error('유일 해 확인 오류:', error);
                setMessage(`오류 발생: ${error.message}`);
            }
        }
    };

    // 숫자 키패드 렌더링
    const renderNumberPad = () => {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        return (
            <div className="grid grid-cols-3 gap-2 mt-4">
                {numbers.map(num => (
                    <button 
                        key={num}
                        onClick={() => handleNumberInput(num)}
                        className="p-3 bg-blue-100 rounded hover:bg-blue-200 text-xl font-bold"
                    >
                        {num}
                    </button>
                ))}
                <button 
                    onClick={handleClearCell}
                    className="p-3 bg-red-100 rounded hover:bg-red-200 col-span-3 text-lg font-medium"
                >
                    지우기
                </button>
            </div>
        );
    };

    // 스도쿠 보드 렌더링
    const renderBoard = () => {
        return (
            <div className="grid grid-cols-9 gap-px bg-gray-400 border-2 border-gray-800 w-fit mx-auto">
                {board.map((row, rowIndex) => 
                    row.map((cell, colIndex) => {
                        const isSelected = selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex;
                        const isOriginal = originalBoard[rowIndex][colIndex] !== 0;
                        const borderClasses = [];
                        
                        // 3x3 서브그리드 구분선
                        if (rowIndex % 3 === 0 && rowIndex !== 0) borderClasses.push('border-t-2 border-t-gray-800');
                        if (colIndex % 3 === 0 && colIndex !== 0) borderClasses.push('border-l-2 border-l-gray-800');
                        
                        return (
                            <div 
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                className={`
                                    w-10 h-10 flex items-center justify-center bg-white
                                    ${isSelected ? 'bg-blue-200' : ''}
                                    ${isOriginal ? 'font-bold text-black' : 'text-blue-600'}
                                    ${borderClasses.join(' ')}
                                    cursor-pointer hover:bg-gray-100
                                `}
                            >
                                {cell !== 0 ? cell : ''}
                            </div>
                        );
                    })
                )}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold text-center mb-8">스도쿠 V2</h1>
            
            {/* 로딩 상태 및 메시지 */}
            {isLoading && (
                <div className="mb-4 text-center font-medium text-blue-600">
                    <p>로딩 중...</p>
                </div>
            )}
            {message && (
                <div className="mb-4 p-2 bg-gray-100 rounded text-center">
                    <p>{message}</p>
                </div>
            )}
            
            {/* 스도쿠 보드 */}
            <div className="mb-6">
                {renderBoard()}
            </div>
            
            {/* 숫자 패드 */}
            <div className="mb-6">
                {renderNumberPad()}
            </div>
            
            {/* 컨트롤 버튼 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <button 
                    onClick={handleSolve}
                    disabled={!solver}
                    className="p-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    풀기
                </button>
                <button 
                    onClick={handleCheckUnique}
                    disabled={!solver}
                    className="p-3 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    유일해 확인
                </button>
                <button 
                    onClick={handleResetBoard}
                    className="p-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                    초기화
                </button>
                <button 
                    onClick={handleLoadExample}
                    className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    예제 로드
                </button>
            </div>
            
            {/* 설명 */}
            <div className="mt-8 p-4 bg-gray-100 rounded shadow-sm">
                <h2 className="text-xl font-semibold mb-2">사용 방법</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li>셀을 클릭하고 숫자 패드를 사용하여 숫자를 입력하세요.</li>
                    <li>비어있는 셀은 0으로 표시됩니다.</li>
                    <li>풀기 버튼을 클릭하여 스도쿠를 해결하세요.</li>
                    <li>유일해 확인 버튼으로 퍼즐의 해가 하나만 있는지 확인하세요.</li>
                    <li>초기화 버튼으로 보드를 원래 상태로 되돌리세요.</li>
                </ul>
            </div>
        </div>
    );
}