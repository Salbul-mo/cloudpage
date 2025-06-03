import React from 'react';

declare const SudokuGrid: React.FC<{
    puzzle: number[];
    onCellChange?: (index: number, value: number) => void;
    isReadOnly?: boolean;
    isSolved?: boolean;
}>;

export default SudokuGrid;
