#ifndef SUDOKU_SOLVER_H
#define SUDOKU_SOLVER_H
#include <emscripten/emscripten.h>

#define DIM 9
#define GRID_SIZE (DIM * DIM)

// Function declarations for WASM export

extern EMSCRIPTEN_KEEPALIVE int* solve_sudoku(int* puzzle, int length);


extern EMSCRIPTEN_KEEPALIVE int has_unique_solution(int* puzzle, int length);

#endif
