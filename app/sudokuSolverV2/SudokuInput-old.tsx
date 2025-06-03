"use client"

import React, { useState } from 'react';

interface SudokuInputProps {
    onInput: (sudoku: number[][]) => void;
}

const SudokuInput: React.FC<SudokuInputProps> = ({ onInput }) => {
    const [sudoku, setSudoku] = useState<number[][]>(Array(9).fill(null).map(() => Array(9).fill(null)));

    const handleInputChange = (row: number, col: number, value: number) => {
        setSudoku(sudoku.map((rowArr, rowIndex) => {
            if (rowIndex === row) {
                return rowArr.map((cell, colIndex) => {
                    if (colIndex === col) {
                        return value;
                    }
                    return cell;
                });
            }
            return rowArr;
        }));
    };

    const handleSubmit = () => {
        onInput(sudoku);
    };

    return (
        <div>
            {sudoku.map((row, rowIndex) => (
                <div key={rowIndex}>
                    {row.map((cell, colIndex) => (
                        <input
                            key={colIndex}
                            type="number"
                            value={cell}
                            onChange={(e) => handleInputChange(rowIndex, colIndex, parseInt(e.target.value, 10))}
                        />
                    ))}
                </div>
            ))}
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
};

export default SudokuInput;
