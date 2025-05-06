export class DL_Node {

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

}

// 파이썬에서는 yield 를 사용해서 배열 전체를 순환하고 나서 반환하는게 아니라 
// 순환하면서 그때 그때 반환 노드를 반환한다.
export function itr_up(node: DL_Node, excl: boolean | null) {
    // excl false 받으면 자기 자신 포함 
    excl = excl !== null ? excl : true

    let itr = node

    const upList = []

    if (!excl) {
        upList.push(itr)
    }

    while (itr.up != itr) {
        itr = itr.up
        upList.push(itr)
    }
    return upList
}

// 파이썬에서는 yield 를 사용해서 배열 전체를 순환하고 나서 반환하는게 아니라 
// 순환하면서 그때 그때 반환 노드를 반환한다.
export function itr_down(node: DL_Node, excl: boolean | null) {
    // excl false 받으면 자기 자신 포함 
    excl = excl !== null ? excl : true

    let itr = node

    const downList = []

    if (!excl) {
        downList.push(itr)
    }

    while (itr.up != itr) {
        itr = itr.up
        downList.push(itr)
    }
    return downList
}

// 파이썬에서는 yield 를 사용해서 배열 전체를 순환하고 나서 반환하는게 아니라 
// 순환하면서 그때 그때 반환 노드를 반환한다.
export function itr_left(node: DL_Node, excl: boolean | null) {
    // excl false 받으면 자기 자신 포함
    excl = excl !== null ? excl : true

    let itr = node

    const leftList = []

    if (!excl) {
        leftList.push(itr)
    }

    while (itr.up != itr) {
        itr = itr.up
        leftList.push(itr)
    }
    return leftList
}

// 파이썬에서는 yield 를 사용해서 배열 전체를 순환하고 나서 반환하는게 아니라 
// 순환하면서 그때 그때 반환 노드를 반환한다.
export function itr_right(node: DL_Node, excl: boolean | null) {
    // excl false 받으면 자기 자신 포함
    excl = excl !== null ? excl : true

    let itr = node

    const rightList = []

    if (!excl) {
        rightList.push(itr)
    }

    while (itr.up != itr) {
        itr = itr.up
        rightList.push(itr)
    }
    return rightList
}

// 노드의 header 반환
export function get_col(node: DL_Node) {
    if (node.col == -1) {
        return node.matrix.root
    }
    return node.matrix.cols[node.col]
}

// 해당 컬럼이 피복 되었는지 반환
export function col_is_covered(node: DL_Node) {
    const col = get_col(node)

    if (col.right.left === col) {
        return false
    } else {
        return true
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
}

export function selectMinCol(matrix: DL_Matrix) {
    if (isEmpty(matrix)) {
        return matrix.root
    }

    // cols[0]
    let minNode = matrix.root.right

    let minCount = matrix.root.right.count

    matrix.cols.slice(1).forEach((node, index) => {
        if (node.count < minCount) {
            minNode = node
            minCount = node.count
        }
    })

    return minNode
}

export function isEmpty(matrix: DL_Matrix) {
    if (matrix.root.right == matrix.root) {
        return true
    } else {
        return false
    }
}

// 해당 컬럼 아래로, 오른쪽으로 순회하면서 노드 연결 해제
export function cover(node: DL_Node) {
    // column header
    let header = get_col(node)

    // unlink left and right of column header
    header.right.left = header.left
    header.left.right = header.right

    itr_down(header, null).forEach((col, index) => {
        itr_right(col, null).forEach((row, index) => {
            row.up.down = row.down
            row.down.up = row.up
            get_col(row).count -= 1
        })
    })
}

// 해당 컬럼 위로, 왼쪽으로 순회하면서 노드 재연결
export function uncover(node: DL_Node) {
    // column header
    let header = get_col(node)

    itr_up(header, null).forEach((col, index) => {
        itr_left(col, null).forEach((row, index) => {
            row.up.down = row
            row.down.up = row
            get_col(row).count += 1
        })
    })

    header.right.left = header
    header.left.right = header
}

export function alg_x_search(matrix: DL_Matrix) {
    let solutions: number[] = []

    const search = () => {
        if (isEmpty(matrix)) {
            matrix.solved = true
            return true
        }

        let selectedCol = selectMinCol(matrix)

        if (selectedCol.count < 1) {
            return false
        }

        itr_down(selectedCol, null).forEach((col, index) => {
            solutions.push(col.row)

            itr_right(col, false).forEach((node, index) => {
                if (node.col >= 0) {
                    cover(node)
                }
            })

            if (search()) {
                // break 로 재귀 호출 끝내야한다.
            }

            solutions.splice(-1, 1)

            itr_left(col.left, false).forEach((node, index) => {
                if (node.col >= 0) {
                    uncover(node)
                }
            })
        })
        return matrix.solved
    }

    search()

    return solutions
}

// 노드 순회하다가 break 후 해당 자리에 node 링크하는 것으로 수정 필요
export function insertNode(matrix: DL_Matrix, row: number, col: number) {

    //assert(row>=0 && col >= 0 && row <(matrix.rows.length) && col < (matrix.cols.length))

    let newNode = new DL_Node(row, col, null, matrix, null, null, null, null)

    let root = matrix.root

    // 오른쪽 순회하다가 끝을 만나면 break 후 해당 자리에 노드 연결
    itr_right(matrix.rows[row], false).forEach((node, index) => {

        // try catch 문으로 break 한다.
        if (node.right.col == -1 || node.right.col > col) {
            throw Error
            // break
        }
    })

    if (root.col == col) {
        return
    }

    newNode.right = root.right
    newNode.left = root
    newNode.right.left = newNode

    root.right = newNode


    // 아래쪽 순회하다가 끝을 만나면 break 후 해당 자리에 노드 연결
    itr_down(matrix.cols[col], false).forEach((node, index) => {
        if (node.down.row == -1 || node.down.row > row) {
            throw Error
        }
    })

    newNode.down = root.down
    newNode.up = root
    newNode.down.up = newNode
    root.down = newNode
    matrix.cols[col].count += 1
}
