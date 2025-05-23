#ifndef SUDOKU_CORE_H
#define SUDOKU_CORE_H

/**
 * @file sudoku_core.h
 * @brief Core functions for solving Sudoku puzzles
 */

#include <stdbool.h>
#include "dlinks_matrix.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Converts a Sudoku puzzle into a constraint matrix for Algorithm X
 * @param sudoku_list Array representing the Sudoku puzzle (0 for empty cells)
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @return Pointer to the constraint matrix
 */
Matrix* puzzle_to_matrix(const int* sudoku_list, int dim);

/**
 * @brief Solves a Sudoku puzzle
 * @param puzzle Array representing the initial Sudoku puzzle (0 for empty cells)
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @param solution Array to store the solution (must be pre-allocated)
 * @return true if a solution is found, false otherwise
 */
bool solve_puzzle(const int* puzzle, int dim, int* solution);

/**
 * @brief Validates a Sudoku puzzle solution
 * @param board Array representing the Sudoku board
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @return true if the solution is valid, false otherwise
 */
bool validate_solution(const int* board, int dim);

/**
 * @brief Checks if a Sudoku puzzle has a unique solution
 * @param puzzle Array representing the initial Sudoku puzzle (0 for empty cells)
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @return true if the puzzle has a unique solution, false otherwise
 */
bool has_unique_solution(const int* puzzle, int dim);

/**
 * @brief Returns the difficulty level of a Sudoku puzzle
 * @param puzzle Array representing the initial Sudoku puzzle (0 for empty cells)
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @return Difficulty level (1=Easy, 2=Medium, 3=Hard, 4=Expert, 5=Evil)
 */
int get_puzzle_difficulty(const int* puzzle, int dim);

/**
 * @brief Generates a random Sudoku puzzle with the specified difficulty
 * @param puzzle Array to store the generated puzzle (must be pre-allocated)
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @param difficulty Difficulty level (1=Easy, 2=Medium, 3=Hard, 4=Expert, 5=Evil)
 * @return true if a puzzle is successfully generated, false otherwise
 */
bool generate_puzzle(int* puzzle, int dim, int difficulty);

#ifdef __cplusplus
}
#endif

#endif /* SUDOKU_CORE_H */