export interface DLNode {
    row: number;
    col: number;
    count: number;
    matrix: DLMatrix;
    up: DLNode;
    down: DLNode;
    left: DLNode;
    right: DLNode;
    iterator(direction: IteratorDirection, includeSelf?: boolean): Generator<DLNode>;
    getColHeader(): DLNode;
    isColumnCovered(): boolean;
}

export interface DLMatrix {
    root: DLNode;
    rows: DLNode[];
    cols: DLNode[];
    solved: boolean;
}

export type IteratorDirection = 'up' | 'down' | 'left' | 'right';
