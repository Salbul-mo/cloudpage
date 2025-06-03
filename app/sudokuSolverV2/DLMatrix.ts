import DLNode from './DLNode';

class DLMatrix {
    root: DLNode;
    rows: DLNode[];
    cols: DLNode[];
    solved: boolean;

    constructor(numRows: number, numCols: number) {
        this.root = new DLNode(-1, -1, null, this);
        this.rows = [];
        this.cols = [];
        this.solved = false;

        // 행 헤더 노드 생성
        for (let i = 0; i < numRows; i++) {
            this.rows.push(new DLNode(i, -1, null, this));
        }

        // 열 헤더 노드 생성
        for (let i = 0; i < numCols; i++) {
            this.cols.push(new DLNode(-1, i, 0, this));
        }

        // 행 노드 연결
        this.rows.forEach((node, index) => {
            node.right = index === this.rows.length - 1 ? this.root : this.rows[index + 1];
            node.left = index === 0 ? this.root : this.rows[index - 1];
            node.down = index === this.rows.length - 1 ? this.root : this.rows[index + 1];
            node.up = index === 0 ? this.root : this.rows[index - 1];
        });

        // 열 노드 연결
        this.cols.forEach((node, index) => {
            node.up = node;
            node.down = node;
            node.right = index === this.cols.length - 1 ? this.root : this.cols[index + 1];
            node.left = index === 0 ? this.root : this.cols[index - 1];
        });

        // 루트 노드 연결
        this.root.right = this.cols[0];
        this.root.left = this.cols[this.cols.length - 1];
        this.root.down = this.rows[0];
        this.root.up = this.rows[this.rows.length - 1];
    }

    // 최소 요소를 가진 열 선택
    selectMinColumn(): DLNode {
        if (this.isEmpty()) {
            return this.root;
        }

        let minNode = this.root.right;
        let minCount = minNode.count;

        for (const col of this.root.iterator('right', true)) {
            if (col.count < minCount) {
                minNode = col;
                minCount = col.count;
            }
        }

        return minNode;
    }

    // 매트릭스가 비어있는지 확인
    isEmpty(): boolean {
        return this.root.right === this.root;
    }

    // 컬럼 피복
    static cover(node: DLNode): void {
        const header = node.getColHeader();
        header.right.left = header.left;
        header.left.right = header.right;

        for (const row of node.iterator('down', true)) {
            for (const col of row.iterator('right', true)) {
                col.down.up = col.up;
                col.up.down = col.down;
            }
        }
    }

    // 컬럼 해피복
    static uncover(node: DLNode): void {
        const header = node.getColHeader();

        for (const row of node.iterator('up', true)) {
            for (const col of row.iterator('left', true)) {
                col.down.up = col;
                col.up.down = col;
            }
        }

        header.right.left = header;
        header.left.right = header;
    }
}

export default DLMatrix;
