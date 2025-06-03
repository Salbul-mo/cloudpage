"use client"

import React from 'react';

interface SudokuGridProps {
    puzzle: number[];
    onCellChange?: (index: number, value: number) => void;
    isReadOnly?: boolean;
    isSolved?: boolean;
}

const SudokuGrid: React.FC<SudokuGridProps> = ({
    puzzle,
    onCellChange,
    isReadOnly = false,
    isSolved = false
}) => {
    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!onCellChange) return;
        
        const value = parseInt(e.target.value) || 0;
        if (value >= 0 && value <= 9) {
            onCellChange(index, value);
        }
    };

    const getCellClass = (index: number) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        let classes = [
            'w-10 h-10 text-center border border-gray-300',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'transition-colors',
        ];

        // Add border styles for 3x3 boxes
        if (row % 3 === 0) classes.push('border-t-2 border-t-gray-600');
        if (row === 8) classes.push('border-b-2 border-b-gray-600');
        if (col % 3 === 0) classes.push('border-l-2 border-l-gray-600');
        if (col === 8) classes.push('border-r-2 border-r-gray-600');

        // Style for user input vs solution
        if (isSolved) {
            classes.push('bg-green-50 font-semibold');
        } else if (puzzle[index] !== 0) {
            classes.push('bg-blue-50');
        }

        return classes.join(' ');
    };

    return (
        <div className="grid grid-cols-9 gap-0 border-2 border-gray-600 w-fit">
            {puzzle.map((value, index) => (
                <input
                    key={index}
                    type="number"
                    min="0"
                    max="9"
                    value={value || ''}
                    onChange={(e) => handleChange(index, e)}
                    className={getCellClass(index)}
                    readOnly={isReadOnly}
                    inputMode="numeric"
                />
            ))}
        </div>
    );
};

export default SudokuGrid;
