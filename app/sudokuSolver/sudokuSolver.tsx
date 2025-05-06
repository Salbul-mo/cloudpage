
import { DL_Matrix, DL_Node } from './exactCober2'

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

export function listToMatrix(puzzle: number[], dim: number) {
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

export function solvePuzzle(puzzle: number[]) {
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
