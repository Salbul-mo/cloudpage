"use client"

import React, { useState } from 'react';

interface SudokuInputProps {
    onInput: (grid: number[][]) => void;
}

const SudokuInput: React.FC<SudokuInputProps> = ({ onInput }) => {
    const [sudoku, setSudoku] = useState<number[][]>(
        Array(9).fill(0).map(() => Array(9).fill(0))
    );

    const handleInputChange = (row: number, col: number, value: number | null) => {
        const newSudoku = sudoku.map(r => [...r]);
        newSudoku[row][col] = value === null ? 0 : value;
        setSudoku(newSudoku);
    };

    const handleSubmit = () => {
        onInput([...sudoku]);
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="grid grid-cols-9 gap-0 w-full max-w-[400px] mx-auto mb-6">
                {sudoku.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                        const boxRow = Math.floor(rowIndex / 3);
                        const boxCol = Math.floor(colIndex / 3);
                        const boxNum = boxRow * 3 + boxCol;

                        return (
                            <input
                                key={`${rowIndex}-${colIndex}`}
                                type="number"
                                min="1"
                                max="9"
                                value={cell === null ? '0' : cell}
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    let value = null;
                                    if (inputValue === '0' || inputValue === '') {
                                        value = 0;
                                    } else if (inputValue) {
                                        value = Math.min(9, Math.max(1, parseInt(inputValue) || 0));
                                    }
                                    handleInputChange(rowIndex, colIndex, value === 0 ? 0 : value || null);
                                }}
                                onKeyDown={(e) => {
                                    if (!/^[1-9\b\t\n\x20\r\f\v\u00A0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]$/i.test(e.key) && 
                                        !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                className={`
                                    aspect-square w-full
                                    text-center text-xl font-bold
                                    bg-tokyo_night-700 text-tokyo_night-100
                                    focus:bg-tokyo_night-600 focus:outline-none focus:ring-2 focus:ring-tokyo_skyblue-500
                                    ${colIndex % 3 === 2 ? 'border-r-2 border-tokyo_night-500' : 'border-r border-tokyo_night-600'}
                                    ${rowIndex % 3 === 2 ? 'border-b-2 border-tokyo_night-500' : 'border-b border-tokyo_night-600'}
                                    ${colIndex === 0 ? 'border-l-2 border-tokyo_night-500' : ''}
                                    ${rowIndex === 0 ? 'border-t-2 border-tokyo_night-500' : ''}
                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                                `}
                            />
                        );
                    })
                )}
            </div>
            <button 
                onClick={handleSubmit}
                className="mt-6 w-full py-3 px-6 bg-tokyo_skyblue-500 hover:bg-tokyo_skyblue-400 text-tokyo_night-800 font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
            >
                스도쿠 풀기
            </button>
        </div>
    );
};

export default SudokuInput;
