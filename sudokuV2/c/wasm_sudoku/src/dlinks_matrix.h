#ifndef DLINKS_MATRIX_H
#define DLINKS_MATRIX_H

/**
 * @file dlinks_matrix.h
 * @brief Toroidal Matrix structure used for holding the constraints of an exact cover problem
 */

#include <stdbool.h>
#include "solution_stack.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Forwards declarations for matrix structures
 */
typedef struct _matrix Matrix;
typedef struct _node Node;

/**
 * @brief Data node for sparse matrix
 */
struct _node {
    int row, col, value, type, count;
    Node* up, *down, *left, *right;
    Matrix* matrix;
};

/**
 * @brief Toroidally linked sparse matrix
 */
struct _matrix {
    Node** rows, **cols;
    Node* root;
    int num_rows, num_cols;
    solution_stack* solution;
    bool solved;
};

/**
 * @brief Create a new matrix with the specified dimensions
 * @param num_rows Number of rows
 * @param num_cols Number of columns
 * @return Pointer to the newly created matrix
 */
Matrix* create_matrix(int num_rows, int num_cols);

/**
 * @brief Insert a node into the matrix at the specified position
 * @param mx Pointer to the matrix
 * @param row Row index
 * @param col Column index
 * @param value Value to insert
 */
void insert_node(Matrix* mx, int row, int col, int value);

/**
 * @brief Cover a column (for Algorithm X)
 * @param n Node to cover
 */
void cover(Node* n);

/**
 * @brief Uncover a column (for Algorithm X)
 * @param n Node to uncover
 */
void uncover(Node* n);

/**
 * @brief Select the column with the minimum number of nodes
 * @param matrix Pointer to the matrix
 * @return Pointer to the column header node
 */
Node* select_min_column(Matrix* matrix);

/**
 * @brief Search for an exact cover using Algorithm X
 * @param mx Pointer to the matrix
 * @return true if a solution is found, false otherwise
 */
bool alg_x_search(Matrix* mx);

/**
 * @brief Delete the matrix and free all memory
 * @param mx Pointer to the matrix
 */
void delete_matrix(Matrix* mx);

/**
 * @brief Check if the matrix is empty
 * @param matrix Pointer to the matrix
 * @return true if the matrix is empty, false otherwise
 */
static inline bool matrix_is_empty(Matrix* matrix) {
    return matrix->root->right == matrix->root;
}

/**
 * @brief Get the column header of a node
 * @param node Pointer to the node
 * @return Pointer to the column header node
 */
static inline Node* column_of(Node* node) {
    if (node->col == -1) {
        return node->matrix->root;
    }
    return node->matrix->cols[node->col];
}

/**
 * @brief Check if a column is covered
 * @param node Pointer to the node
 * @return true if the column is covered, false otherwise
 */
static inline bool column_is_covered(Node* node) {
    return !(column_of(node)->right->left == column_of(node));
}

#ifdef __cplusplus
}
#endif

#endif /* DLINKS_MATRIX_H */
