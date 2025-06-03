import { DLMatrix, IteratorDirection } from './types';

class DLNode {
    row: number;
    col: number;
    count: number;
    matrix: DLMatrix;
    up: DLNode;
    down: DLNode;
    left: DLNode;
    right: DLNode;

    constructor(
        row: number,
        col: number,
        count: number | null,
        matrix: DLMatrix,
        up: DLNode | null = null,
        down: DLNode | null = null,
        left: DLNode | null = null,
        right: DLNode | null = null
    ) {
        this.row = row;
        this.col = col;
        this.count = count !== null ? count : 1;
        this.matrix = matrix;
        this.up = up || this;
        this.down = down || this;
        this.left = left || this;
        this.right = right || this;
    }

    // 방향에 따른 이터레이터 함수
    *iterator(direction: IteratorDirection, includeSelf: boolean = false) {
        let current = this;

        if (includeSelf) {
            yield current;
        }

        let next = direction === 'up' ? current.up :
                   direction === 'down' ? current.down :
                   direction === 'left' ? current.left :
                   current.right;

        while (next !== this) {
            yield next;
            next = direction === 'up' ? next.up :
                   direction === 'down' ? next.down :
                   direction === 'left' ? next.left :
                   next.right;
        }
    }

    // 컬럼 헤더 노드 반환
    getColHeader(): DLNode {
        return this.col === -1 ? this.matrix.root : this.matrix.cols[this.col];
    }

    // 컬럼이 피복되어 있는지 확인
    isColumnCovered(): boolean {
        const header = this.getColHeader();
        return header.right.left !== header;
    }
}

export default DLNode;
