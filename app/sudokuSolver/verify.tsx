"use client"
import { useState } from "react"
import Link from "next/link"
import "../globals.css"

class DL_Node {

    row: number
    col: number
    count: number
    matrix: DL_Matrix
    up: DL_Node
    down: DL_Node
    left: DL_Node
    right: DL_Node

    constructor(row: number, col: number, count: number | null, matrix: DL_Matrix, up: DL_Node | null, down: DL_Node | null, left: DL_Node | null, right: DL_Node | null) {
        this.row = row
        this.col = col
        this.count = count !== null ? count : 1
        this.matrix = matrix
        this.up = up ? up : this
        this.down = down ? down : this
        this.left = left ? left : this
        this.right = right ? right : this
    }

    // 파이썬에서는 yield 를 사용해서 배열 전체를 순환하고 나서 반환하는게 아니라 
    // 순환하면서 그때 그때 반환 노드를 반환한다.
    *itrUp(excl: boolean | null) {
        // excl false 받으면 자기 자신 포함 
        excl = excl !== null ? excl : true

        let itr: DL_Node = this

        if (!excl) {
            yield itr
        }

        let itrUp = itr.up

        while (itrUp != this) {
            yield itrUp
            itrUp = itrUp.up
        }
    }

    // 파이썬에서는 yield 를 사용해서 배열 전체를 순환하고 나서 반환하는게 아니라 
    // 순환하면서 그때 그때 반환 노드를 반환한다.
    *itrDown(excl: boolean | null) {
        // excl false 받으면 자기 자신 포함 
        excl = excl !== null ? excl : true

        let itr: DL_Node = this


        if (!excl) {
            yield itr
        }

        let itrDown = itr.down

        while (itrDown != this) {
            yield itrDown
            itrDown = itrDown.down
        }
    }

    // 파이썬에서는 yield 를 사용해서 배열 전체를 순환하고 나서 반환하는게 아니라 
    // 순환하면서 그때 그때 반환 노드를 반환한다.
    *itrLeft(excl: boolean | null) {
        // excl false 받으면 자기 자신 포함
        excl = excl !== null ? excl : true

        let itr: DL_Node = this


        if (!excl) {
            yield itr
        }

        let itrLeft = itr.left

        while (itrLeft != this) {
            yield itrLeft
            itrLeft = itrLeft.left
        }
    }

    // 파이썬에서는 yield 를 사용해서 배열 전체를 순환하고 나서 반환하는게 아니라 
    // 순환하면서 그때 그때 반환 노드를 반환한다.
    *itrRight(excl: boolean | null) {
        // excl false 받으면 자기 자신 포함
        excl = excl !== null ? excl : true

        let itr: DL_Node = this


        if (!excl) {
            yield itr
        }

        let itrRight = itr.right

        while (itrRight != this) {
            yield itrRight
            itrRight = itrRight.right
        }
    }

    // 노드의 header 반환
    getCol() {
        if (this.col == -1) {
            return this.matrix.root
        }
        return this.matrix.cols[this.col]
    }

    // 해당 컬럼이 피복 되었는지 반환
    colIsCovered() {
        if (this.getCol().right.left === this.getCol()) {
            return false
        } else {
            return true
        }
    }
}



class DL_Matrix {
    root: DL_Node
    rows: DL_Node[]
    cols: DL_Node[]
    solved: Boolean

    constructor(num_rows: number, num_cols: number) {

        this.root = new DL_Node(-1, -1, null, this, null, null, null, null)
        this.rows = []
        for (let cnt = 0; cnt < num_rows; cnt++) {
            const headerNode = new DL_Node(cnt, -1, null, this, null, null, null, null)
            this.rows.push(headerNode)
        }
        this.cols = []
        for (let cnt = 0; cnt < num_cols; cnt++) {
            const headerNode = new DL_Node(-1, cnt, 0, this, null, null, null, null)
            this.cols.push(headerNode)
        }
        this.solved = false

        this.rows.forEach((node, index) => {
            node.right = node
            node.left = node
            node.down = index < this.rows.length - 1 ? this.rows[index + 1] : this.root
            node.up = index > 0 ? this.rows[index - 1] : this.root
        })

        this.cols.forEach((node, index) => {
            node.up = node
            node.down = node
            node.right = index < this.cols.length - 1 ? this.cols[index + 1] : this.root
            node.left = index > 0 ? this.cols[index - 1] : this.root
        })

        this.root.right = this.cols[0]
        this.root.left = this.cols[-1]
        this.root.down = this.rows[0]
        this.root.up = this.rows[-1]
    }

    selectMinCol() {
        if (this.isEmpty()) {
            return this.root
        }

        // cols[0]
        let minNode = this.root.right

        let minCount = this.root.right.count

        for (const col of this.root.itrRight(null)) {
            if (col.count < minCount) {
                minCount = col.count
                minNode = col
            }
        }

        return minNode
    }


    isEmpty() {
        if (this.root.right == this.root) {
            return true
        } else {
            return false
        }
    }

    static cover(node: DL_Node) {
        // column header
        let header = node.getCol()

        // unlink left and right of column header
        header.right.left = header.left
        header.left.right = header.right

        for (const col of header.itrDown(null)) {

            for (const row of col.itrRight(null)) {
                row.up.down = row.down
                row.down.up = row.up
                row.getCol().count -= 1
            }
        }
    }

    // 해당 컬럼 위로, 왼쪽으로 순회하면서 노드 재연결
    static uncover(node: DL_Node) {
        // column header
        let header = node.getCol()

        for (const col of header.itrUp(null)) {

            for (const row of col.itrLeft(null)) {
                row.up.down = row
                row.down.up = row
                row.getCol().count += 1
            }

        }

        header.right.left = header
        header.left.right = header
    }


    alg_x_search() {
        let solutions: number[] = []

        const search = () => {
            if (this.isEmpty()) {
                this.solved = true
                return true
            }

            let selectedCol = this.selectMinCol()

            if (selectedCol.count < 1) {
                return false
            }

            for (const col of selectedCol.itrDown(null)) {

                solutions.push(col.row)

                for (const node of col.itrRight(false)) {

                    if (node.col >= 0) {
                        DL_Matrix.cover(node)
                    }
                }

                // 재귀호출로 깊이 탐색
                if (search()) {
                    break
                }

                // 재귀 호출로 해결되지 않았을 때 후보 삭제
                solutions.splice(-1, 1)

                for (const node of col.left.itrLeft(false)) {
                    if (node.col >= 0) {
                        DL_Matrix.uncover(node)
                    }
                }

                return this.solved
            }

        }
        search()

        return solutions

    }

    // 해당 컬럼 아래로, 오른쪽으로 순회하면서 노드 연결 해제
    insertNode(row: number, col: number) {

        if (row >= 0 && col >= 0 && row < (this.rows.length) && col < (this.cols.length)) {

            let newNode = new DL_Node(row, col, null, this, null, null, null, null)

            var n = this.root

            // 오른쪽 순회하다가 끝을 만나면 break 후 해당 자리에 노드 연결
            for (const node of this.rows[row].itrRight(false)) {
                if (node.right.col == -1 || node.right.col > col) {
                    n = node
                    break
                }
            }

            newNode.right = n.right
            newNode.left = n
            newNode.right.left = newNode

            n.right = newNode


            // 아래쪽 순회하다가 끝을 만나면 break 후 해당 자리에 노드 연결
            for (const node of this.cols[col].itrDown(false)) {
                if (node.down.row == -1 || node.down.row > row) {
                    n = node
                    break
                }
            }

            newNode.down = n.down
            newNode.up = n
            newNode.down.up = newNode
            n.down = newNode
            this.cols[col].count += 1
        }
    }
}

// 각 셀당 1개의 숫자
function numberConstraint(row: number, dim: number) {
    return Math.floor(row / dim)
}

// row 당 1~9 하나씩
function rowConstraint(row: number, dim: number) {
    return Math.pow(dim, 2) + dim * (Math.floor(row / Math.pow(dim, 2))) + row % dim
}

// col 당 1~9 하나씩
function colConstraint(row: number, dim: number) {
    return 2 * Math.pow(dim, 2) + (row % Math.pow(dim, 2))
}

// box 당 1~9 하나씩
function boxConstraint(row: number, dim: number) {
    const sqrt = Math.sqrt(dim)
    return Number(3 * Math.pow(dim, 2) + (Math.floor(row / (sqrt * Math.pow(dim, 2)))) * (dim * sqrt) + ((Math.floor(row / (sqrt * dim))) % sqrt) * dim + (row % dim))
}

const constraint_list = [numberConstraint, rowConstraint, colConstraint, boxConstraint]

function listToMatrix(puzzle: number[], dim: number) {
    const numRows = Math.pow(dim, 3)

    const numCols = Math.pow(dim, 2) * constraint_list.length

    const matrix = new DL_Matrix(numRows, numCols)

    puzzle.forEach((value, index) => {
        if (value == 0) {

            for (let cnt = 0; cnt < dim; cnt++) {
                const row = index * dim + cnt

                constraint_list.forEach((func, index) => {
                    matrix.insertNode(row, func(row, dim))
                })
            }
        } else {
            const row = index * dim + value - 1
            constraint_list.forEach((func, index) => {
                matrix.insertNode(row, func(row, dim))
            })
        }
    })

    return matrix
}

function solvePuzzle(puzzle: number[]) {
    const dim = Number(Math.sqrt(puzzle.length))

    if (Math.pow(Number(dim + 0.5), 2) == puzzle.length) {

        const solutionList: number[] = listToMatrix(puzzle, dim).alg_x_search()

        if (solutionList == null) {
            return []
        }

        const solvedPuzzle = Array(Math.pow(dim, 2)).fill(0)


        solutionList.forEach((row, index) => {
            solvedPuzzle[Math.floor(row / dim)] = (row % dim) + 1
        })

        return solvedPuzzle
    }
}

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
function SudokuBoard({ totalNumber, setTotalNumber, isActive, setActive, onPlay }: { totalNumber: number[], setTotalNumber: any, isActive: boolean[][], setActive: any, onPlay: any }) {

    function handleBoxClick(e: Event) {
        // 박스 클릭 시 행동
        const target = e.target as HTMLElement
        // 박스 안의 숫자 콘솔 출력
        if (target && 'innerHTML' in target) {
            console.log(target.innerHTML)
        }



        onPlay()
        // 1. state 로 전달받은 true false 
        // 2. state 에 따라 숫자 박스의 클래스를 변경시켜 배경색을 바꾼다
        // 3. 클릭한 박스와 관계된 박스의 state 를 변경시켜 똑같이 배경색을 바꾼다
        // 4. 관계된 박스는 박스에 입력된 숫자와 같은 숫자 박스, 같은 행, 같은 열, 같은 박스 그룹
        //
        // 5. 숫자 입력용 인터페이스와 상호작용하여 숫자 박스에 반영한다.
        // => 아마도 Game 컴포넌트에게 넘겨 받은 onPlay 를 실행시켜 반환된 값을 숫자 박스에 넘겨주면 될듯하다

    }

    let solution = solvePuzzle(totalNumber)

    if (solution == undefined) {
        solution = [...totalNumber]
    }

    return (
        <div className="SudokuBoard">
            {solution.map((value, index) => {
                let row = Math.floor(index / 9)
                let col = index % 9
                let box = 0
                if (row < 3) {
                    if (col < 3) {
                        box = 0
                    } else if (col < 6) {
                        box = 1
                    } else {
                        box = 2
                    }
                } else if (row < 6) {
                    if (col < 3) {
                        box = 3
                    } else if (col < 6) {
                        box = 4
                    } else {
                        box = 5
                    }

                } else {

                    if (col < 3) {
                        box = 6
                    } else if (col < 6) {
                        box = 7
                    } else {
                        box = 8
                    }
                }
                return (
                    <NumberBox
                        key={`${box}-${row}-${col}`}
                        id={`${box}-${row}-${col}`}
                        box={index}
                        row={row}
                        col={col}
                        value={value}
                        className={``}
                        onBoxClick={handleBoxClick}
                    />
                )
            })}
        </div >
    )
}

// // 숫자 생성
// function getRandomInt() {
//     const arr: number[] = []
//
//     while (arr.length < 9) {
//         let number = Math.floor(Math.random() * 9) + 1
//
//         if (arr.includes(number)) {
//             continue
//         }
//
//         arr.push(number)
//     }
//
//     return arr
// }

// 전체 게임판 컴포넌트
export default function SudokuGame() {

    const arr = [
        0, 0, 8, 9, 0, 0, 3, 4, 5,
        0, 4, 3, 8, 5, 0, 7, 0, 6,
        6, 0, 2, 4, 0, 0, 0, 0, 0,
        0, 0, 0, 2, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 8, 0, 0, 0, 0,
        0, 0, 0, 7, 0, 4, 1, 0, 2,
        0, 0, 0, 0, 9, 0, 0, 0, 0,
        5, 0, 0, 0, 0, 2, 0, 8, 0,
        7, 0, 0, 0, 6, 0, 0, 1, 3
    ]

    const [totalNumber, setTotalNumber] = useState(arr)
    const [isActive, setActive] = useState(Array(9).fill(null).map(() => Array(9).fill(false)))


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
