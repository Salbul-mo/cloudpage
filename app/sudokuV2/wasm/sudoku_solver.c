#include <assert.h>
#include <math.h>
#include <emscripten.h>
#include "sudoku_solver.h"
#include "dlinks_matrix.h"

// 정적 버퍼를 사용하여 해답 저장
static int solution_buffer[GRID_SIZE];

static inline int one_constraint(int row, int dim) {
    return row / dim;
}

static inline int row_constraint(int row, int dim) {
    return (dim * dim) + dim * (row / (dim * dim)) + (row % dim);
}

static inline int col_constraint(int row, int dim) {
    return 2 * (dim * dim) + (row % (dim * dim));
}

static inline int box_constraint(int row, int dim) {
    return 3 * (dim * dim) + (row / ((int)sqrt(dim) * dim * dim)) * (dim * (int)sqrt(dim)) + ((row / ((int)sqrt(dim) * dim)) % (int)sqrt(dim)) * dim + (row % dim);
}

Matrix* puzzle_to_matrix(int* sudoku_list, int dim) {
    assert(dim == DIM);
    int num_rows = dim * dim * dim;     // 729 for 9 x 9
    int num_cols = dim * dim * 4;       // 324 for 9 x 9
    int num_cells = dim * dim;          // 81 for 9 x 9
    Matrix* matrix = create_matrix(num_rows, num_cols);

    int row = 0;
    for (int i = 0; i < num_cells; i++) {
        if (sudoku_list[i] == 0 ) {
            for (int j = 0; j < dim; j++) {
                row = i * dim + j;
                insert_node(matrix, row, one_constraint(row, dim), 1);
                insert_node(matrix, row, row_constraint(row, dim), 1);
                insert_node(matrix, row, col_constraint(row, dim), 1);
                insert_node(matrix, row, box_constraint(row, dim), 1);
            }
        } else {
            row = i * dim + sudoku_list[i] - 1;
            insert_node(matrix, row, one_constraint(row, dim), 1);
            insert_node(matrix, row, row_constraint(row, dim), 1);
            insert_node(matrix, row, col_constraint(row, dim) ,1);
            insert_node(matrix, row, box_constraint(row, dim), 1);
        }
    }
    return matrix;
}

EMSCRIPTEN_KEEPALIVE
int* solve_sudoku(int* puzzle, int length) {
    assert(length == GRID_SIZE);
    // 정적 버퍼 초기화
    for (int i = 0; i < GRID_SIZE; i++) {
        solution_buffer[i] = 0;
    }

    // 메모리 풀 초기화
    init_memory_pool();

    Matrix* matrix = puzzle_to_matrix(puzzle, DIM);
    if (get_memory_error()) {
        delete_matrix(matrix);
        return solution_buffer; // 에러 발생 시 빈 결과 반환
    }
    int iterations_done = 0;
    int max_iterations = 30000; // 넉넉하게
    bool found = alg_x_search_iterative(matrix, max_iterations, &iterations_done);
    if (found) {
        int index, value;
        for (int i = 0; i < matrix->solution->top; i++) {
            Node* node = matrix->solution->items[i];
            index = node->row / DIM;
            value = (node->row % DIM) + 1;
            solution_buffer[index] = value;
        }
    }
    delete_matrix(matrix);
    return solution_buffer; // 정적 버퍼 반환, 메모리 해제 불필요
}

EMSCRIPTEN_KEEPALIVE
int has_unique_solution(int* puzzle, int length) {
    assert(length == GRID_SIZE);
    // 메모리 풀 초기화
    init_memory_pool();

    Matrix* matrix = puzzle_to_matrix(puzzle, DIM);
    if (get_memory_error()) {
        delete_matrix(matrix);
        return 0; // 에러 발생 시 유일하지 않음으로 처리
    }
    int solution_count = 0;
    int max_iterations = 30000; // 유일성 확인에도 동일한 제한
    bool stop_search = alg_x_count_solutions(matrix, max_iterations, &solution_count);
    delete_matrix(matrix);
    return (solution_count == 1) ? 1 : 0;
}


