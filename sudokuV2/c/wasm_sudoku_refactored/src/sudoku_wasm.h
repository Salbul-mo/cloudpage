#ifndef SUDOKU_WASM_H
#define SUDOKU_WASM_H

/**
 * @file sudoku_wasm.h
 * @brief WASM interface for Sudoku solver
 */

#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Solve a Sudoku puzzle and return the solution
 * 
 * This function is exported to JavaScript and takes a Sudoku puzzle
 * as input and returns the solution.
 * 
 * @param puzzlePtr Pointer to the Sudoku puzzle array in the WASM memory
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @param solutionPtr Pointer to the solution array in the WASM memory
 * @return 1 if a solution is found, 0 otherwise
 */
int solve_sudoku(const int* puzzlePtr, int dim, int* solutionPtr)


/**
 * @brief Allocate memory for a Sudoku puzzle or solution
 * 
 * This function is exported to JavaScript and allocates memory for
 * a Sudoku puzzle or solution in the WASM memory.
 * 
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @return Pointer to the allocated memory
 */
int* allocate_sudoku_array(int dim);

/**
 * @brief Free memory allocated for a Sudoku puzzle or solution
 * 
 * This function is exported to JavaScript and frees memory allocated
 * for a Sudoku puzzle or solution in the WASM memory.
 * 
 * @param ptr Pointer to the memory to free
 */
void free_sudoku_array(int* ptr);

/**
 * @brief Set a value in a Sudoku puzzle or solution
 * 
 * This function is exported to JavaScript and sets a value in a
 * Sudoku puzzle or solution in the WASM memory.
 * 
 * @param ptr Pointer to the Sudoku array in the WASM memory
 * @param index Index in the array
 * @param value Value to set
 */
void set_sudoku_value(int* ptr, int index, int value);

/**
 * @brief Get a value from a Sudoku puzzle or solution
 * 
 * This function is exported to JavaScript and gets a value from a
 * Sudoku puzzle or solution in the WASM memory.
 * 
 * @param ptr Pointer to the Sudoku array in the WASM memory
 * @param index Index in the array
 * @return The value at the specified index
 */
int get_sudoku_value(const int* ptr, int index);

/**
 * @brief Validate a Sudoku solution
 * 
 * This function is exported to JavaScript and validates a Sudoku solution.
 * 
 * @param solutionPtr Pointer to the solution array in the WASM memory
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @return 1 if the solution is valid, 0 otherwise
 */
int validate_sudoku(const int* solutionPtr, int dim);

/**
 * @brief Check if a Sudoku puzzle has a unique solution
 * 
 * This function is exported to JavaScript and checks if a Sudoku puzzle
 * has a unique solution.
 * 
 * @param puzzlePtr Pointer to the puzzle array in the WASM memory
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @return 1 if the puzzle has a unique solution, 0 otherwise
 */
int has_unique_sudoku_solution(const int* puzzlePtr, int dim);

/**
 * @brief Get the difficulty level of a Sudoku puzzle
 * 
 * This function is exported to JavaScript and returns the difficulty level
 * of a Sudoku puzzle.
 * 
 * @param puzzlePtr Pointer to the puzzle array in the WASM memory
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @return Difficulty level (1=Easy, 2=Medium, 3=Hard, 4=Expert, 5=Evil)
 */
int get_sudoku_difficulty(const int* puzzlePtr, int dim);

/**
 * @brief Generate a Sudoku puzzle with the specified difficulty
 * 
 * This function is exported to JavaScript and generates a Sudoku puzzle
 * with the specified difficulty.
 * 
 * @param puzzlePtr Pointer to store the generated puzzle in the WASM memory
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @param difficulty Difficulty level (1=Easy, 2=Medium, 3=Hard, 4=Expert, 5=Evil)
 * @return 1 if a puzzle is successfully generated, 0 otherwise
 */
int generate_sudoku(int* puzzlePtr, int dim, int difficulty);

#ifdef __cplusplus
}
#endif

#endif /* SUDOKU_WASM_H */