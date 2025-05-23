#include <assert.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "sudoku_core.h"

// Constraint calculation functions
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
    int box_size = (int)sqrt(dim);
    return 3 * (dim * dim) + 
           (row / (box_size * dim * dim)) * (dim * box_size) +
           ((row / (box_size * dim)) % box_size) * dim + 
           (row % dim);
}

/**
 * @brief Converts a Sudoku puzzle into a constraint matrix for Algorithm X
 * @param sudoku_list Array representing the Sudoku puzzle (0 for empty cells)
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @return Pointer to the constraint matrix
 */
Matrix* puzzle_to_matrix(const int* sudoku_list, int dim) {
    assert((int)sqrt(dim) * (int)sqrt(dim) == dim); // Only perfect square puzzles are supported
    
    int num_rows = dim * dim * dim;
    int num_cols = dim * dim * 4;
    int num_cells = dim * dim;
    
    Matrix* matrix = create_matrix(num_rows, num_cols);
    if (!matrix) return NULL;

    int row = 0;
    // Iterate through puzzle list
    for (int i = 0; i < num_cells; i++) {
        // If no value assigned to cell, populate all rows representing all possible candidate values for cell
        if (sudoku_list[i] == 0) {
            for (int j = 0; j < dim; j++) {
                row = i * dim + j;
                insert_node(matrix, row, one_constraint(row, dim), 1);
                insert_node(matrix, row, row_constraint(row, dim), 1);
                insert_node(matrix, row, col_constraint(row, dim), 1);
                insert_node(matrix, row, box_constraint(row, dim), 1);
            }
        }
        // Otherwise only populate the row representing the known assigned value
        else {
            row = i * dim + sudoku_list[i] - 1;
            insert_node(matrix, row, one_constraint(row, dim), 1);
            insert_node(matrix, row, row_constraint(row, dim), 1);
            insert_node(matrix, row, col_constraint(row, dim), 1);
            insert_node(matrix, row, box_constraint(row, dim), 1);
        }
    }
    
    return matrix;
}

/**
 * @brief Solves a Sudoku puzzle
 * @param puzzle Array representing the initial Sudoku puzzle (0 for empty cells)
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @param solution Array to store the solution (must be pre-allocated)
 * @return true if a solution is found, false otherwise
 */
bool solve_puzzle(const int* puzzle, int dim, int* solution) {
    if (!puzzle || !solution) return false;
    
    // Copy puzzle to solution first
    memcpy(solution, puzzle, dim * dim * sizeof(int));
    
    Matrix* matrix = puzzle_to_matrix(puzzle, dim);
    if (!matrix) return false;
    
    bool found = alg_x_search(matrix);
    
    if (found) { // Decode solution stored in matrix.solution
        int index, value;
        for (solution_node* itr = matrix->solution->head; itr != NULL; itr = itr->next) {
            Node* node = (Node*)itr->data;
            index = node->row / dim;
            value = (node->row % dim) + 1;
            solution[index] = value;
        }
    }
    
    delete_matrix(matrix);
    return found;
}

/**
 * @brief Validates a Sudoku puzzle solution
 * @param board Array representing the Sudoku board
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @return true if the solution is valid, false otherwise
 */
bool validate_solution(const int* board, int dim) {
    if (!board) return false;
    
    int box_size = (int)sqrt(dim);
    int* checker = (int*)calloc(dim + 1, sizeof(int));
    if (!checker) return false;
    
    // Check rows
    for (int row = 0; row < dim; row++) {
        memset(checker, 0, (dim + 1) * sizeof(int));
        for (int col = 0; col < dim; col++) {
            int val = board[row * dim + col];
            if (val < 1 || val > dim || checker[val]) {
                free(checker);
                return false;
            }
            checker[val] = 1;
        }
    }
    
    // Check columns
    for (int col = 0; col < dim; col++) {
        memset(checker, 0, (dim + 1) * sizeof(int));
        for (int row = 0; row < dim; row++) {
            int val = board[row * dim + col];
            if (val < 1 || val > dim || checker[val]) {
                free(checker);
                return false;
            }
            checker[val] = 1;
        }
    }
    
    // Check boxes
    for (int box_row = 0; box_row < box_size; box_row++) {
        for (int box_col = 0; box_col < box_size; box_col++) {
            memset(checker, 0, (dim + 1) * sizeof(int));
            for (int row = 0; row < box_size; row++) {
                for (int col = 0; col < box_size; col++) {
                    int actual_row = box_row * box_size + row;
                    int actual_col = box_col * box_size + col;
                    int val = board[actual_row * dim + actual_col];
                    if (val < 1 || val > dim || checker[val]) {
                        free(checker);
                        return false;
                    }
                    checker[val] = 1;
                }
            }
        }
    }
    
    free(checker);
    return true;
}

/**
 * @brief Checks if a Sudoku puzzle has a unique solution
 * @param puzzle Array representing the initial Sudoku puzzle (0 for empty cells)
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @return true if the puzzle has a unique solution, false otherwise
 */
bool has_unique_solution(const int* puzzle, int dim) {
    // This is a simplified implementation.
    // A complete implementation would search for multiple solutions.
    
    int* solution1 = (int*)malloc(dim * dim * sizeof(int));
    int* solution2 = (int*)malloc(dim * dim * sizeof(int));
    
    if (!solution1 || !solution2) {
        if (solution1) free(solution1);
        if (solution2) free(solution2);
        return false;
    }
    
    bool has_solution = solve_puzzle(puzzle, dim, solution1);
    
    // If no solution found, return false
    if (!has_solution) {
        free(solution1);
        free(solution2);
        return false;
    }
    
    // For a complete check, we would need to modify the algorithm to find a second solution
    // This is a placeholder implementation
    free(solution1);
    free(solution2);
    
    return true;
}

/**
 * @brief Returns the difficulty level of a Sudoku puzzle
 * @param puzzle Array representing the initial Sudoku puzzle (0 for empty cells)
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @return Difficulty level (1=Easy, 2=Medium, 3=Hard, 4=Expert, 5=Evil)
 */
int get_puzzle_difficulty(const int* puzzle, int dim) {
    if (!puzzle) return 0;
    
    // Count empty cells
    int empty_cells = 0;
    for (int i = 0; i < dim * dim; i++) {
        if (puzzle[i] == 0) {
            empty_cells++;
        }
    }
    
    // Simple difficulty estimation based on number of empty cells
    // This is a very simplified model and doesn't reflect actual solving difficulty
    if (empty_cells < dim * 2) return 1; // Easy
    else if (empty_cells < dim * 3) return 2; // Medium
    else if (empty_cells < dim * 4) return 3; // Hard
    else if (empty_cells < dim * 5) return 4; // Expert
    else return 5; // Evil
}

/**
 * @brief Generates a random Sudoku puzzle with the specified difficulty
 * @param puzzle Array to store the generated puzzle (must be pre-allocated)
 * @param dim Dimension of the puzzle (e.g., 9 for a 9x9 puzzle)
 * @param difficulty Difficulty level (1=Easy, 2=Medium, 3=Hard, 4=Expert, 5=Evil)
 * @return true if a puzzle is successfully generated, false otherwise
 */
bool generate_puzzle(int* puzzle, int dim, int difficulty) {
    // This is a placeholder function.
    // A complete implementation would generate random puzzles
    // with the specified difficulty level.
    
    if (!puzzle) return false;
    
    // Initialize all cells to empty
    memset(puzzle, 0, dim * dim * sizeof(int));
    
    // Just return false for now. This would be implemented in a real puzzle generator.
    return false;
}
