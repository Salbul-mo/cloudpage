#include <assert.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
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
    Matrix* matrix = puzzle_to_matrix(puzzle, dim);
    if (!matrix) return false;
    
    // Find the first solution
    bool found_first = alg_x_search(matrix);
    if (!found_first) {
        delete_matrix(matrix);
        return false; // No solution
    }
    
    // Save the first solution
    int solution_size = 0;
    for (solution_node* itr = matrix->solution->head; itr != NULL; itr = itr->next) {
        solution_size++;
    }
    
    int* first_solution = (int*)malloc(solution_size * sizeof(int));
    if (!first_solution) {
        delete_matrix(matrix);
        return false;
    }
    
    int i = 0;
    for (solution_node* itr = matrix->solution->head; itr != NULL; itr = itr->next) {
        first_solution[i++] = ((Node*)itr->data)->row;
    }
    
    // Clear the solution and try to find a second one
    clear_solution(matrix->solution);
    
    // Modify the search to exclude the first solution
    // We'll create a custom alg_x_search function that avoids the first solution
    
    // Create a function pointer to the original cover_column function
    void (*original_cover)(Matrix*, int) = matrix->cover_column;
    
    // Set up variables to track search state
    bool found_second = false;
    int depth = 0;
    int max_depth = solution_size;
    
    // Custom search function that tries to find a different solution
    bool try_different_solution(Matrix* m) {
        if (depth >= max_depth) {
            found_second = true;
            return true;
        }
        
        // Choose a column and cover it
        int col = choose_column(m);
        if (col < 0) return true; // No more columns to cover
        
        original_cover(m, col);
        
        // Try each row in this column
        Node* row_node = m->col_headers[col].down;
        while (row_node != &m->col_headers[col]) {
            // Skip this row if it's part of the first solution
            bool in_first_solution = false;
            for (int j = 0; j < solution_size; j++) {
                if (row_node->row == first_solution[j]) {
                    in_first_solution = true;
                    break;
                }
            }
            
            if (!in_first_solution) {
                // Cover all other columns in this row
                Node* node = row_node;
                do {
                    cover_column(m, node->col);
                    node = node->right;
                } while (node != row_node);
                
                // Add this row to the solution
                push_solution(m->solution, row_node);
                depth++;
                
                // Recursive search
                if (try_different_solution(m)) {
                    found_second = true;
                    return true;
                }
                
                // Backtrack
                pop_solution(m->solution);
                depth--;
                
                // Uncover columns
                node = row_node->left;
                do {
                    uncover_column(m, node->col);
                    node = node->left;
                } while (node != row_node->left);
            }
            
            row_node = row_node->down;
        }
        
        // Uncover this column and backtrack
        uncover_column(m, col);
        return false;
    }
    
    // Try to find a second solution
    try_different_solution(matrix);
    
    // Clean up
    free(first_solution);
    delete_matrix(matrix);
    
    // If we found a second solution, the puzzle doesn't have a unique solution
    return !found_second;
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
    if (!puzzle) return false;
    
    // Initialize all cells to empty
    memset(puzzle, 0, dim * dim * sizeof(int));
    
    // Generate a full, solved puzzle
    int* full_puzzle = (int*)malloc(dim * dim * sizeof(int));
    if (!full_puzzle) return false;
    
    // Start with a random seed in a few cells
    memset(full_puzzle, 0, dim * dim * sizeof(int));
    
    // Set a few random values to start
    int box_size = (int)sqrt(dim);
    srand((unsigned int)time(NULL));
    
    // Place random digits in each box to create a valid starting point
    for (int box_row = 0; box_row < box_size; box_row++) {
        for (int box_col = 0; box_col < box_size; box_col++) {
            int r = box_row * box_size + rand() % box_size;
            int c = box_col * box_size + rand() % box_size;
            int val = rand() % dim + 1;
            
            // Make sure the value is valid
            bool valid = true;
            for (int i = 0; i < dim; i++) {
                // Check row
                if (full_puzzle[r * dim + i] == val) {
                    valid = false;
                    break;
                }
                
                // Check column
                if (full_puzzle[i * dim + c] == val) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                full_puzzle[r * dim + c] = val;
            }
        }
    }
    
    // Solve the puzzle to get a complete valid Sudoku
    if (!solve_puzzle(full_puzzle, dim, full_puzzle)) {
        free(full_puzzle);
        return false;
    }
    
    // Copy the full solution
    memcpy(puzzle, full_puzzle, dim * dim * sizeof(int));
    
    // Determine how many cells to remove based on difficulty
    int cells_to_remove;
    switch (difficulty) {
        case 1: // Easy
            cells_to_remove = dim * dim * 0.4; // 40% cells removed
            break;
        case 2: // Medium
            cells_to_remove = dim * dim * 0.5; // 50% cells removed
            break;
        case 3: // Hard
            cells_to_remove = dim * dim * 0.6; // 60% cells removed
            break;
        case 4: // Expert
            cells_to_remove = dim * dim * 0.7; // 70% cells removed
            break;
        case 5: // Evil
            cells_to_remove = dim * dim * 0.75; // 75% cells removed
            break;
        default:
            cells_to_remove = dim * dim * 0.5; // Default to medium
            break;
    }
    
    // Create an array of indices to shuffle
    int* indices = (int*)malloc(dim * dim * sizeof(int));
    if (!indices) {
        free(full_puzzle);
        return false;
    }
    
    for (int i = 0; i < dim * dim; i++) {
        indices[i] = i;
    }
    
    // Shuffle indices
    for (int i = dim * dim - 1; i > 0; i--) {
        int j = rand() % (i + 1);
        int temp = indices[i];
        indices[i] = indices[j];
        indices[j] = temp;
    }
    
    // Remove cells one by one and check if puzzle still has a unique solution
    int* temp_puzzle = (int*)malloc(dim * dim * sizeof(int));
    if (!temp_puzzle) {
        free(full_puzzle);
        free(indices);
        return false;
    }
    
    int removed = 0;
    for (int i = 0; i < dim * dim && removed < cells_to_remove; i++) {
        int idx = indices[i];
        int original_value = puzzle[idx];
        
        // Try removing this cell
        puzzle[idx] = 0;
        
        // Copy to temp puzzle for testing
        memcpy(temp_puzzle, puzzle, dim * dim * sizeof(int));
        
        // Check if the puzzle still has a unique solution
        if (!has_unique_solution(temp_puzzle, dim)) {
            // If not, put the value back
            puzzle[idx] = original_value;
        } else {
            removed++;
        }
    }
    
    // Clean up
    free(full_puzzle);
    free(indices);
    free(temp_puzzle);
    
    return true;
}