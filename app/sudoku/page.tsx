"use client"

import "../globals.css"
import Link from "next/link"
import { numberGenerator } from '../../components/sudoku/function/numberGen'

// 버튼 태그에 클릭 핸들러와 숫자 값, 숫자의 위치를 삽입한다.
function Box({ value, className, onBoxClick }) {

    return (<button className={className} onClick={onBoxClick}>
        {value}
    </button>

    )

}

// 3 X 3 스도쿠 박스를 반환한다.
export function SudokuBox({ row, col }: { row: number, col: number }) {

    const set1 = numberGenerator()

    function handleClick(arr: number[]) {
        // arr => row, col, index
    }


    return (
        <div className="boxSet">
            {set1.map((item, index) => {
                return (
                    <Box value={item} className={`sudokuBox ${index < 3 ? 'border-t-tokyo_night-50 border-t-3' : ''} ${6 <= index && index <= 8 ? 'border-b-tokyo_night-50 border-b-3' : ''} ${index % 3 === 0 ? 'border-l-tokyo_night-50 border-l-3' : ''} ${index % 3 === 2 ? 'border-r-tokyo_night-50 border-r-3' : ''} groupBox-${3 * (row - 1) + col} groupRow-${row - 1 !== 2 ? 3 * (row - 1) + Math.floor(index / 3) + 1 : 2 * row + Math.floor(index / 3) + 1} groupCol-${col - 1 !== 2 ? 3 * (col - 1) + index % 3 + 1 : 2 * col + index % 3 + 1} `} key={`${row} -${col} -${index + 1}`} onBoxClick={() => handleClick([row, col, index])} />
                )
            })}
        </div >

    )
}

// 완성된 스도쿠 판을 반환한다.
export default function Sudoku() {
    return (
        <div className="container mx-auto flex flex-col items-center">
            <Link className="text-tokyo_green-500 text-3xl" href="/">Home </Link>
            <div className="mt-5 text-tokyo_purple-500 grid grid-cols-3 gap-0">
                <SudokuBox row={1} col={1} />
                <SudokuBox row={1} col={2} />
                <SudokuBox row={1} col={3} />
                <SudokuBox row={2} col={1} />
                <SudokuBox row={2} col={2} />
                <SudokuBox row={2} col={3} />
                <SudokuBox row={3} col={1} />
                <SudokuBox row={3} col={2} />
                <SudokuBox row={3} col={3} />
            </div>
        </div>
    )
}
