"use client"

import React, { useState, useCallback } from 'react';
import { solvePuzzle, isValidPuzzle } from './solver';
import SudokuInput from './SudokuInput';

const SudokuPage: React.FC = () => {
    const [puzzle, setPuzzle] = useState<number[]>(Array(81).fill(0));
    const [solvedPuzzle, setSolvedPuzzle] = useState<number[] | null>(null);
    const [isSolving, setIsSolving] = useState(false);

    // 2차원 배열을 1차원 배열로 변환
    const convertTo1D = (grid: number[][]) => {
        return grid.flat();
    };

    // 1차원 배열을 2차원 배열로 변환
    const convertTo2D = (puzzle: number[]) => {
        const grid = [];
        for (let i = 0; i < 9; i++) {
            grid.push(puzzle.slice(i * 9, (i + 1) * 9));
        }
        return grid;
    };

    // SudokuInput에서 입력 받은 퍼즐 처리
    const handleInput = (sudokuGrid: number[][]) => {
        // 2D 배열을 1D 배열로 변환 (0은 빈 칸)
        const flatPuzzle = sudokuGrid.flat().map(num => num || 0);
        setPuzzle(flatPuzzle);
        setSolvedPuzzle(null); // 새 입력 시 이전 정답 초기화
    };
    
    // 퍼즐 초기화
    const handleReset = () => {
        setPuzzle(Array(81).fill(0));
        setSolvedPuzzle(null);
    };

    const handleSolve = useCallback(() => {
        try {
            setIsSolving(true);
            console.log('시작 퍼즐:', puzzle);
            
            // 퍼즐 유효성 검사
            if (!isValidPuzzle(puzzle)) {
                console.error('유효하지 않은 퍼즐입니다.');
                alert('유효하지 않은 스도쿠 퍼즐입니다.\n스도쿠 규칙을 위반한 입력이 있는지 확인해주세요.');
                return;
            }
            
            console.log('퍼즐 풀이 시도 중...');
            const solution = solvePuzzle([...puzzle]);
            console.log('풀이 결과:', solution);
            
            // 해결된 퍼즐이 유효한지 확인
            if (solution.some(num => num === 0)) {
                console.error('풀 수 없는 퍼즐입니다.');
                alert('이 스도쿠 퍼즐은 풀 수 없습니다.\n입력된 숫자를 확인해주세요.');
                return;
            }
            
            setSolvedPuzzle(solution);
            console.log('해결된 퍼즐이 설정되었습니다:', solution);
        } catch (error) {
            console.error('스도쿠 풀이 중 오류 발생:', error);
            alert('스도쿠 풀이 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
        } finally {
            setIsSolving(false);
        }
    }, [puzzle]);

    // 1차원 배열을 2차원 그리드로 변환하여 표시
    const renderGrid = (puzzle: number[]) => {
        return (
            <div className="grid grid-cols-9 gap-0 w-full max-w-[400px] mx-auto">
                {Array(9).fill(0).map((_, rowIndex) => (
                    Array(9).fill(0).map((_, colIndex) => {
                        const index = rowIndex * 9 + colIndex;
                        const value = puzzle[index];
                        
                        return (
                            <div 
                                key={`${rowIndex}-${colIndex}`}
                                className={`
                                    aspect-square w-full
                                    flex items-center justify-center
                                    text-xl font-bold
                                    ${value === 0 ? 'bg-tokyo_night-700' : 'bg-tokyo_night-600'}
                                    ${colIndex % 3 === 2 ? 'border-r-2 border-tokyo_night-500' : 'border-r border-tokyo_night-600'}
                                    ${rowIndex % 3 === 2 ? 'border-b-2 border-tokyo_night-500' : 'border-b border-tokyo_night-600'}
                                    ${colIndex === 0 ? 'border-l-2 border-tokyo_night-500' : ''}
                                    ${rowIndex === 0 ? 'border-t-2 border-tokyo_night-500' : ''}
                                    text-tokyo_night-100
                                `}
                            >
                                {value !== 0 ? value : ''}
                            </div>
                        );
                    })
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-tokyo_night-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-tokyo_skyblue-500 sm:text-5xl md:text-6xl">
                        <span className="block">스도쿠</span>
                        <span className="block text-tokyo_green-500">Solver</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-tokyo_night-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        스도쿠 퍼즐을 입력하고 해답을 확인해보세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 입력 섹션 */}
                    <div className="bg-tokyo_night-800 rounded-xl shadow-lg p-6 border border-tokyo_night-600">
                        <h2 className="text-2xl font-bold text-tokyo_skyblue-500 mb-6 flex items-center">
                            <span className="w-8 h-8 bg-tokyo_skyblue-500 text-tokyo_night-900 rounded-full flex items-center justify-center mr-3">1</span>
                            스도쿠 입력
                        </h2>
                        <div className="p-4 rounded-lg">
                            <SudokuInput onInput={handleInput} />
                            <div className="mt-6 flex justify-center space-x-4">
                                <button
                                    onClick={handleSolve}
                                    disabled={isSolving}
                                    className={`px-6 py-2 font-bold rounded-lg transition-colors duration-200 ${
                                        isSolving 
                                            ? 'bg-tokyo_night-600 text-tokyo_night-400 cursor-not-allowed' 
                                            : 'bg-tokyo_skyblue-500 hover:bg-tokyo_skyblue-600 text-tokyo_night-900'
                                    }`}
                                >
                                    {isSolving ? '풀이 중...' : '스도쿠 풀기'}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-2 bg-tokyo_night-600 hover:bg-tokyo_night-700 text-tokyo_night-100 font-bold rounded-lg transition-colors duration-200"
                                >
                                    초기화
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 결과 섹션 */}
                    <div className="bg-tokyo_night-800 rounded-xl shadow-lg p-6 border border-tokyo_night-600">
                        <h2 className="text-2xl font-bold text-tokyo_green-500 mb-6 flex items-center">
                            <span className="w-8 h-8 bg-tokyo_green-500 text-tokyo_night-900 rounded-full flex items-center justify-center mr-3">2</span>
                            퍼즐 & 해답
                        </h2>
                        
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-medium text-tokyo_night-100 mb-3">입력한 퍼즐</h3>
                                <div className="p-4 rounded-lg flex justify-center">
                                    {renderGrid(puzzle)}
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-medium text-tokyo_night-100">해답</h3>
                                    {solvedPuzzle && solvedPuzzle.some(num => num === 0) ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-tokyo_red-500/20 text-tokyo_red-500">
                                            풀 수 없음
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-tokyo_green-500/20 text-tokyo_green-500">
                                            <svg className="-ml-1 mr-1.5 h-2 w-2 text-tokyo_green-500" fill="currentColor" viewBox="0 0 8 8">
                                                <circle cx="4" cy="4" r="3" />
                                            </svg>
                                            해결 완료
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 rounded-lg flex justify-center">
                                    {renderGrid(solvedPuzzle || puzzle)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center text-tokyo_night-400 text-sm">
                    <p>스도쿠를 입력한 후 '스도쿠 풀기' 버튼을 누르면 해답을 확인할 수 있습니다.</p>
                </div>
            </div>
        </div>
    );
};

export default SudokuPage;
