"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import "../globals.css"

// DL_Node와 DL_Matrix 클래스는 그대로 유지
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

    *itrUp(excl: boolean | null) {
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

    getCol() {
        if (this.col == -1) {
            return this.matrix.root
        }
        return this.matrix.cols[this.col]
    }

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
        this.root.left = this.cols[this.cols.length - 1]
        this.root.down = this.rows[0]
        this.root.up = this.rows[this.rows.length - 1]
    }

    selectMinCol() {
        if (this.isEmpty()) {
            return this.root
        }
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
        const empty = this.root.right == this.root
        return empty
    }

    static cover(node: DL_Node) {
        let header = node.getCol()
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

    static uncover(node: DL_Node) {
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

                if (search()) {
                    break
                }

                solutions.splice(-1, 1)

                for (const node of col.left.itrLeft(false)) {
                    if (node.col >= 0) {
                        DL_Matrix.uncover(node)
                    }
                }
            }
            return this.solved
        }

        search()
        return solutions
    }

    insertNode(row: number, col: number) {
        if (row >= 0 && col >= 0 && row < (this.rows.length) && col < (this.cols.length)) {
            let newNode = new DL_Node(row, col, null, this, null, null, null, null)
            var n = this.root

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

// 제약 조건 함수들
function numberConstraint(row: number, dim: number) {
    const result = Math.floor(row / dim)
    return result
}

function rowConstraint(row: number, dim: number) {
    const result = Math.pow(dim, 2) + dim * (Math.floor(row / Math.pow(dim, 2))) + row % dim
    return result
}

function colConstraint(row: number, dim: number) {
    const result = 2 * Math.pow(dim, 2) + (row % Math.pow(dim, 2))
    return result
}

function boxConstraint(row: number, dim: number) {
    const sqrt = Math.sqrt(dim)
    const result = parseInt("" + (3 * Math.pow(dim, 2) + (Math.floor(row / (sqrt * Math.pow(dim, 2)))) * (dim * sqrt) + ((Math.floor(row / (sqrt * dim))) % sqrt) * dim + (row % dim)))
    return result
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
                constraint_list.forEach((func, funcIndex) => {
                    matrix.insertNode(row, func(row, dim))
                })
            }
        } else {
            const row = index * dim + value - 1
            constraint_list.forEach((func, funcIndex) => {
                matrix.insertNode(row, func(row, dim))
            })
        }
    })

    return matrix
}

function solvePuzzle(puzzle: number[]) {
    const dim = parseInt("" + (Math.sqrt(puzzle.length)))

    if (Math.pow(parseInt("" + (dim + 0.5)), 2) == puzzle.length) {
        const matrix = listToMatrix(puzzle, dim)
        const solutionList: number[] = matrix.alg_x_search()

        if (solutionList == null || solutionList.length === 0) {
            return []
        }

        const solvedPuzzle = Array(Math.pow(dim, 2)).fill(0)

        solutionList.forEach((row, index) => {
            const cellIndex = Math.floor(row / dim)
            const value = (row % dim) + 1
            solvedPuzzle[cellIndex] = value
        })

        return solvedPuzzle
    } else {
        return []
    }
}
// 수정된 NumberBox 컴포넌트
function NumberBox({ 
    value, 
    index, 
    isOriginal, 
    isSolved,
    onChange,
    onFocus
}: { 
    value: number, 
    index: number, 
    isOriginal: boolean,
    isSolved: boolean,
    onChange: (index: number, value: number) => void,
    onFocus: (index: number) => void
}) {
    const row = Math.floor(index / 9)
    const col = index % 9
    const box = Math.floor(row / 3) * 3 + Math.floor(col / 3)

    let className = "w-16 h-16 text-2xl text-center border-2 "
    
    // 박스 구분을 위한 굵은 테두리
    if (col % 3 === 2 && col !== 8) className += "border-r-4 "
    if (row % 3 === 2 && row !== 8) className += "border-b-4 "
    if (col === 0) className += "border-l-4 "
    if (row === 0) className += "border-t-4 "
    
    // 상태에 따른 색상
    if (isOriginal) {
        className += "bg-gray-200 text-black font-bold cursor-not-allowed "
    } else if (isSolved) {
        className += "bg-green-100 text-green-800 font-semibold "
    } else {
        className += "bg-white text-blue-600 "
    }

    return (
        <input
            type="text"
            className={className}
            value={value || ''}
            onChange={(e) => {
                const val = e.target.value
                if (val === '' || (val.length === 1 && /[1-9]/.test(val))) {
                    onChange(index, val === '' ? 0 : parseInt(val))
                }
            }}
            onFocus={() => onFocus(index)}
            disabled={isOriginal}
            maxLength={1}
        />
    )
}

// 스도쿠 보드 컴포넌트
function SudokuBoard({ 
    puzzle, 
    originalPuzzle,
    solvedPuzzle,
    onChange,
    focusedIndex 
}: { 
    puzzle: number[], 
    originalPuzzle: number[],
    solvedPuzzle: number[],
    onChange: (index: number, value: number) => void,
    focusedIndex: number | null
}) {
    return (
        <div className="grid grid-cols-9 gap-0 border-4 border-black p-1 bg-gray-300">
            {puzzle.map((value, index) => (
                <NumberBox
                    key={index}
                    value={value}
                    index={index}
                    isOriginal={originalPuzzle[index] !== 0}
                    isSolved={solvedPuzzle[index] !== 0 && originalPuzzle[index] === 0}
                    onChange={onChange}
                    onFocus={(index) => {}}
                />
            ))}
        </div>
    )
}

// 예제 퍼즐들
const samplePuzzles = {
    easy: [
        5, 3, 0, 0, 7, 0, 0, 0, 0,
        6, 0, 0, 1, 9, 5, 0, 0, 0,
        0, 9, 8, 0, 0, 0, 0, 6, 0,
        8, 0, 0, 0, 6, 0, 0, 0, 3,
        4, 0, 0, 8, 0, 3, 0, 0, 1,
        7, 0, 0, 0, 2, 0, 0, 0, 6,
        0, 6, 0, 0, 0, 0, 2, 8, 0,
        0, 0, 0, 4, 1, 9, 0, 0, 5,
        0, 0, 0, 0, 8, 0, 0, 7, 9
    ],
    medium: [
        0, 8, 0, 0, 0, 0, 0, 0, 0,
        0, 6, 0, 0, 0, 5, 3, 0, 0,
        0, 0, 0, 0, 9, 0, 5, 6, 0,
        0, 0, 0, 0, 0, 0, 8, 0, 2,
        0, 0, 0, 0, 0, 0, 0, 4, 0,
        3, 0, 7, 0, 2, 0, 0, 0, 0,
        0, 0, 5, 0, 6, 0, 9, 8, 0,
        7, 0, 0, 4, 0, 0, 0, 0, 3,
        0, 4, 0, 0, 0, 1, 0, 0, 0
    ],
    hard: [
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
}

export default function SudokuGame() {
    const [puzzle, setPuzzle] = useState(Array(81).fill(0))
    const [originalPuzzle, setOriginalPuzzle] = useState(Array(81).fill(0))
    const [solvedPuzzle, setSolvedPuzzle] = useState(Array(81).fill(0))
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
    const [showSolution, setShowSolution] = useState(false)
    const [error, setError] = useState<string>("")

    // 퍼즐 변경 핸들러
    const handleCellChange = (index: number, value: number) => {
        const newPuzzle = [...puzzle]
        newPuzzle[index] = value
        setPuzzle(newPuzzle)
        setError("")
    }

    // 예제 퍼즐 로드
    const loadSamplePuzzle = (difficulty: 'easy' | 'medium' | 'hard') => {
        const sample = samplePuzzles[difficulty]
        setPuzzle([...sample])
        setOriginalPuzzle([...sample])
        setSolvedPuzzle(Array(81).fill(0))
        setShowSolution(false)
        setError("")
    }

    // 퍼즐 초기화
    const clearPuzzle = () => {
        setPuzzle(Array(81).fill(0))
        setOriginalPuzzle(Array(81).fill(0))
        setSolvedPuzzle(Array(81).fill(0))
        setShowSolution(false)
        setError("")
    }

    // 현재 퍼즐 설정 (사용자가 입력한 값을 원본으로 설정)
    const setPuzzleAsOriginal = () => {
        setOriginalPuzzle([...puzzle])
        setSolvedPuzzle(Array(81).fill(0))
        setShowSolution(false)
        setError("")
    }

    // 솔루션 토글
    const toggleSolution = () => {
        if (!showSolution) {
            // 해답 계산
            const solution = solvePuzzle(originalPuzzle)
            if (solution.length === 0) {
                setError("이 퍼즐은 해결할 수 없습니다. 입력값을 확인해주세요.")
                return
            }
            setSolvedPuzzle(solution)
            setPuzzle(solution)
        } else {
            // 원래 퍼즐로 복원
            setPuzzle([...originalPuzzle])
        }
        setShowSolution(!showSolution)
    }

    return (
        <div className="container mx-auto flex flex-col items-center p-4">
            <Link className="text-blue-600 hover:text-blue-800 text-2xl mb-4" href="/">
                ← 홈으로
            </Link>
            
            <div className="max-w-4xl w-full">
                <h1 className="text-3xl font-bold text-center mb-6">
                    스도쿠 풀이 프로그램
                </h1>
                
                <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-2">사용 방법</h2>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>빈 칸에 1-9 숫자를 입력하여 스도쿠 문제를 만들 수 있습니다.</li>
                        <li>예제 문제를 불러와서 시작할 수도 있습니다.</li>
                        <li>"현재 상태를 문제로 설정" 버튼을 눌러 입력한 숫자를 문제로 고정합니다.</li>
                        <li>"해답 보기" 버튼을 눌러 정답을 확인할 수 있습니다.</li>
                    </ul>
                </div>

                {/* 버튼 그룹 */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <button
                        onClick={() => loadSamplePuzzle('easy')}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        쉬운 문제
                    </button>
                    <button
                        onClick={() => loadSamplePuzzle('medium')}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                        중간 문제
                    </button>
                    <button
                        onClick={() => loadSamplePuzzle('hard')}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        어려운 문제
                    </button>
                    <button
                        onClick={clearPuzzle}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        전체 지우기
                    </button>
                    <button
                        onClick={setPuzzleAsOriginal}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                        현재 상태를 문제로 설정
                    </button>
                    <button
                        onClick={toggleSolution}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        {showSolution ? '문제로 돌아가기' : '해답 보기'}
                    </button>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* 스도쿠 보드 */}
                <div className="flex justify-center mb-6">
                    <SudokuBoard
                        puzzle={puzzle}
                        originalPuzzle={originalPuzzle}
                        solvedPuzzle={showSolution ? solvedPuzzle : Array(81).fill(0)}
                        onChange={handleCellChange}
                        focusedIndex={focusedIndex}
                    />
                </div>

                {/* 범례 */}
                <div className="flex justify-center gap-4 text-sm text-tokyo_night-200">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 border border-gray-400"></div>
                        <span>원본 숫자</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border border-gray-400"></div>
                        <span>입력 가능</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border border-gray-400"></div>
                        <span>해답</span>
                    </div>
                </div>
            </div>                {/* 알고리즘 설명 섹션 */}
                <div className="mt-8 bg-blue-50 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4 text-blue-800">
                        Dancing Links Algorithm X
                    </h2>
                    <div className="space-y-3 text-gray-700">
                        <p>
                            이 프로그램은 Donald Knuth의 Dancing Links와 Algorithm X를 사용하여 스도쿠를 해결합니다.
                        </p>
                        <div className="ml-4">
                            <h3 className="font-semibold text-lg mb-2">알고리즘 동작 원리:</h3>
                            <ol className="list-decimal list-inside space-y-2">
                                <li>스도쿠 문제를 정확 피복 문제(Exact Cover Problem)로 변환</li>
                                <li>각 제약 조건을 이진 행렬의 열로 표현</li>
                                <li>Dancing Links 자료구조로 효율적인 백트래킹 구현</li>
                                <li>재귀적 깊이 우선 탐색으로 해답 탐색</li>
                            </ol>
                        </div>
                        <div className="ml-4 mt-3">
                            <h3 className="font-semibold text-lg mb-2">스도쿠의 4가지 제약 조건:</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li>각 셀에는 정확히 하나의 숫자가 있어야 함</li>
                                <li>각 행에는 1-9의 숫자가 정확히 한 번씩 나타나야 함</li>
                                <li>각 열에는 1-9의 숫자가 정확히 한 번씩 나타나야 함</li>
                                <li>각 3×3 박스에는 1-9의 숫자가 정확히 한 번씩 나타나야 함</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 통계 정보 */}
                <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">현재 퍼즐 정보</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="font-medium">입력된 숫자: </span>
                            <span className="text-blue-600 font-bold">
                                {originalPuzzle.filter(v => v !== 0).length}개
                            </span>
                        </div>
                        <div>
                            <span className="font-medium">빈 칸: </span>
                            <span className="text-green-600 font-bold">
                                {originalPuzzle.filter(v => v === 0).length}개
                            </span>
                        </div>
                        <div>
                            <span className="font-medium">난이도: </span>
                            <span className="font-bold">
                                {originalPuzzle.filter(v => v !== 0).length > 35 ? '쉬움' :
                                 originalPuzzle.filter(v => v !== 0).length > 25 ? '보통' : '어려움'}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium">상태: </span>
                            <span className={`font-bold ${showSolution ? 'text-green-600' : 'text-gray-600'}`}>
                                {showSolution ? '해답 표시중' : '문제 표시중'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 추가 기능 버튼들 */}
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    <button
                        onClick={() => {
                            const puzzleString = puzzle.join(',')
                            navigator.clipboard.writeText(puzzleString)
                            alert('퍼즐이 클립보드에 복사되었습니다!')
                        }}
                        className="px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600"
                    >
                        퍼즐 복사
                    </button>
                    <button
                        onClick={() => {
                            const input = prompt('퍼즐을 입력하세요 (쉼표로 구분된 81개의 숫자):')
                            if (input) {
                                const numbers = input.split(',').map(n => parseInt(n.trim()) || 0)
                                if (numbers.length === 81) {
                                    setPuzzle(numbers)
                                    setOriginalPuzzle(numbers)
                                    setSolvedPuzzle(Array(81).fill(0))
                                    setShowSolution(false)
                                } else {
                                    alert('정확히 81개의 숫자를 입력해주세요.')
                                }
                            }
                        }}
                        className="px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600"
                    >
                        퍼즐 붙여넣기
                    </button>
                    <button
                        onClick={() => {
                            // 현재 퍼즐 검증
                            const isValid = validatePuzzle(puzzle)
                            if (isValid) {
                                alert('유효한 스도쿠 퍼즐입니다!')
                            } else {
                                alert('규칙에 위배되는 숫자가 있습니다. 확인해주세요.')
                            }
                        }}
                        className="px-3 py-1 bg-amber-500 text-white text-sm rounded hover:bg-amber-600"
                    >
                        퍼즐 검증
                    </button>
                </div>

                {/* 키보드 단축키 안내 */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>💡 팁: 숫자 키를 눌러 빠르게 입력할 수 있습니다. Delete 또는 Backspace로 지울 수 있습니다.</p>
                </div>
            </div>
    )
}

// 퍼즐 유효성 검증 함수
function validatePuzzle(puzzle: number[]): boolean {
    // 행 검증
    for (let row = 0; row < 9; row++) {
        const seen = new Set<number>()
        for (let col = 0; col < 9; col++) {
            const value = puzzle[row * 9 + col]
            if (value !== 0) {
                if (seen.has(value)) return false
                seen.add(value)
            }
        }
    }

    // 열 검증
    for (let col = 0; col < 9; col++) {
        const seen = new Set<number>()
        for (let row = 0; row < 9; row++) {
            const value = puzzle[row * 9 + col]
            if (value !== 0) {
                if (seen.has(value)) return false
                seen.add(value)
            }
        }
    }

    // 박스 검증
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            const seen = new Set<number>()
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    const value = puzzle[(boxRow * 3 + row) * 9 + (boxCol * 3 + col)]
                    if (value !== 0) {
                        if (seen.has(value)) return false
                        seen.add(value)
                    }
                }
            }
        }
    }

    return true
}