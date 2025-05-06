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


    let activeArray = Array(9).fill(null).map(() => Array(9).fill(false))
    let numberArray = Array(9).fill(null).map(() => getOneSet())

    // 숫자 위치 유효성 체크 및 재배열 과정
    // for 루프 안에 집어넣기?
    // 박스끼리 
    // 행: numberArray[0][1][2], [3][4][5], [6][7][8]
    // 열: numberArray[0][3][6], [1][4][7]. [2][5][8] 
    // 숫자끼리
    // 행: [012],[345],[678]
    // 열: [036],[147],[258]

    // 012
    // 345
    // 678
    function numberValidation(arr: number[][]) {
        // 1~9 까지가 담긴 9개의 배열을 순회하며 스도쿠 규칙에 맞도록 재배치한다.
        // 첫번째 배열은 그대로두고 기준으로 잡는다?
        // 배열을 순회하면서 앞선 요소가 품고 있는 배열을 기준으로 뒷 순서 요소를 수정한다
        // 관계된 요소를 미리 정해놓고 특정 값보다 후에 있는 요소만 변경한다.
        //

        const group = [
            // i가 0 일때 상관 관계 있는 요소는 1,2,3,6
            // i가 1 일때 상관 관계 있는 요소는 0,2,4,7
            // i가 2 일때 상관 관계 있는 요소는 0,1,5,8
            // i가 3 일때 상관 관계 있는 요소는 0,4,5,6
            // i가 4 일때 상관 관계 있는 요소는 1,3,5,7
            // i가 5 일때 상관 관계 있는 요소는 2,3,4,8
            // i가 6 일때 상관 관계 있는 요소는 0,3,7,8
            // i가 7 일때 상관 관계 있는 요소는 1,4,6,8
            // i가 8 일때 상관 관계 있는 요소는 2,5,6,7
            [0, 1, 2, 3, 6], [0, 1, 2, 4, 7], [0, 1, 2, 5, 8],
            [0, 3, 4, 5, 6], [1, 3, 4, 5, 7], [2, 3, 4, 5, 8],
            [0, 3, 7, 6, 8], [1, 4, 6, 7, 8], [2, 5, 6, 7, 8]
        ]

        // 박스 0 은 그대로 두고 기준으로 삼는다.
        // for 루프는 박스 1 부터 시작
        for (let i = 1; i < arr.length; i++) {
            // 현재 박스와 관련된 박스 & 숫자 배열 그룹
            let target = [...group[i]]

            // 현재 박스 숫자
            let numSet: number[] = [...arr[i]]

            // 비교할 박스의 숫자세트
            let previousBox: number[][] = []

            // 박스 그룹 순회
            for (let k = 0; k < 5; k++) {

                // 현재 박스보다 이전 박스일때만 비교 수정
                if (target[k] < i) {
                    previousBox.push(arr[k])
                }
            }
            console.log("비교할 박스들")
            console.log(previousBox)

            let newSet: number[] = []
            console.log("현재 박스의 숫자들")
            console.log(numSet)
            // 현재 숫자 배열을 순회하면서 이전 박스의 숫자들과 비교
            // 이전 관련 박스들의 관련 행/열의 숫자들을 한번에 가져와서 비교해야한다?
            for (let j = 0; j < numSet.length - 1; j++) {

                // 각 요소에 연관된 인덱스 번호
                const relatedIdx: number[] = [...group[i]]

                for (let q = 0; q < previousBox.length; q++) {

                    const rule = [...previousBox[q]]

                    for (let x = 0; x < relatedIdx.length; x++) {

                        if (rule[relatedIdx[x]] === numSet[j]) {
                            ;[numSet[j], numSet[j + 1]] = [numSet[j + 1], numSet[j]]
                            x--;
                            continue
                        } else if (x === relatedIdx.length - 1) {
                            newSet.push(numSet[j])
                        }

                    }

                }

            }
            newSet.push(numSet[8])
            arr[i] = [...newSet]
            numSet = []
            newSet = []
            previousBox = []
            target = []
        }

        return arr
    }

    activeArray = [...numberValidation(activeArray)]

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

