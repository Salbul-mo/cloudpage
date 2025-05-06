"use client"
import { useState } from "react"
import Link from "next/link"
import "../globals.css"

// 숫자 박스
// value => 숫자
// className => isActive를 이용한 색깔 조정 및 css 조정
// onBoxClick => 클릭 시 isActive 를 변경하여 색깔 조정 및 숫자 선택하여 입력하는 기능, 메모 입력하는 기능
function NumberBox({ value, id, box, row, col, className, onBoxClick }: { value: number | null, id: string, box: number, row: number, col: number, className: string, onBoxClick: any }) {
    return (
        <button className={className} data-box={box} data-row={row} data-col={col} id={id} onClick={onBoxClick}>
            {value}
        </button>
    )
}

// Game 컴포넌트에게서 넘겨 받은 
// numSet => 전체 숫자 9X9
// isActive => 전체 박스에 담길 클릭 여부 저장할 State
// onPlay => 박스 클릭 시 선택된 숫자 박스와 관계된 박스들의 css 변경, 숫자 입력을 위한 인터페이스와 상호 작용
//  setState 를 사용해서 state 를 변경하면 해당 컴포넌트와 하위 컴포넌트가 전부 다시 랜더링되고
//  리액트는 가상 tree 를 사용해서 실제 DOM tree 에서 변경이 이루어지는 부분만을 랜더링한다.
//  만약 숫자 박스들의 랜더링을 직접 제어하고 싶으면 
//  useMemo 와 같은 메모이제이션 메서드를 사용해서 
//  숫자 박스의 데이터를 저장하여 랜더링이 필요한 특정 숫자 박스들을 특정하여 랜더링할 수 있다.
function SudokuBoard({ totalNumber, setTotalNumber, isActive, setActive, onPlay }: { totalNumber: number[][], setTotalNumber: any, isActive: boolean[][], setActive: any, onPlay: any }) {

    function handleBoxClick(e: Event) {
        // 박스 클릭 시 행동
        const target = e.target as HTMLElement
        // 박스 안의 숫자 콘솔 출력
        if (target && 'innerHTML' in target) {
            console.log(target.innerHTML)
        }

        setActive({
            ...isActive
        })


        onPlay()
        // 1. state 로 전달받은 true false 
        // 2. state 에 따라 숫자 박스의 클래스를 변경시켜 배경색을 바꾼다
        // 3. 클릭한 박스와 관계된 박스의 state 를 변경시켜 똑같이 배경색을 바꾼다
        // 4. 관계된 박스는 박스에 입력된 숫자와 같은 숫자 박스, 같은 행, 같은 열, 같은 박스 그룹
        //
        // 5. 숫자 입력용 인터페이스와 상호작용하여 숫자 박스에 반영한다.
        // => 아마도 Game 컴포넌트에게 넘겨 받은 onPlay 를 실행시켜 반환된 값을 숫자 박스에 넘겨주면 될듯하다

    }


    // 숫자 배치를 스도쿠 규칙에 맞게 재조정할 함수
    function numberValidation() {
        const previous = [...totalNumber]
    }

    return (
        <div className="SudokuBoard">
            {totalNumber.map((box, index) => {
                return (
                    <>
                        {box.map((number, idx) => {

                            const row: number = Math.floor(index / 3) * 3 + Math.floor(idx / 3)
                            const col: number = index % 3 + idx % 3

                            return (
                                <NumberBox
                                    key={`${box}-${row}-${col}`}
                                    id={`${box}-${row}-${col}`}
                                    box={index}
                                    row={row}
                                    col={col}
                                    value={number}
                                    className={``}
                                    onBoxClick={handleBoxClick}
                                />
                            )
                        })}
                    </>
                )
            })}
        </div >
    )
}

// 숫자 생성
function getRandomInt(exclude: number[] | null, quantity: number | null): number[] {

    const arr: number[] = []

    const length = quantity ? quantity : 9

    const template: number[] = []

    while (template.length < 9) {
        let number = Math.floor(Math.random() * 9) + 1

        if (!template.includes(number)) {
            template.push(number)
        }
    }

    const temp: number[] = [...template]

    // 1~9 까지 배열 순회하면서 집어넣는다.
    let idx = 0

    while (arr.length < length) {

        if (idx >= temp.length) {
            idx = 0
        }

        if (exclude && !exclude.includes(temp[idx])) {
            arr.push(temp[idx])
            idx++
        } else {
            idx++
        }
    }

    return arr
}

// 전체 게임판 컴포넌트
export default function SudokuGame() {

    const [totalNumber, setTotalNumber] = useState(Array(9).fill(null))
    const [isActive, setActive] = useState(Array(9).fill(null).map(() => Array(9).fill(false)))

    setTotalNumber({
        ...totalNumber[0] = [...getRandomInt(null, null)]
    })

    function onPlay() {
        return null
    }

    return (<div className="container mx-auto flex flex-col items-center">
        <Link className="text-tokyo_green-500 text-3xl" href="/">Home </Link>
        <div className="">
            <SudokuBoard isActive={isActive} setActive={setActive} totalNumber={totalNumber} setTotalNumber={setTotalNumber} onPlay={onPlay} />
        </div>
    </div>

    )
}
