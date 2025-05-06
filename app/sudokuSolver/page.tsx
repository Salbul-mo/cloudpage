"use client"
import { useState, useEffect } from "react"
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
        //console.log(`DL_Node created: row=${row}, col=${col}, count=${this.count}`)
    }

    // 순환하면서 그때 그때 반환 노드를 반환
    *itrUp(excl: boolean | null) {
        //console.log(`itrUp called: excl=${excl}, node(${this.row},${this.col})`)
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

    *itrDown(excl: boolean | null) {
        //console.log(`itrDown called: excl=${excl}, node(${this.row},${this.col})`)
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

    *itrLeft(excl: boolean | null) {
        //console.log(`itrLeft called: excl=${excl}, node(${this.row},${this.col})`)
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

    *itrRight(excl: boolean | null) {
        //console.log(`itrRight called: excl=${excl}, node(${this.row},${this.col})`)
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
        //console.log(`getCol called for node(${this.row},${this.col})`)
        if (this.col == -1) {
            return this.matrix.root
        }
        return this.matrix.cols[this.col]
    }

    // 해당 컬럼이 피복 되었는지 반환
    colIsCovered() {
        //console.log(`colIsCovered called for node(${this.row},${this.col})`)
        if (this.getCol().right.left === this.getCol()) {
            //console.log(`Column ${this.col} is NOT covered`)
            return false
        } else {
            //console.log(`Column ${this.col} IS covered`)
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
        //console.log(`Creating DL_Matrix: rows=${num_rows}, cols=${num_cols}`)
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

        //console.log(`Linking row nodes: ${this.rows.length} rows`)
        this.rows.forEach((node, index) => {
            node.right = node
            node.left = node
            node.down = index < this.rows.length - 1 ? this.rows[index + 1] : this.root
            node.up = index > 0 ? this.rows[index - 1] : this.root
        })

        //console.log(`Linking column nodes: ${this.cols.length} columns`)
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
        //console.log(`DL_Matrix creation completed`)
    }

    selectMinCol() {
        //console.log(`Selecting minimum column`)
        if (this.isEmpty()) {
            //console.log(`Matrix is empty, returning root`)
            return this.root
        }

        // cols[0]
        let minNode = this.root.right

        let minCount = this.root.right.count
        //console.log(`Initial min count: ${minCount}, col: ${minNode.col}`)

        for (const col of this.root.itrRight(null)) {
            if (col.count < minCount) {
                minCount = col.count
                minNode = col
                //console.log(`New min count: ${minCount}, col: ${col.col}`)
            }
        }

        //console.log(`Selected min column: ${minNode.col} with count ${minNode.count}`)
        return minNode
    }

    isEmpty() {
        const empty = this.root.right == this.root
        //console.log(`Matrix isEmpty check: ${empty}`)
        return empty
    }

    static cover(node: DL_Node) {
        //console.log(`Covering node(${node.row},${node.col})`)
        // column header
        let header = node.getCol()

        // unlink left and right of column header
        header.right.left = header.left
        header.left.right = header.right
        //console.log(`Column ${header.col} header unlinked`)

        for (const col of header.itrDown(null)) {
            //console.log(`Processing row ${col.row} in column cover`)
            for (const row of col.itrRight(null)) {
                row.up.down = row.down
                row.down.up = row.up
                row.getCol().count -= 1
                //console.log(`Unlinked node(${row.row},${row.col}), new count: ${row.getCol().count}`)
            }
        }
    }

    static uncover(node: DL_Node) {
        //console.log(`Uncovering node(${node.row},${node.col})`)
        // column header
        let header = node.getCol()

        for (const col of header.itrUp(null)) {
            //console.log(`Processing row ${col.row} in column uncover`)
            for (const row of col.itrLeft(null)) {
                row.up.down = row
                row.down.up = row
                row.getCol().count += 1
                //console.log(`Relinked node(${row.row},${row.col}), new count: ${row.getCol().count}`)
            }
        }

        header.right.left = header
        header.left.right = header
        //console.log(`Column ${header.col} header relinked`)
    }

    alg_x_search() {
        //console.log(`Starting Algorithm X search`)
        let solutions: number[] = []

        const search = () => {
            //console.log(`Search iteration, current solution length: ${solutions.length}`)
            if (this.isEmpty()) {
                //console.log(`Matrix is empty, solution found!`)
                this.solved = true
                return true
            }

            let selectedCol = this.selectMinCol()

            if (selectedCol.count < 1) {
                //console.log(`Selected column ${selectedCol.col} has count < 1, backtracking`)
                return false
            }

            //console.log(`Trying rows in column ${selectedCol.col}`)
            for (const col of selectedCol.itrDown(null)) {
                //console.log(`Selected row ${col.row}`)
                solutions.push(col.row)
                //console.log(`Current solution: [${solutions.join(', ')}]`)

                for (const node of col.itrRight(false)) {
                    if (node.col >= 0) {
                        //console.log(`Covering connected node(${node.row},${node.col})`)
                        DL_Matrix.cover(node)
                    }
                }

                // 재귀호출로 깊이 탐색
                //console.log(`Recursive search with solution length: ${solutions.length}`)
                if (search()) {
                    //console.log(`Solution found in recursive call, breaking`)
                    break
                }

                // 재귀 호출로 해결되지 않았을 때 후보 삭제
                //console.log(`Backtracking: removing last candidate row ${solutions[solutions.length - 1]}`)
                solutions.splice(-1, 1)
                //console.log(`Solution after backtrack: [${solutions.join(', ')}]`)

                for (const node of col.left.itrLeft(false)) {
                    if (node.col >= 0) {
                        //console.log(`Uncovering connected node(${node.row},${node.col})`)
                        DL_Matrix.uncover(node)
                    }
                }

            }
            return this.solved
        }

        //console.log(`Executing search algorithm`)
        search()
        //console.log(`Search completed, found ${solutions.length} solution elements`)

        return solutions
    }

    insertNode(row: number, col: number) {
        //console.log(`Inserting node at (${row},${col})`)
        if (row >= 0 && col >= 0 && row < (this.rows.length) && col < (this.cols.length)) {
            let newNode = new DL_Node(row, col, null, this, null, null, null, null)

            var n = this.root

            // 오른쪽 순회하다가 끝을 만나면 break 후 해당 자리에 노드 연결
            //console.log(`Finding horizontal position for node(${row},${col})`)
            for (const node of this.rows[row].itrRight(false)) {
                if (node.right.col == -1 || node.right.col > col) {
                    n = node
                    //console.log(`Horizontal position found after node(${n.row},${n.col})`)
                    break
                }
            }

            newNode.right = n.right
            newNode.left = n
            newNode.right.left = newNode
            n.right = newNode
            //console.log(`Horizontal links created for node(${row},${col})`)

            // 아래쪽 순회하다가 끝을 만나면 break 후 해당 자리에 노드 연결
            //console.log(`Finding vertical position for node(${row},${col})`)
            for (const node of this.cols[col].itrDown(false)) {
                if (node.down.row == -1 || node.down.row > row) {
                    n = node
                    //console.log(`Vertical position found after node(${n.row},${n.col})`)
                    break
                }
            }

            newNode.down = n.down
            newNode.up = n
            newNode.down.up = newNode
            n.down = newNode
            this.cols[col].count += 1
            //console.log(`Vertical links created for node(${row},${col}), new column count: ${this.cols[col].count}`)
        } else {
            //console.warn(`Invalid node position: (${row},${col})`)
        }
    }
}

// 각 셀당 1개의 숫자
function numberConstraint(row: number, dim: number) {
    const result = Math.floor(row / dim)
    //console.log(`numberConstraint: row=${row}, dim=${dim}, result=${result}`)
    return result
}

// row 당 1~9 하나씩
function rowConstraint(row: number, dim: number) {
    const result = Math.pow(dim, 2) + dim * (Math.floor(row / Math.pow(dim, 2))) + row % dim
    //console.log(`rowConstraint: row=${row}, dim=${dim}, result=${result}`)
    return result
}

// col 당 1~9 하나씩
function colConstraint(row: number, dim: number) {
    const result = 2 * Math.pow(dim, 2) + (row % Math.pow(dim, 2))
    //console.log(`colConstraint: row=${row}, dim=${dim}, result=${result}`)
    return result
}

// box 당 1~9 하나씩
function boxConstraint(row: number, dim: number) {
    const sqrt = Math.sqrt(dim)
    const result = parseInt("" + (3 * Math.pow(dim, 2) + (Math.floor(row / (sqrt * Math.pow(dim, 2)))) * (dim * sqrt) + ((Math.floor(row / (sqrt * dim))) % sqrt) * dim + (row % dim)))
    //console.log(`boxConstraint: row=${row}, dim=${dim}, result=${result}`)
    return result
}

const constraint_list = [numberConstraint, rowConstraint, colConstraint, boxConstraint]

function listToMatrix(puzzle: number[], dim: number) {
    //console.log(`Converting puzzle to matrix, dim=${dim}, puzzle length=${puzzle.length}`)
    const numRows = Math.pow(dim, 3)
    const numCols = Math.pow(dim, 2) * constraint_list.length
    //console.log(`Matrix dimensions: ${numRows} rows, ${numCols} columns`)

    const matrix = new DL_Matrix(numRows, numCols)

    puzzle.forEach((value, index) => {
        //console.log(`Processing puzzle cell ${index}, value=${value}`)
        if (value == 0) {
            //console.log(`Empty cell, creating nodes for all possible values (1-${dim})`)
            for (let cnt = 0; cnt < dim; cnt++) {
                const row = index * dim + cnt
                //console.log(`Creating constraint nodes for row=${row} (cell=${index}, value=${cnt + 1})`)

                constraint_list.forEach((func, funcIndex) => {
                    matrix.insertNode(row, func(row, dim))
                })
            }
        } else {
            //console.log(`Fixed cell with value=${value}, creating constraint nodes`)
            const row = index * dim + value - 1
            constraint_list.forEach((func, funcIndex) => {
                matrix.insertNode(row, func(row, dim))
            })
        }
    })

    //console.log(`Matrix conversion completed`)
    return matrix
}

function solvePuzzle(puzzle: number[]) {
    //console.log(`Solving puzzle: [${puzzle.join(', ')}]`)
    const dim = parseInt("" + (Math.sqrt(puzzle.length)))
    //console.log(`Puzzle dimension: ${dim}x${dim}`)

    if (Math.pow(parseInt("" + (dim + 0.5)), 2) == puzzle.length) {
        //console.log(`Valid puzzle dimensions: ${puzzle.length} cells`)
        const matrix = listToMatrix(puzzle, dim)
        //console.log(`Applying Algorithm X to find solution`)
        const solutionList: number[] = matrix.alg_x_search()

        if (solutionList == null || solutionList.length === 0) {
            //console.warn(`No solution found`)
            return []
        }

        const solvedPuzzle = Array(Math.pow(dim, 2)).fill(0)
        //console.log(`Found ${solutionList.length} solution elements, converting to puzzle format`)

        solutionList.forEach((row, index) => {
            const cellIndex = Math.floor(row / dim)
            const value = (row % dim) + 1
            solvedPuzzle[cellIndex] = value
            //console.log(`Solution element ${index}: row=${row} -> cell=${cellIndex}, value=${value}`)
        })

        //console.log(`Solved puzzle: [${solvedPuzzle.join(', ')}]`)
        return solvedPuzzle
    } else {
        //console.error(`Invalid puzzle dimensions: ${puzzle.length} cells is not a perfect square`)
    }
}

function NumberBox({ value, id, box, row, col, className, onBoxClick }: { value: number | null, id: string, box: number, row: number, col: number, className: string, onBoxClick: any }) {
    //console.log(`Rendering NumberBox: id=${id}, value=${value}, row=${row}, col=${col}, box=${box}`)
    return (
        <button className={className} data-box={box} data-row={row} data-col={col} id={id} onClick={(e) => {
            //console.log(`NumberBox clicked: id=${id}, row=${row}, col=${col}, box=${box}, value=${value}`)
            onBoxClick(e)
        }}>
            {value}
        </button>
    )
}

function SudokuBoard({ totalNumber, setTotalNumber, isActive, setActive, onPlay }: { totalNumber: number[], setTotalNumber: any, isActive: boolean[][], setActive: any, onPlay: any }) {
    //console.log("Rendering SudokuBoard")

    useEffect(() => {
        //console.log("SudokuBoard mounted or updated")
        return () => {
            //console.log("SudokuBoard unmounting")
        }
    }, [totalNumber, isActive])

    function handleBoxClick(e: React.MouseEvent) {
        //console.log("Box clicked, handling click event")
        const target = e.target as HTMLElement

        if (target && 'innerHTML' in target) {
            //console.log(`Clicked box value: ${target.innerHTML}`)
            //console.log(`Clicked box attributes: id=${target.id}, row=${target.dataset.row}, col=${target.dataset.col}, box=${target.dataset.box}`)
        }

        //console.log("Calling onPlay function")
        onPlay()
    }

    //console.log("Attempting to solve current puzzle")
    let solution = solvePuzzle(totalNumber)

    if (solution == undefined || solution.length === 0) {
        //console.log("No solution found, using original numbers")
        solution = [...totalNumber]
    } else {
        //console.log(`Solution found with ${solution.filter(v => v > 0).length} filled cells`)
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

                //console.log(`Creating NumberBox for index=${index}, row=${row}, col=${col}, box=${box}, value=${value}`)

                const isActiveClass = isActive[row][col] ? 'active' : ''
                const cellClass = `sudokuBox ${isActiveClass} row-${row} col-${col} box-${box}`

                return (
                    <NumberBox
                        key={`${box}-${row}-${col}`}
                        id={`${box}-${row}-${col}`}
                        box={index}
                        row={row}
                        col={col}
                        value={value}
                        className={cellClass}
                        onBoxClick={handleBoxClick}
                    />
                )
            })}
        </div>
    )
}

export default function SudokuGame() {
    //console.log("Rendering SudokuGame component")

    useEffect(() => {
        //console.log("SudokuGame component mounted")
        return () => {
            //console.log("SudokuGame component unmounting")
        }
    }, [])

    const initialPuzzle = [
        0, 8, 0, 0, 0, 0, 0, 0, 0,
        0, 6, 0, 0, 0, 5, 3, 0, 0,
        0, 0, 0, 0, 9, 0, 5, 6, 0,
        0, 0, 0, 0, 0, 0, 8, 0, 2,
        0, 0, 0, 0, 0, 0, 0, 4, 0,
        3, 0, 7, 0, 2, 0, 0, 0, 0,
        0, 0, 5, 0, 6, 0, 9, 8, 0,
        7, 0, 0, 4, 0, 0, 0, 0, 3,
        0, 4, 0, 0, 0, 1, 0, 0, 0
    ]
    const initialPuzzle2 = [
        0, 0, 0, 7, 5, 0, 0, 3, 0,
        1, 0, 6, 0, 0, 0, 0, 0, 0,
        8, 0, 0, 3, 0, 0, 0, 0, 0,
        0, 2, 0, 0, 0, 0, 0, 4, 0,
        0, 0, 0, 6, 0, 0, 8, 0, 0,
        0, 0, 0, 0, 0, 1, 0, 0, 0,
        0, 4, 0, 0, 9, 0, 0, 0, 0,
        3, 0, 0, 0, 4, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 1, 0, 0
    ]

    //console.log(`Initializing with puzzle: ${initialPuzzle.filter(v => v > 0).length} filled cells`)

    const [totalNumber, setTotalNumber] = useState(initialPuzzle)
    //console.log("Created totalNumber state")

    const [isActive, setActive] = useState(Array(9).fill(null).map(() => Array(9).fill(false)))
    //console.log("Created isActive state")

    function onPlay() {
        //console.log("onPlay function called")
        // 아직 구현되지 않음
        return null
    }

    return (
        <div className="container mx-auto flex flex-col items-center">
            <Link className="text-tokyo_orange-500 text-3xl mb-[10px]" href="/">
                Home
            </Link>
            <div className="container mx-auto">
                <h1 className="text-tokyo_green-500 text-3xl my-2">
                    스도쿠 풀이 알고리즘 Dancing-Link Maxtrix + Exact Cover X-algorism
                </h1>
                <br />
                <section className="text-tokyo_night-50 my-1 ml-3">
                    <p className="text-xl mt-1">
                        개발 기록 : 가볍게 스도쿠 퍼즐을 생성하고 게임을 만드려고 했으나
                    </p>
                    <p className="text-xl mb-1">
                        스도쿠 규칙에 맞게 숫자를 생성하는 것이 생각보다 복잡하고 정적 페이지라는 제한으로 한계를 느꼈다.
                    </p>
                    <p className="text-xl ml-3">
                        1. Math.floor(Math.random() * 9) + 1 을 사용하여 1~9 까지의 수를 임의로 생성하고 정수[9][9] 배열에 차례로 넣으면서 전체 81 개 숫자 생성
                    </p>
                    <p className="text-xl ml-3">
                        2. 각 숫자 셀(Cell)의 행, 열, 박스의 위치를 계산하여 useState 또는 로컬 스토리지를 사용, 숫자의 데이터를 그룹별로 저장
                    </p>
                    <p className="text-xl ml-3">
                        3. 저장된 데이터를 사용하여 차례대로 중복된 숫자를 제거하고 새로운 숫자를 배치하여 스도쿠 퍼즐 완성
                    </p>
                    <br />
                    <p className="text-xl my-2">
                        본래는 이렇게 간단하게 구현이 될 거라 생각했지만 다음과 같은 문제가 생겼다.
                    </p>
                    <p className="text-xl ml-3">
                        1. 스도쿠 셀이 채워질 수록 반복해서 체크해야하는 행,렬,박스 데이터가 많아진다. =&gt; 불필요하고 중복된 작업 계속해서 증가
                    </p>
                    <p className="text-xl ml-3">
                        2. 이전에 배치된 숫자가 어떻게 되는지에 따라 이후 숫자 배치가 불가능해지는 경우의 수가 많다. =&gt; 무한 루프에 갇힘
                    </p>
                    <br />
                    <p className="text-xl my-2">
                        이를 해결하기 위해 아예 스도쿠 풀이 알고리즘을 공부하기로 결정하였다. 이를 위해 고려한 생각들은 이렇다.
                    </p>
                    <p className="text-xl ml-3">
                        1. 숫자가 정해지면 같은 그룹의 행, 열, 박스에 영향을 미친다. 따라서 이전 숫자들의 정보를 작업 중인 프로세스가 알고 있어야 한다.
                    </p>
                    <p className="text-xl ml-3">
                        2. 이전에 배치된 숫자들에 의해 불가능한 경우의 수가 생기므로 스도쿠 규칙에 대한 수학적 지식을 공부하여 구조적인 해결책을 찾아야 한다.
                    </p>
                    <p className="text-xl ml-3">
                        3. 1 과 2 를 고려하면 스도쿠 보드를 이진 트리와 같은 데이터 구조로 변환하여 저장 위치 자체로 행, 열, 박스를 나타내고 빠르게 탐색, 수정이 가능하도록 한다.
                    </p>
                    <p className="text-xl ml-3">
                        4. 노드를 사용하여 이전 숫자들의 상태를 저장하고 자식 노드에 이를 전파한다.
                    </p>
                    <p className="text-xl ml-3">
                        5. 알고리즘은 전체가 자바스크립트를 통해 한꺼번에 정적 페이지에 담겨야 한다.
                    </p>
                    <br />
                    <p className="text-xl my-2">
                        이러한 생각들을 기초로 스도쿠 알고리즘에 대한 탐색을 시작하였다. 그리고 이미 깊이있는 연구들이 많이 이루어졌다는 것을 알게 되었다.
                    </p>
                    <p className="text-xl ml-3">
                        1. 스도쿠 문제는 NP-완전 문제라고 한다. 또한 규칙을 수학적 성질로 변환시키면 유명한 수학적 난제인 색깔 칠하기 문제와 동일해진다.
                    </p>
                    <p className="text-xl ml-5">
                        =&gt; 사실 NP-완전 에 대한 정의를 이해하지 못하였다. 그러나 스도쿠 보드 구조가 수학적인 그래프로 변환 가능하다는 것을 알았다.
                    </p>
                    <p className="text-xl ml-3">
                        2. 스도쿠 풀이 알고리즘의 종류가 매우 많다.
                    </p>
                    <p className="text-xl ml-5">
                        =&gt; 초기에는 스도쿠 풀이 방법을 몇가지 규칙으로 정한 후 이를 차례대로 대입하여 문제를 풀이하는 알고리즘이 많이 개발되었다.
                    </p>
                    <p className="text-xl ml-5">
                        &nbsp;&nbsp;&nbsp;&nbsp; 그러나 대부분 케이스 제한적인 해결법을 가진 2 ~ 3 종류의 알고리즘을 실행시키고 결과를 비교하여 판단하는 방법들이었다.
                    </p>
                    <p className="text-xl ml-5">
                        &nbsp;&nbsp;&nbsp;&nbsp; 따라서 유일한 정답이 있는 경우에만 해답을 반환한다던지 아니면 풀이마다 해답이 달라진다던지 하는 문제가 생기는 것으로 보였다.
                    </p>
                    <p className="text-xl ml-5">
                        &nbsp;&nbsp;&nbsp;&nbsp; 그러다가 점점 스도쿠에 대한 수학적 연구가 이루어지면서 이미 존재하는 수학 난해 알고리즘을 적용시키는 방법들이 생겨났다.
                    </p>
                    <p className="text-xl ml-5">
                        &nbsp;&nbsp;&nbsp;&nbsp; 그 결과 스도쿠 문제를 완전 피복 문제로 변환하고 이를 해결하는데 욕심쟁이 알고리즘과 이진 트리 구조를 사용하여
                    </p>
                    <p className="text-xl ml-5">
                        &nbsp;&nbsp;&nbsp;&nbsp; 가능한 모든 경우의 수를 분기별로 나누고 각 분기를 깊이 우선으로 탐색, 해답이 없을 시 현재 분기를 파기하고 다음 분기로 넘어가는
                    </p>
                    <p className="text-xl ml-5">
                        &nbsp;&nbsp;&nbsp;&nbsp; 알고리즘이 개발되었다는 것을 알게 되었다. 이를 밴치마킹하여 자바스크립트로 바꾸어 작성한 후 잘 작동하는지 확인해 보았다.
                    </p>
                    <p className="text-xl ml-5">
                        아래는 puzzle = [
                        <br />
                        0, 8, 0, 0, 0, 0, 0, 0, 0,
                        <br />
                        0, 6, 0, 0, 0, 5, 3, 0, 0,
                        <br />
                        0, 0, 0, 0, 9, 0, 5, 6, 0,
                        <br />
                        0, 0, 0, 0, 0, 0, 8, 0, 2,
                        <br />
                        0, 0, 0, 0, 0, 0, 0, 4, 0,
                        <br />
                        3, 0, 7, 0, 2, 0, 0, 0, 0,
                        <br />
                        0, 0, 5, 0, 6, 0, 9, 8, 0,
                        <br />
                        7, 0, 0, 4, 0, 0, 0, 0, 3,
                        <br />
                        0, 4, 0, 0, 0, 1, 0, 0, 0
                        <br />
                        ] 의 예제를 넣고 실행한 결과이다.
                    </p>
                </section>
            </div>
            <div className="boxSet w-[720px] mt-7">
                <SudokuBoard
                    isActive={isActive}
                    setActive={setActive}
                    totalNumber={totalNumber}
                    setTotalNumber={setTotalNumber}
                    onPlay={onPlay}
                />
            </div>
        </div>
    )
}
