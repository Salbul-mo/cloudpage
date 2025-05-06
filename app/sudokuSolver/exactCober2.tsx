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



export class DL_Matrix {
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
