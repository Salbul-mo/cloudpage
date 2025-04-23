"use client"

import "../globals.css"
import Link from "next/link"
import { useState } from "react"

// 완성된 스도쿠 판을 반환한다.
export default function Sudoku() {

    function numberGenerator(): number[] {

        let array = getOneSet()

        return array
    }

    // 최댓값이 주어지지 않으면 1 ~ 9 중 하나 반환
    // 최댓값이 주어지면 1 ~ 최댓값 이하 중 하나 반환
    function getRandomInt(max: number | null): number {

        const number = Math.floor(Math.random() * (max ? max : 9)) + 1
        return number
    }

    function getOneSet(): number[] {

        const array: number[] = []

        while (array.length < 9) {
            let temp: number = getRandomInt(null)
            if (array.includes(temp)) {
                continue
            } else {
                array.push(temp)
            }

        }

        return array
    }

    // 버튼 태그에 클릭 핸들러와 숫자 값, 숫자의 위치를 삽입한다.
    function Box({ value, className, onBoxClick }: { value: number, className: string, onBoxClick: any }) {

        return (<button className={className} onClick={onBoxClick}>
            {value}
        </button>
        )
    }

    // 3 X 3 스도쿠 박스를 반환한다.
    function SudokuBox({ row, col }: { row: number, col: number }) {

        const [isActive, setActive] = useState([Array(9).fill(false)])
        const set1 = numberGenerator()

        function handleClick(arr: string[]) {
            // arr => box row col
            const box = arr[0]
            const row = arr[1]
            const col = arr[2]

            // // 이벤트 핸들러를 트리거한 요소 가져오기  
            // const element = event.target
            //
            console.log(`box: ${box}, row: ${row}, col: ${col}`)
            //
            // // 클릭된 박스 안의 숫자 값 가져오기
            // console.log(element.innerHTML)

            return
        }


        return (
            <div className="boxSet">
                {set1.map((item, index) => {
                    return (
                        <Box value={item}
                            className={`sudokuBox ${index < 3 ? 'border-t-tokyo_night-50 border-t-3' : ''} 
${6 <= index && index <= 8 ? 'border-b-tokyo_night-50 border-b-3' : ''} 
${index % 3 === 0 ? 'border-l-tokyo_night-50 border-l-3' : ''}
${index % 3 === 2 ? 'border-r-tokyo_night-50 border-r-3' : ''}
groupBox-${3 * (row - 1) + col} 
groupRow-${row - 1 !== 2 ? 3 * (row - 1) + Math.floor(index / 3) + 1 : 2 * row + Math.floor(index / 3) + 1}
groupCol-${col - 1 !== 2 ? 3 * (col - 1) + index % 3 + 1 : 2 * col + index % 3 + 1}
`}
                            key={`${row} -${col} -${index + 1}`}
                            onBoxClick={() => handleClick([`${3 * (row - 1) + col}`,
                            `${row - 1 !== 2 ? 3 * (row - 1) + Math.floor(index / 3) + 1 : 2 * row + Math.floor(index / 3) + 1}`,
                            `${col - 1 !== 2 ? 3 * (col - 1) + index % 3 + 1 : 2 * col + index % 3 + 1}`])} />
                    )
                })}
            </div >

        )
    }

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
