"use client"

import React, { useState } from 'react';
import { solvePuzzle, isValidPuzzle } from './solver';

const TestSudokuSolver: React.FC = () => {
    // 테스트용 스도쿠 퍼즐 (0은 빈 칸)
    const testPuzzle = [
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


    const [puzzle, setPuzzle] = useState<number[]>(testPuzzle);
    const [solvedPuzzle, setSolvedPuzzle] = useState<number[] | null>(null);

    const handleSolve = () => {
        try {
            // 퍼즐 유효성 검사
            if (!isValidPuzzle(puzzle)) {
                alert('유효하지 않은 스도쿠 퍼즐입니다.');
                return;
            }
            
            // 퍼즐 풀기
            const solution = solvePuzzle([...puzzle]);
            
            // 해결된 퍼즐이 유효한지 확인
            if (solution.some(num => num === 0)) {
                throw new Error('풀 수 없는 스도쿠 퍼즐입니다.');
            }
            
            setSolvedPuzzle(solution);
            console.log('해결된 퍼즐:', solution);
            alert('스도쿠 풀이가 완료되었습니다!');
        } catch (error) {
            console.error('스도쿠 풀이 중 오류 발생:', error);
            alert('스도쿠를 풀 수 없습니다. 올바른 퍼즐인지 확인해주세요.');
        }
    };

    // 1차원 배열을 2차원 그리드로 변환
    const renderGrid = (puzzle: number[]) => {
        const grid = [];
        for (let i = 0; i < 9; i++) {
            const row = [];
            for (let j = 0; j < 9; j++) {
                const index = i * 9 + j;
                row.push(
                    <div 
                        key={`${i}-${j}`} 
                        className={`
                            w-10 h-10 flex items-center justify-center border
                            ${j % 3 === 2 && j < 8 ? 'border-r-2 border-black' : 'border-gray-300'}
                            ${i % 3 === 2 && i < 8 ? 'border-b-2 border-black' : 'border-gray-300'}
                            ${puzzle[index] === 0 ? 'bg-gray-100' : 'bg-white'}
                        `}
                    >
                        {puzzle[index] || ''}
                    </div>
                );
            }
            grid.push(
                <div key={i} className="flex">
                    {row}
                </div>
            );
        }
        return grid;
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">스도쿠 풀이기 테스트</h1>
            
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">문제</h2>
                <div className="border-2 border-black p-1 inline-block">
                    {renderGrid(puzzle)}
                </div>
            </div>

            <div className="mb-8">
                <button
                    onClick={handleSolve}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    스도쿠 풀기
                </button>
            </div>

            {solvedPuzzle && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">정답</h2>
                    <div className="border-2 border-black p-1 inline-block">
                        {renderGrid(solvedPuzzle)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestSudokuSolver;
