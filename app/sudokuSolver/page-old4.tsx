"use client"
import { useState, useMemo } from "react"
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
function SudokuBoard({ box, row, col, isActive, setActive, onPlay }: { box: number[][], row: number[][], col: number[][], isActive: boolean[][], setActive: any, onPlay: any }) {

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
    }
    {/* const row: number = Math.floor(index / 3) * 3 + Math.floor(idx / 3) */ }
    {/* const col: number = index % 3 + idx % 3 */ }
    // <NumberBox
    //     key={`${box}-${row}-${col}`}
    //     id={`${box}-${row}-${col}`}
    //     box={index}
    //     row={row}
    //     col={col}
    //     value={number}
    //     className={``}
    //     onBoxClick={handleBoxClick}
    // />
    //
    return (
        <div className="SudokuBoard">
            {box.map((box, index) => {
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

    console.log("Exclude :", exclude)

    const length = quantity ? quantity : 9

    const template: number[] = []

    while (template.length < length) {
        let number = Math.floor(Math.random() * 9) + 1

        if (template.includes(number)) {
            continue
        }

        if (exclude !== null && !exclude.includes(number)) {
            template.push(number)
        } else if (exclude === null) {
            template.push(number)
        }
    }

    return template
}

// 전체 게임판 컴포넌트
export default function SudokuGame() {

    const store = useMemo(() => {

        const box: number[][] = Array(9).fill(null).map(() => Array(9).fill(null))

        const row: number[][] = Array(9).fill(null).map(() => Array(9).fill(null))

        const col: number[][] = Array(9).fill(null).map(() => Array(9).fill(null))

        const box0: number[] = getRandomInt(null, null)
        const box4: number[] = getRandomInt(null, null)
        const box8: number[] = getRandomInt(null, null)

        box[0] = box0
        row[0].splice(0, 3, box0[0], box0[1], box0[2])
        row[1].splice(0, 3, box0[3], box0[4], box0[5])
        row[2].splice(0, 3, box0[6], box0[7], box0[8])
        col[0].splice(0, 3, box0[0], box0[3], box0[6])
        col[1].splice(0, 3, box0[1], box0[4], box0[7])
        col[2].splice(0, 3, box0[2], box0[5], box0[8])

        box[4] = box4
        row[3].splice(3, 3, box4[0], box4[1], box4[2])
        row[4].splice(3, 3, box4[3], box4[4], box4[5])
        row[5].splice(3, 3, box4[6], box4[7], box4[8])
        col[3].splice(3, 3, box4[0], box4[3], box4[6])
        col[4].splice(3, 3, box4[1], box4[4], box4[7])
        col[5].splice(3, 3, box4[2], box4[5], box4[8])

        box[8] = box8
        row[6].splice(6, 3, box8[0], box8[1], box8[2])
        row[7].splice(6, 3, box8[3], box8[4], box8[5])
        row[8].splice(6, 3, box8[6], box8[7], box8[8])
        col[6].splice(6, 3, box8[0], box8[3], box8[6])
        col[7].splice(6, 3, box8[1], box8[4], box8[7])
        col[8].splice(6, 3, box8[2], box8[5], box8[8])

        // box1 
        const box1: number[] = getRandomInt(null, null)

        const temp1 = [...box1]

        while (temp1.length != 0) {

            for (let idx = 0; idx < temp1.length; idx++) {


                if (!row[0].includes(temp1[idx])) {
                    if (!col[3].includes(temp1[idx]) && box[1][0] == null) {
                        box[1].splice(0, 1, temp1[idx])
                        row[0].splice(3, 1, temp1[idx])
                        col[3].splice(0, 1, temp1[idx])
                        temp1.splice(idx, 1)
                        break
                    } else if (!col[4].includes(temp1[idx]) && box[1][1] == null) {
                        box[1].splice(1, 1, temp1[idx])
                        row[0].splice(4, 1, temp1[idx])
                        col[4].splice(0, 1, temp1[idx])
                        temp1.splice(idx, 1)
                        break
                    } else if (!col[5].includes(temp1[idx]) && box[1][2] == null) {
                        box[1].splice(2, 1, temp1[idx])
                        row[0].splice(5, 1, temp1[idx])
                        col[5].splice(0, 1, temp1[idx])
                        temp1.splice(idx, 1)
                        break
                    }
                } if (!row[1].includes(temp1[idx])) {
                    if (!col[3].includes(temp1[idx]) && box[1][3] == null) {
                        box[1].splice(3, 1, temp1[idx])
                        row[1].splice(3, 1, temp1[idx])
                        col[3].splice(1, 1, temp1[idx])
                        temp1.splice(idx, 1)
                        break
                    } else if (!col[4].includes(temp1[idx]) && box[1][4] == null) {
                        box[1].splice(4, 1, temp1[idx])
                        row[1].splice(4, 1, temp1[idx])
                        col[4].splice(1, 1, temp1[idx])
                        temp1.splice(idx, 1)
                        break
                    } else if (!col[5].includes(temp1[idx]) && box[1][5] == null) {
                        box[1].splice(5, 1, temp1[idx])
                        row[1].splice(5, 1, temp1[idx])
                        col[5].splice(1, 1, temp1[idx])
                        temp1.splice(idx, 1)
                        break
                    }
                } if (!row[2].includes(temp1[idx])) {
                    if (!col[3].includes(temp1[idx]) && box[1][6] == null) {
                        box[1].splice(6, 1, temp1[idx])
                        row[2].splice(3, 1, temp1[idx])
                        col[3].splice(2, 1, temp1[idx])
                        temp1.splice(idx, 1)
                        break
                    } else if (!col[4].includes(temp1[idx]) && box[1][7] == null) {
                        box[1].splice(7, 1, temp1[idx])
                        row[2].splice(4, 1, temp1[idx])
                        col[4].splice(2, 1, temp1[idx])
                        temp1.splice(idx, 1)
                        break
                    } else if (!col[5].includes(temp1[idx]) && box[1][8] == null) {
                        box[1].splice(8, 1, temp1[idx])
                        row[2].splice(5, 1, temp1[idx])
                        col[5].splice(2, 1, temp1[idx])
                        temp1.splice(idx, 1)
                        break
                    }
                }
            }
        }

        // box2

        const box2 = getRandomInt(null, null)

        const temp2 = [...box2]

        while (temp2.length != 0) {

            for (let idx = 0; idx < temp2.length; idx++) {

                if (!row[0].includes(temp2[idx])) {
                    if (!col[3].includes(temp2[idx]) && box[2][0] == null) {
                        box[2].splice(0, 1, temp2[idx])
                        row[0].splice(6, 1, temp2[idx])
                        col[3].splice(0, 1, temp2[idx])
                        temp2.splice(idx, 1)
                        break
                    } else if (!col[4].includes(temp2[idx]) && box[2][1] == null) {
                        box[2].splice(1, 1, temp2[idx])
                        row[0].splice(7, 1, temp2[idx])
                        col[4].splice(0, 1, temp2[idx])
                        temp2.splice(idx, 1)
                        break
                    } else if (!col[5].includes(temp2[idx]) && box[2][2] == null) {
                        box[2].splice(2, 1, temp2[idx])
                        row[0].splice(8, 1, temp2[idx])
                        col[5].splice(0, 1, temp2[idx])
                        temp2.splice(idx, 1)
                        break
                    }
                } if (!row[1].includes(temp2[idx])) {
                    if (!col[3].includes(temp2[idx]) && box[2][3] == null) {
                        box[2].splice(3, 1, temp2[idx])
                        row[1].splice(6, 1, temp2[idx])
                        col[3].splice(1, 1, temp2[idx])
                        temp2.splice(idx, 1)
                        break
                    } else if (!col[4].includes(temp2[idx]) && box[2][4] == null) {
                        box[2].splice(4, 1, temp2[idx])
                        row[1].splice(7, 1, temp2[idx])
                        col[4].splice(1, 1, temp2[idx])
                        temp2.splice(idx, 1)
                        break
                    } else if (!col[5].includes(temp2[idx]) && box[2][5] == null) {
                        box[2].splice(5, 1, temp2[idx])
                        row[1].splice(8, 1, temp2[idx])
                        col[5].splice(1, 1, temp2[idx])
                        temp2.splice(idx, 1)
                        break
                    }
                } if (!row[2].includes(temp2[idx])) {
                    if (!col[3].includes(temp2[idx]) && box[2][6] == null) {
                        box[2].splice(6, 1, temp2[idx])
                        row[2].splice(6, 1, temp2[idx])
                        col[3].splice(2, 1, temp2[idx])
                        temp2.splice(idx, 1)
                        break
                    } else if (!col[4].includes(temp2[idx]) && box[2][7] == null) {
                        box[2].splice(7, 1, temp2[idx])
                        row[2].splice(7, 1, temp2[idx])
                        col[4].splice(2, 1, temp2[idx])
                        temp2.splice(idx, 1)
                        break
                    } else if (!col[5].includes(temp2[idx]) && box[2][8] == null) {
                        box[2].splice(8, 1, temp2[idx])
                        row[2].splice(8, 1, temp2[idx])
                        col[5].splice(2, 1, temp2[idx])
                        temp2.splice(idx, 1)
                        break
                    }
                }
            }
        }


        // box3

        const box3 = getRandomInt(null, null)

        const temp3 = [...box3]

        while (temp3.length != 0) {

            for (let idx = 0; idx < temp3.length; idx++) {


                if (!row[3].includes(temp3[idx])) {
                    if (!col[0].includes(temp3[idx]) && box[3][0] == null) {
                        box[3].splice(0, 1, temp3[idx])
                        row[3].splice(0, 1, temp3[idx])
                        col[0].splice(3, 1, temp3[idx])
                        temp3.splice(idx, 1)
                        break
                    } else if (!col[1].includes(temp3[idx]) && box[3][1] == null) {
                        box[3].splice(1, 1, temp3[idx])
                        row[3].splice(1, 1, temp3[idx])
                        col[1].splice(3, 1, temp3[idx])
                        temp3.splice(idx, 1)
                        break
                    } else if (!col[2].includes(temp3[idx]) && box[3][2] == null) {
                        box[3].splice(2, 1, temp3[idx])
                        row[3].splice(2, 1, temp3[idx])
                        col[2].splice(3, 1, temp3[idx])
                        temp3.splice(idx, 1)
                        break
                    }
                } if (!row[4].includes(temp3[idx])) {
                    if (!col[0].includes(temp3[idx]) && box[3][3] == null) {
                        box[3].splice(3, 1, temp3[idx])
                        row[4].splice(0, 1, temp3[idx])
                        col[0].splice(4, 1, temp3[idx])
                        temp3.splice(idx, 1)
                        break
                    } else if (!col[1].includes(temp3[idx]) && box[3][4] == null) {
                        box[3].splice(4, 1, temp3[idx])
                        row[4].splice(1, 1, temp3[idx])
                        col[1].splice(4, 1, temp3[idx])
                        temp3.splice(idx, 1)
                        break
                    } else if (!col[2].includes(temp3[idx]) && box[3][5] == null) {
                        box[3].splice(5, 1, temp3[idx])
                        row[4].splice(2, 1, temp3[idx])
                        col[2].splice(4, 1, temp3[idx])
                        temp3.splice(idx, 1)
                        break
                    }
                } if (!row[5].includes(temp3[idx])) {
                    if (!col[0].includes(temp3[idx]) && box[3][6] == null) {
                        box[3].splice(6, 1, temp3[idx])
                        row[5].splice(0, 1, temp3[idx])
                        col[0].splice(5, 1, temp3[idx])
                        temp3.splice(idx, 1)
                        break
                    } else if (!col[1].includes(temp3[idx]) && box[3][7] == null) {
                        box[3].splice(7, 1, temp3[idx])
                        row[5].splice(1, 1, temp3[idx])
                        col[1].splice(5, 1, temp3[idx])
                        temp3.splice(idx, 1)
                        break
                    } else if (!col[2].includes(temp3[idx]) && box[3][8] == null) {
                        box[3].splice(8, 1, temp3[idx])
                        row[5].splice(2, 1, temp3[idx])
                        col[2].splice(5, 1, temp3[idx])
                        temp3.splice(idx, 1)
                        break
                    }
                }
            }

        }

        // box5

        const box5 = getRandomInt(null, null)

        const temp5 = [...box5]

        while (temp5.length != 0) {

            for (let idx = 0; idx < temp5.length; idx++) {


                if (!row[3].includes(temp5[idx])) {
                    if (!col[6].includes(temp5[idx]) && box[5][0] == null) {
                        box[5].splice(0, 1, temp5[idx])
                        row[3].splice(6, 1, temp5[idx])
                        col[6].splice(3, 1, temp5[idx])
                        temp5.splice(idx, 1)
                        break
                    } else if (!col[7].includes(temp5[idx]) && box[5][1] == null) {
                        box[5].splice(1, 1, temp5[idx])
                        row[3].splice(7, 1, temp5[idx])
                        col[7].splice(3, 1, temp5[idx])
                        temp5.splice(idx, 1)
                        break
                    } else if (!col[8].includes(temp5[idx]) && box[5][2] == null) {
                        box[5].splice(2, 1, temp5[idx])
                        row[3].splice(8, 1, temp5[idx])
                        col[8].splice(3, 1, temp5[idx])
                        temp5.splice(idx, 1)
                        break
                    }
                } if (!row[4].includes(temp5[idx])) {
                    if (!col[6].includes(temp5[idx]) && box[5][3] == null) {
                        box[5].splice(3, 1, temp5[idx])
                        row[4].splice(6, 1, temp5[idx])
                        col[6].splice(4, 1, temp5[idx])
                        temp5.splice(idx, 1)
                        break
                    } else if (!col[7].includes(temp5[idx]) && box[5][4] == null) {
                        box[5].splice(4, 1, temp5[idx])
                        row[4].splice(7, 1, temp5[idx])
                        col[7].splice(4, 1, temp5[idx])
                        temp5.splice(idx, 1)
                        break
                    } else if (!col[8].includes(temp5[idx]) && box[5][5] == null) {
                        box[5].splice(5, 1, temp5[idx])
                        row[4].splice(8, 1, temp5[idx])
                        col[8].splice(4, 1, temp5[idx])
                        temp5.splice(idx, 1)
                        break
                    }
                } if (!row[5].includes(temp5[idx])) {
                    if (!col[6].includes(temp5[idx]) && box[5][6] == null) {
                        box[5].splice(6, 1, temp5[idx])
                        row[5].splice(6, 1, temp5[idx])
                        col[6].splice(5, 1, temp5[idx])
                        temp5.splice(idx, 1)
                        break
                    } else if (!col[7].includes(temp5[idx]) && box[5][7] == null) {
                        box[5].splice(7, 1, temp5[idx])
                        row[5].splice(7, 1, temp5[idx])
                        col[7].splice(5, 1, temp5[idx])
                        temp5.splice(idx, 1)
                        break
                    } else if (!col[8].includes(temp5[idx]) && box[5][8] == null) {
                        box[5].splice(8, 1, temp5[idx])
                        row[5].splice(8, 1, temp5[idx])
                        col[8].splice(5, 1, temp5[idx])
                        temp5.splice(idx, 1)
                        break
                    }
                }
            }
        }


        // box6

        const box6 = getRandomInt(null, null)

        const temp6 = [...box6]

        while (temp6.length != 0) {

            for (let idx = 0; idx < temp6.length; idx++) {

                if (!row[6].includes(temp6[idx])) {
                    if (!col[0].includes(temp6[idx]) && box[6][0] == null) {
                        box[6].splice(0, 1, temp6[idx])
                        row[6].splice(0, 1, temp6[idx])
                        col[0].splice(6, 1, temp6[idx])
                        temp6.splice(idx, 1)
                        break
                    } else if (!col[1].includes(temp6[idx]) && box[6][1] == null) {
                        box[6].splice(1, 1, temp6[idx])
                        row[6].splice(1, 1, temp6[idx])
                        col[1].splice(6, 1, temp6[idx])
                        temp6.splice(idx, 1)
                        break
                    } else if (!col[2].includes(temp6[idx]) && box[6][2] == null) {
                        box[6].splice(2, 1, temp6[idx])
                        row[6].splice(2, 1, temp6[idx])
                        col[2].splice(6, 1, temp6[idx])
                        temp6.splice(idx, 1)
                        break
                    }
                } if (!row[7].includes(temp6[idx])) {
                    if (!col[0].includes(temp6[idx]) && box[6][3] == null) {
                        box[6].splice(3, 1, temp6[idx])
                        row[7].splice(0, 1, temp6[idx])
                        col[0].splice(7, 1, temp6[idx])
                        temp6.splice(idx, 1)
                        break
                    } else if (!col[1].includes(temp6[idx]) && box[6][4] == null) {
                        box[6].splice(4, 1, temp6[idx])
                        row[7].splice(1, 1, temp6[idx])
                        col[1].splice(7, 1, temp6[idx])
                        temp6.splice(idx, 1)
                        break
                    } else if (!col[2].includes(temp6[idx]) && box[6][5] == null) {
                        box[6].splice(5, 1, temp6[idx])
                        row[7].splice(2, 1, temp6[idx])
                        col[2].splice(7, 1, temp6[idx])
                        temp6.splice(idx, 1)
                        break
                    }
                } if (!row[8].includes(temp6[idx])) {
                    if (!col[0].includes(temp6[idx]) && box[6][6] == null) {
                        box[6].splice(6, 1, temp6[idx])
                        row[8].splice(0, 1, temp6[idx])
                        col[0].splice(8, 1, temp6[idx])
                        temp6.splice(idx, 1)
                        break
                    } else if (!col[1].includes(temp6[idx]) && box[6][7] == null) {
                        box[6].splice(7, 1, temp6[idx])
                        row[8].splice(1, 1, temp6[idx])
                        col[1].splice(8, 1, temp6[idx])
                        temp6.splice(idx, 1)
                        break
                    } else if (!col[2].includes(temp6[idx]) && box[6][8] == null) {
                        box[6].splice(8, 1, temp6[idx])
                        row[8].splice(2, 1, temp6[idx])
                        col[2].splice(8, 1, temp6[idx])
                        temp6.splice(idx, 1)
                        break
                    }
                }
            }

        }


        // box7 
        const box7: number[] = getRandomInt(null, null)

        const temp7 = [...box7]

        while (temp7.length != 0) {

            for (let idx = 0; idx < temp7.length; idx++) {


                if (!row[6].includes(temp7[idx])) {
                    if (!col[3].includes(temp7[idx]) && box[7][0] == null) {
                        box[7].splice(0, 1, temp7[idx])
                        row[6].splice(3, 1, temp7[idx])
                        col[3].splice(6, 1, temp7[idx])
                        temp7.splice(idx, 1)
                        break
                    } else if (!col[4].includes(temp7[idx]) && box[7][1] == null) {
                        box[7].splice(1, 1, temp7[idx])
                        row[6].splice(4, 1, temp7[idx])
                        col[4].splice(6, 1, temp7[idx])
                        temp7.splice(idx, 1)
                        break
                    } else if (!col[5].includes(temp7[idx]) && box[7][2] == null) {
                        box[7].splice(2, 1, temp7[idx])
                        row[6].splice(5, 1, temp7[idx])
                        col[5].splice(6, 1, temp7[idx])
                        temp7.splice(idx, 1)
                        break
                    }
                } if (!row[7].includes(temp7[idx])) {
                    if (!col[3].includes(temp7[idx]) && box[7][3] == null) {
                        box[7].splice(3, 1, temp7[idx])
                        row[7].splice(3, 1, temp7[idx])
                        col[3].splice(7, 1, temp7[idx])
                        temp7.splice(idx, 1)
                        break
                    } else if (!col[4].includes(temp7[idx]) && box[7][4] == null) {
                        box[7].splice(4, 1, temp7[idx])
                        row[7].splice(4, 1, temp7[idx])
                        col[4].splice(7, 1, temp7[idx])
                        temp7.splice(idx, 1)
                        break
                    } else if (!col[5].includes(temp7[idx]) && box[7][5] == null) {
                        box[7].splice(5, 1, temp7[idx])
                        row[7].splice(5, 1, temp7[idx])
                        col[5].splice(7, 1, temp7[idx])
                        temp7.splice(idx, 1)
                        break
                    }
                } if (!row[8].includes(temp7[idx])) {
                    if (!col[3].includes(temp7[idx]) && box[7][6] == null) {
                        box[7].splice(6, 1, temp7[idx])
                        row[8].splice(3, 1, temp7[idx])
                        col[3].splice(8, 1, temp7[idx])
                        temp7.splice(idx, 1)
                        break
                    } else if (!col[4].includes(temp7[idx]) && box[7][7] == null) {
                        box[7].splice(7, 1, temp7[idx])
                        row[8].splice(4, 1, temp7[idx])
                        col[4].splice(8, 1, temp7[idx])
                        temp7.splice(idx, 1)
                        break
                    } else if (!col[5].includes(temp7[idx]) && box[7][8] == null) {
                        box[7].splice(8, 1, temp7[idx])
                        row[8].splice(5, 1, temp7[idx])
                        col[5].splice(8, 1, temp7[idx])
                        temp7.splice(idx, 1)
                        break
                    }
                }
            }
        }




        return { box, row, col }

    }, [])


    const [box, setBox] = useState(store.box)
    const [row, setRow] = useState(store.row)
    const [col, setCol] = useState(store.col)
    const [isActive, setActive] = useState(() => Array(9).fill(null).map(() => Array(9).fill(false))
    )

    // 랜더링이 이루어지는 도중에 상태를 변경하게 되면 무한루프가 발생한다.
    // useEffect 나 이벤트 핸들러를 사용하여 조건부로 상태를 변경하도록 한다.
    // setTotalNumber(prevState => {
    //     const newTotalNumber = [...prevState]
    //     newTotalNumber[0] = getRandomInt(null, null)
    //     return newTotalNumber
    // })
    //

    function onPlay() {
        return null
    }

    return (<div className="container mx-auto flex flex-col items-center">
        <Link className="text-tokyo_green-500 text-3xl" href="/">Home </Link>
        <div className="">
            <SudokuBoard isActive={isActive} setActive={setActive} box={box} row={row} col={col} onPlay={onPlay} />
        </div>
    </div>

    )
}
