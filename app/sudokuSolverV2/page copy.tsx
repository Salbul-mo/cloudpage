"use client"
// app/sudokuSolver/SudokuPage.tsx
import React, { useState } from 'react';
import SudokuInput from './SudokuInput';
import SudokuOutput from './SudokuOutput';
import SolveSudoku from './SolveSudoku';

const SudokuPage: React.FC = () => {
    const [sudoku, setSudoku] = useState<number[][]>(Array(9).fill(null).map(() => Array(9).fill(null)));
    const [solvedSudoku, setSolvedSudoku] = useState<number[][]>(Array(9).fill(null).map(() => Array(9).fill(null)));

    const handleInput = (inputSudoku: number[][]) => {
        setSudoku(inputSudoku);
        const solved = SolveSudoku(inputSudoku);
        setSolvedSudoku(solved);
        setSudoku(solved)
    };

    return (
        <div>
            <SudokuInput onInput={handleInput} />
            <SudokuOutput sudoku={solvedSudoku} />
        </div>
    );
};

export default SudokuPage;
