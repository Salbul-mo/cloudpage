"use client"

import React, { useState, useEffect } from 'react';
import SudokuGrid from './SudokuGrid';
import { solvePuzzle, isValidPuzzle } from './solver';

// Define the props interface for SudokuGrid
interface SudokuGridProps {
    puzzle: number[];
    onCellChange?: (index: number, value: number) => void;
    isReadOnly?: boolean;
    isSolved?: boolean;
}

const SudokuSolverV2: React.FC = () => {
    const [puzzle, setPuzzle] = useState<number[]>(Array(81).fill(0));
    const [solvedPuzzle, setSolvedPuzzle] = useState<number[] | null>(null);

    const handleCellChange = (index: number, value: number) => {
        const newPuzzle = [...puzzle];
        newPuzzle[index] = value;
        setPuzzle(newPuzzle);
    };

    const handleSolve = () => {
        try {
            // 퍼즐 유효성 검사
            if (!isValidPuzzle(puzzle)) {
                alert('유효하지 않은 스도쿠 퍼즐입니다. 규칙을 확인해주세요.');
                return;
            }
            
            // 퍼즐 풀이 시도
            const solution = solvePuzzle([...puzzle]);
            
            // 해결된 퍼즐이 유효한지 확인
            if (solution.some((num: number) => num === 0)) {
                throw new Error('풀 수 없는 스도쿠 퍼즐입니다.');
            }
            
            setSolvedPuzzle(solution);
            alert('스도쿠 풀이가 완료되었습니다!');
        } catch (error) {
            console.error('Error solving puzzle:', error);
            alert('스도쿠를 풀 수 없습니다. 올바른 퍼즐인지 확인해주세요.');
        }
    };

    const handleClear = () => {
        setPuzzle(Array(81).fill(0));
        setSolvedPuzzle(null);
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6 text-center">스도쿠 풀이기</h1>
            
            <div className="flex flex-col md:flex-row gap-8 justify-center">
                <div>
                    <h2 className="text-xl font-semibold mb-4">문제 입력</h2>
                    <SudokuGrid 
                        puzzle={puzzle} 
                        onCellChange={handleCellChange}
                        isReadOnly={false}
                        isSolved={false}
                    />
                </div>
                
                <div>
                    <h2 className="text-xl font-semibold mb-4">정답</h2>
                    <SudokuGrid 
                        puzzle={solvedPuzzle || Array(81).fill(0)} 
                        isReadOnly={true}
                        isSolved={true}
                    />
                </div>
            </div>
            
            <div className="mt-6 flex justify-center gap-4">
                <button
                    onClick={handleSolve}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    풀기
                </button>
                <button
                    onClick={handleClear}
                    className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                >
                    초기화
                </button>
            </div>
        </div>
    );
};

export default SudokuSolverV2;
