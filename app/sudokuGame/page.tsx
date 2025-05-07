"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

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

function sudokuCreator(): number[] {

    const createBoard = () => {
        const numArray = [1, 2, 3, 4, 5, 6, 7, 8, 9]

        const box1 = shuffleNumber(numArray)
        // const box4 = shuffleNumber(numArray)
        // const box9 = shuffleNumber(numArray)
        //
        const puzzle = Array(81).fill(0)

        // 0~8
        // 9~17
        // 18~26
        puzzle.splice(0, 9, ...box1)
        // puzzle.splice(9, 3, box1.slice(3, 3))
        // puzzle.splice(18, 3, box1.slice(6, 3))

        // 27~35
        // 36~44
        // 45~53
        // puzzle.splice(30, 3, box4.slice(0, 3))
        // puzzle.splice(39, 3, box4.slice(0, 3))
        // puzzle.splice(48, 3, box4.slice(0, 3))
        //
        // // 54~62
        // // 63~71
        // // 72~80
        // puzzle.splice(60, 3, box9.slice(0, 3))
        // puzzle.splice(69, 3, box9.slice(0, 3))
        // puzzle.splice(78, 3, box9.slice(0, 3))

        const solved = solvePuzzle(puzzle)

        return solved
    }

    let board = createBoard()

    while (board == undefined) {
        board = createBoard()
    }

    return board
}

function shuffleNumber(arr: number[]): number[] {

    const newArr = [...arr]

    for (let i = arr.length - 1; i > 2; i--) {
        let number = Math.floor(Math.random() * i)
            ;[newArr[number], newArr[i]] = [newArr[i], newArr[number]]
    }

    return newArr
}

function NumberBox({ value, index, isActive, id, box, row, col, className, onBoxClick }: { value: number | null, index: number, isActive: boolean[], id: string, box: number, row: number, col: number, className: string, onBoxClick: any }) {
    //console.log(`Rendering NumberBox: id=${id}, value=${value}, row=${row}, col=${col}, box=${box}`)
    return (
        <button className={`${className} ${isActive[0] ? 'active' : ''} ${isActive[1] ? 'clicked' : ''} `} data-index={index} data-box={box} data-row={row} data-col={col} id={id} onClick={(e) => {
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

        setActive(() => {
            return Array(81).fill([false, false])
        })
        const target = e.target as HTMLElement


        if (target && 'innerHTML' in target) {
            console.log(`Clicked box value: ${target.innerHTML}`)
            console.log(`Clicked box attributes: id=${target.id}, row=${target.dataset.row}, col=${target.dataset.col}, box=${target.dataset.box}`)


            const value = target.innerHTML
            const row = target.dataset.row
            const col = target.dataset.col
            const box = target.dataset.box
            const index = target.dataset.index

            if (row != undefined && col != undefined && box != undefined && index != undefined && value != undefined) {

                const parent = target.parentElement
                if (parent != null) {
                    const children = parent.children
                    for (let cnt = 0; cnt < children.length; cnt++) {
                        const elem = children[cnt] as HTMLElement
                        const idx = elem.dataset.index
                        const r = elem.dataset.row
                        const c = elem.dataset.col
                        const b = elem.dataset.box
                        const v = elem.innerHTML
                        if (idx != undefined && r != undefined && c != undefined && b != undefined && v != undefined) {
                            if (r == row || c == col || b == box || v == value) {
                                setActive((prevActive: boolean[][]) => {
                                    const newIsActive = [...prevActive]
                                    if (!newIsActive[parseInt(idx)][0]) {
                                        newIsActive[parseInt(idx)] = [true, false]
                                    }

                                    if (r == row && c == col && b == box && v == value) {
                                        newIsActive[parseInt(idx)] = [true, true]

                                    }
                                    return newIsActive
                                })
                            }
                        }
                    }
                }
            }
            onPlay()
        }
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

                const cellClass = `sudokuBox row-${row} col-${col} box-${box}`

                return (
                    <NumberBox
                        key={`${box}-${row}-${col}`}
                        id={`${box}-${row}-${col}`}
                        box={box}
                        row={row}
                        col={col}
                        isActive={isActive[index]}
                        index={index}
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

    const storedBoard = useMemo(() => {
        return sudokuCreator
    }, [])


    const [totalNumber, setTotalNumber] = useState(storedBoard)
    //console.log("Created totalNumber state")

    const [isActive, setActive] = useState(Array(81).fill([false, false]))
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
