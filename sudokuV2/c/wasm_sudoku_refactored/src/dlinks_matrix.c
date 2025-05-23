#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include "dlinks_matrix.h"

// Forward declarations of helper functions
static void init_matrix(Matrix* mx);
static Node* create_node(Matrix* mx, int row, int col, int type, int value, int count);
static Node* select_min_column(Matrix* matrix);
static void cover(Node* n);
static void uncover(Node* n);

/**
 * @brief Create a new matrix
 * @param num_rows Number of rows in the matrix
 * @param num_cols Number of columns in the matrix
 * @return Pointer to the new matrix
 */
Matrix* create_matrix(int num_rows, int num_cols) {
    Matrix* mx = (Matrix*)malloc(sizeof(Matrix));
    if (!mx) return NULL;
    
    mx->rows = (Node**)malloc(sizeof(Node*) * num_rows);
    if (!mx->rows) {
        free(mx);
        return NULL;
    }
    
    mx->cols = (Node**)malloc(sizeof(Node*) * num_cols);
    if (!mx->cols) {
        free(mx->rows);
        free(mx);
        return NULL;
    }
    
    mx->num_rows = num_rows;
    mx->num_cols = num_cols;
    
    mx->solution = create_stack();
    if (!mx->solution) {
        free(mx->cols);
        free(mx->rows);
        free(mx);
        return NULL;
    }
    
    init_matrix(mx);
    return mx;
}

/**
 * @brief Insert a node into the matrix
 * @param mx Pointer to the matrix
 * @param row Row index for the node
 * @param col Column index for the node
 * @param value Value of the node
 */
void insert_node(Matrix* mx, int row, int col, int value) {
    if (!mx) return;
    
    assert(row >= 0 && col >= 0 && row < mx->num_rows && col < mx->num_cols);
    
    // Create new node
    Node* new_node = create_node(mx, row, col, 1, value, -1);
    if (!new_node) return;

    // Iterate through row to find correct placement of node in row
    Node* itr = mx->rows[row];
    Node* start = itr;
    
    while (itr->right != start && itr->right->col < col) {
        itr = itr->right;
    }
    
    // If node at this position already exists, reassign value and leave
    if (itr->right->col == col) {
        itr->right->value = value;
        free(new_node);
        return;
    }
    
    // Reassign left and right pointers
    new_node->right = itr->right;
    new_node->left = itr;
    itr->right = new_node;
    new_node->right->left = new_node;

    // Iterate through column to find correct placement of node in column
    itr = mx->cols[col];
    start = itr;
    
    while (itr->down != start && itr->down->row < row) {
        itr = itr->down;
    }
    
    // Reassign up and down pointers
    new_node->down = itr->down;
    new_node->up = itr;
    itr->down = new_node;
    new_node->down->up = new_node;

    mx->rows[row]->count++;
    mx->cols[col]->count++;
}

/**
 * @brief Remove a node from the matrix
 * @param mx Pointer to the matrix
 * @param row Row index of the node to remove
 * @param col Column index of the node to remove
 */
void remove_node(Matrix* mx, int row, int col) {
    if (!mx) return;
    
    assert(row >= 0 && col >= 0 && row < mx->num_rows && col < mx->num_cols);

    // Iterate through row to find node to remove
    Node* itr = mx->rows[row];
    Node* start = itr;
    
    while (itr->right != start && itr->right->col <= col) {
        itr = itr->right;
    }
    
    // If node doesn't exist, leave
    if (itr->col != col) return;
    
    // Reassign pointers
    itr->left->right = itr->right;
    itr->right->left = itr->left;
    itr->up->down = itr->down;
    itr->down->up = itr->up;

    mx->rows[row]->count--;
    mx->cols[col]->count--;
    
    free(itr);
}

/**
 * @brief Delete the matrix and free its memory
 * @param mx Pointer to the matrix
 */
void delete_matrix(Matrix* mx) {
    if (!mx) return;
    
    delete_stack(mx->solution);
    
    // Free column headers
    for (int i = 0; i < mx->num_cols; i++) {
        free(mx->cols[i]);
    }
    
    // Free rows and their nodes
    for (int i = 0; i < mx->num_rows; i++) {
        Node* itr = mx->rows[i]->right;
        Node* start = mx->rows[i]->right;
        
        while (itr->right != start) {
            itr = itr->right;
            free(itr->left);
        }
        
        free(itr);
    }
    
    free(mx->rows);
    free(mx->cols);
    free(mx->root);
    free(mx);
}

/**
 * @brief Instantiate and initialize a Matrix Node
 * @param mx Pointer to the matrix
 * @param row Row index for the node
 * @param col Column index for the node
 * @param type Type of the node
 * @param value Value of the node
 * @param count Count for the node
 * @return Pointer to the new node
 */
static Node* create_node(Matrix* mx, int row, int col, int type, int value, int count) {
    Node* node = (Node*)malloc(sizeof(Node));
    if (!node) return NULL;
    
    node->row = row;
    node->col = col;
    node->type = type;
    node->value = value;
    node->count = count;
    node->up = NULL;
    node->down = NULL;
    node->left = NULL;
    node->right = NULL;
    node->matrix = mx;
    
    return node;
}

/**
 * @brief Initialize the Row and Column headers of the Matrix
 * @param mx Pointer to the matrix
 */
static void init_matrix(Matrix* mx) {
    if (!mx) return;
    
    // Create root of matrix
    mx->root = create_node(mx, -1, -1, 3, -1, -1);
    if (!mx->root) return;
    
    // Instantiate array of row header nodes
    mx->rows[0] = create_node(mx, 0, -1, 2, -1, 0);
    if (!mx->rows[0]) return;
    
    mx->rows[0]->right = mx->rows[0];
    mx->rows[0]->left = mx->rows[0];
    mx->rows[0]->up = mx->root;
    mx->root->down = mx->rows[0];
    
    for (int i = 1; i < mx->num_rows; i++) {
        Node* node = create_node(mx, i, -1, 2, -1, 0);
        if (!node) return;
        
        node->up = mx->rows[i-1];
        mx->rows[i-1]->down = node;
        node->right = node;
        node->left = node;
        mx->rows[i] = node;
    }
    
    // Last row_header.down points to root
    mx->rows[mx->num_rows-1]->down = mx->root;
    // Root.up points to last row_header
    mx->root->up = mx->rows[mx->num_rows-1];

    // Instantiate array of column header nodes
    mx->cols[0] = create_node(mx, -1, 0, 2, -1, 0);
    if (!mx->cols[0]) return;
    
    mx->cols[0]->down = mx->cols[0];
    mx->cols[0]->up = mx->cols[0];
    mx->cols[0]->left = mx->root;
    mx->root->right = mx->cols[0];
    
    for (int i = 1; i < mx->num_cols; i++) {
        Node* node = create_node(mx, -1, i, 2, -1, 0);
        if (!node) return;
        
        node->left = mx->cols[i-1];
        node->down = node;
        node->up = node;
        mx->cols[i-1]->right = node;
        mx->cols[i] = node;
    }
    
    // Last col_header.right points to root
    mx->cols[mx->num_cols-1]->right = mx->root;
    // Root.left points to last col_header
    mx->root->left = mx->cols[mx->num_cols-1];
    mx->root->count = 0;
    mx->solved = false;
}

/**
 * @brief Return column header of column with least number of Nodes in matrix
 * @param matrix Pointer to the matrix
 * @return Pointer to the column header with the least number of nodes
 */
static Node* select_min_column(Matrix* matrix) {
    if (!matrix || matrix_is_empty(matrix)) return matrix->root;
    
    Node* itr = matrix->root->right;
    Node* min_node = itr;
    int min_count = itr->count;
    
    while (itr->right != matrix->root) {
        itr = itr->right;
        if (itr->count < min_count) {
            min_node = itr;
            min_count = itr->count;
        }
    }
    
    return min_node;
}

/**
 * @brief Cover a column of node n for algorithm x
 * @param n Pointer to the node
 */
static void cover(Node* n) {
    if (!n) return;
    
    Node* col = column_of(n);
    
    // Unlink left and right neighbors of col from col
    col->right->left = col->left;
    col->left->right = col->right;
    
    // Iterate through each Node in col top to bottom
    for (Node* vert_itr = col->down; vert_itr != col; vert_itr = vert_itr->down) {
        // Iterate through row left to right
        // For each Node in this row, unlink top and bottom neighbors and reduce count of that column
        for (Node* horiz_itr = vert_itr->right; horiz_itr != vert_itr; horiz_itr = horiz_itr->right) {
            horiz_itr->up->down = horiz_itr->down;
            horiz_itr->down->up = horiz_itr->up;
            column_of(horiz_itr)->count--;
        }
    }
}

/**
 * @brief Uncover a column of node n for algorithm x
 * @param n Pointer to the node
 */
static void uncover(Node* n) {
    if (!n) return;
    
    Node* col = column_of(n);
    
    // Iterate through each Node in col bottom to top
    for (Node* vert_itr = col->up; vert_itr != col; vert_itr = vert_itr->up) {
        // Iterate through row right to left
        // For each Node in this row, relink top and bottom neighbors and increment count of that column
        for (Node* horiz_itr = vert_itr->left; horiz_itr != vert_itr; horiz_itr = horiz_itr->left) {
            horiz_itr->up->down = horiz_itr;
            horiz_itr->down->up = horiz_itr;
            column_of(horiz_itr)->count++;
        }
    }
    
    // Relink left and right neighbors of col to col
    col->right->left = col;
    col->left->right = col;
}

/**
 * @brief Search the toroidal matrix structure for an exact cover
 * @param matrix Pointer to the matrix
 * @return true if exact cover is found, false otherwise
 */
bool alg_x_search(Matrix* matrix) {
    if (!matrix) return false;
    
    // If matrix is empty then an exact cover exists, return true
    if (matrix_is_empty(matrix)) return (matrix->solved = true);
    
    // Select the column with least number of Nodes
    Node* selected_col = select_min_column(matrix);
    
    // If selected column has 0 Nodes, then this branch has failed
    if (selected_col->count < 1) return false;

    Node* vert_itr = selected_col->down;
    Node* horiz_itr;
    
    // Iterate down from selected column head
    while (vert_itr != selected_col && !matrix->solved) {
        // Add selected row to solutions stack
        push_stack(matrix->solution, matrix->rows[vert_itr->row]);

        horiz_itr = vert_itr;
        
        // Iterate right from vertical iterator, cover each column
        do {
            // Skip column of row headers
            if (horiz_itr->col >= 0) cover(horiz_itr);
        } while ((horiz_itr = horiz_itr->right) != vert_itr);

        // Search this matrix again after covering
        // If solution found on this branch, leave loop and stop searching
        if (alg_x_search(matrix)) break;

        // Solution not found on this iteration's branch, need to revert changes to matrix
        // Remove row from solutions, then uncover columns from this iteration
        pop_stack(matrix->solution);
        
        horiz_itr = vert_itr->left;
        
        // Iterate left from the last column that was covered, uncover each column
        do {
            // Skip column of row headers
            if (horiz_itr->col >= 0) uncover(horiz_itr);
        } while ((horiz_itr = horiz_itr->left) != vert_itr->left);

        vert_itr = vert_itr->down;
    }
    
    return matrix->solved;
}