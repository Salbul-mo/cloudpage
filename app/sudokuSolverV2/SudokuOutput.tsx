// app/sudokuSolver/SudokuOutput.tsx
import React from 'react';

interface SudokuOutputProps {
    sudoku: number[][];
}

const SudokuOutput: React.FC<SudokuOutputProps> = ({ sudoku }) => {
    return (
        <div className="boxSet">
            <div className="SudokuBoard">
                {sudoku.map((row, rowIndex) => {
                    if (sudoku === null || sudoku == undefined) {
                        return null
                    }
                    const rowNum = rowIndex
                    return (
                        <div className="row" key={rowIndex}>
                            {row.map((cell, colIndex) => {
                                const colNum = colIndex
                                let box = 0
                                if (rowNum < 3) {
                                    if (colNum < 3) {
                                        box = 0
                                    } else if (colNum < 6) {
                                        box = 1
                                    } else {
                                        box = 2
                                    }
                                } else if (rowNum < 6) {
                                    if (colNum < 3) {
                                        box = 3
                                    } else if (colNum < 6) {
                                        box = 4
                                    } else {
                                        box = 5
                                    }
                                } else {
                                    if (colNum < 3) {
                                        box = 6
                                    } else if (colNum < 6) {
                                        box = 7
                                    } else {
                                        box = 8
                                    }
                                }

                                const cellClass = `sudokuBox row-${rowNum} col-${colNum} box-${box}`
                                return (
                                    <span >
                                        className={cellClass}
                                        key={colIndex}
                                        type="number"
                                        value={cell}
                                    </span>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
export default SudokuOutput;
