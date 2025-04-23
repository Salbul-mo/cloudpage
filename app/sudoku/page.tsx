"use client"
import { useState } from "react"
import Link from "next/link"
import "../globals.css"

// 숫자 박스
function NumberBox({ value, className, onBoxClick }: { value: number, className: string, onBoxClick: any }) {
    return (
        <button className={className} onClick={onBoxClick}>
            {value}
        </button>
    )
}

// 3 X 3 숫자 박스 한 세트
function BoxSet({ numSet, row, col, onBoxClick }: { numSet: number[], row: number, col: number, onBoxClick: any }) {


    return (
        <div className="boxSet">
            {numSet.map((item, index) => {
                return (
                    <NumberBox value={item} key={`box-${3 * (row - 1) + col}_row-${row - 1 !== 2 ? 3 * (row - 1) + Math.floor(index / 3) + 1 : 2 * row + Math.floor(index / 3) + 1}_col-${col - 1 !== 2 ? 3 * (col - 1) + index % 3 + 1 : 2 * col + index % 3 + 1}_idx-${index}`}
                        className={`sudokuBox ${index < 3 ? 'border-t-tokyo_night-50 border-t-3' : ''} 
                ${6 <= index && index <= 8 ? 'border-b-tokyo_night-50 border-b-3' : ''} 
                ${index % 3 === 0 ? 'border-l-tokyo_night-50 border-l-3' : ''}
                ${index % 3 === 2 ? 'border-r-tokyo_night-50 border-r-3' : ''}
                groupBox-${3 * (row - 1) + col} 
                groupRow-${row - 1 !== 2 ? 3 * (row - 1) + Math.floor(index / 3) + 1 : 2 * row + Math.floor(index / 3) + 1}
                groupCol-${col - 1 !== 2 ? 3 * (col - 1) + index % 3 + 1 : 2 * col + index % 3 + 1}
                `}
                        onBoxClick={(e: Event) => onBoxClick(e)}
                    />

                )
            })}
        </div>

    )
}

// 게임 판
// isActive => 클릭 여부, Array(9)
// numSet => 숫자 값, Array(9)
// onPlay => 클릭 시 행동
function Board({ isActive, numSet, onPlay }: { isActive: any[], numSet: any[], onPlay: any }) {

    // 파라미터로 박스의 위치(box, row, col) 및 숫자
    function handleClick(e: Event) {
        // 박스 클릭 시 행동
        const target = e.target as HTMLElement
        if (target && 'innerHTML' in target) {
            console.log(target.innerHTML)
        }
        // Game 컴포넌트에게 전달 받은 onPlay 함수 작동
        onPlay()

    }

    // 보드 랜더링 행동

    return (
        <div className="sudokuBoard">
            <div className="mt-5 text-tokyo_purple-500 grid grid-cols-3 gap-0">
                <BoxSet numSet={numSet[0]} row={1} col={1} onBoxClick={handleClick} />
                <BoxSet numSet={numSet[1]} row={1} col={2} onBoxClick={handleClick} />
                <BoxSet numSet={numSet[2]} row={1} col={3} onBoxClick={handleClick} />
                <BoxSet numSet={numSet[3]} row={2} col={1} onBoxClick={handleClick} />
                <BoxSet numSet={numSet[4]} row={2} col={2} onBoxClick={handleClick} />
                <BoxSet numSet={numSet[5]} row={2} col={3} onBoxClick={handleClick} />
                <BoxSet numSet={numSet[6]} row={3} col={1} onBoxClick={handleClick} />
                <BoxSet numSet={numSet[7]} row={3} col={2} onBoxClick={handleClick} />
                <BoxSet numSet={numSet[8]} row={3} col={3} onBoxClick={handleClick} />
            </div>
        </div>


    )
}

// 게임 랜더링
// state, 클릭 핸들러 정의
export default function Game() {
    // 최댓값이 주어지지 않으면 1 ~ 9 중 하나 반환
    // 최댓값이 주어지면 1 ~ 최댓값 이하 중 하나 반환
    function getRandomInt(max: number | null): number {
        const number = Math.floor(Math.random() * (max ? max : 9)) + 1
        return number
    }

    // 1 ~ 9 까지 한 세트를 담은 무작위 숫자 배열 반환
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
    // 숫자 박스 클릭 시 배경 색 상태를 위한 useState
    // 이 외 게임 기능을 위한 useState 추가


    const activeArray = Array(9).fill(null).map(() => Array(9).fill(false))
    const numberArray = Array(9).fill(null).map(() => getOneSet())

    const [isActive, setActive] = useState(activeArray)
    const [numSet, setNumSet] = useState(numberArray)


    function handlePlay() {
        // 숫자 박스 클릭 시 작동할 보드 컴포넌트에 전달할 함수 정의
    }

    // 이 외 게임 플레이에 필요한 추가 함수 정의

    // 보드판 불러오면서 함수 및 state 등 전달
    return (<div className="container mx-auto flex flex-col items-center">
        <Link className="text-tokyo_green-500 text-3xl" href="/">Home </Link>
        <div className="">
            <Board isActive={isActive} numSet={numSet} onPlay={handlePlay} />
        </div>
    </div>

    )


}
