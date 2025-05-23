#ifndef DLINKS_MATRIX_H
#define DLINKS_MATRIX_H
#include <stdbool.h>

#define uln "\033[4m"
#define res "\033[0m"
#define DIM 9
#define GRID_SIZE (DIM * DIM)
#define MAX_NODES 4200 // 최악의 경우 (3970) 대비 약 5% 여유
#define MAX_STACK_SIZE 2000
#define NODE_SIZE sizeof(Node)
#define MEMORY_POOL_SIZE (MAX_NODES * NODE_SIZE) // 약 168 KB

// Toroidal Matrix structure used for holding the constraints of an exact cover problem
typedef struct _matrix Matrix;
typedef struct _node Node;
typedef struct _solution_stack solution_stack;
typedef struct _search_state search_state;
typedef struct _search_stack search_stack;

// Data node for sparse matrix
struct _node {
    int row, col, value, type, count;
    Node* up, *down, *left, *right;
    Matrix* matrix;
    int pool_index; // 메모리 풀 내 위치
    bool is_used;   // 사용 여부 플래그
};

// Toroidally linked sparse matrix
struct _matrix {
    Node* rows[DIM * DIM * DIM];    // 9 x 9 x 9 = 729
    Node* cols[DIM * DIM * 4];      // 9 x 9 x 4 = 324
    Node* root;
    int num_rows, num_cols;
    solution_stack* solution;
    bool solved;
};

// Simple array-based stack for holding solution to algorithm x
struct _solution_stack {
    Node* items[MAX_STACK_SIZE];
    int top;
};

// State structure for iterative Algorithm x
struct _search_state {
    Node* selected_col;
    Node* current_row;
    bool is_backtracking;
};

// Stack for search states (array-based)
struct _search_stack {
    search_state states[MAX_STACK_SIZE];
    int top;
};

// Function declarations
Matrix* create_matrix(int num_rows, int num_cols);
void insert_node(Matrix* mx, int row, int col, int value);
void remove_node(Matrix* mx, int row, int col);
void delete_matrix(Matrix* mx);
bool alg_x_search_iterative(Matrix* mx, int max_iterations, int* iterations_done);
bool alg_x_count_solutions(Matrix* mx, int max_iterations, int* solution_count);
void cover(Node* n);
void uncover(Node* n);
solution_stack* create_stack(void);
void push_stack(solution_stack* stack, Node* data);
void pop_stack(solution_stack* stack);
void reset_stack(solution_stack* stack);
search_stack* create_search_stack(void);
void push_search_stack(search_stack* stack, search_state state);
search_state* pop_search_stack(search_stack* stack);
void reset_search_stack(search_stack* stack);
Node* select_min_column(Matrix* matrix);


// Memory Pool Management
void init_memory_pool(void);
Node* alloc_node(void);
void free_node(Node* node);
void reset_memory_pool(void);
int get_memory_error(void);
void clear_memory_error(void);

static inline bool matrix_is_empty(Matrix* matrix) {
    return matrix->root->right == matrix->root;
}

static inline Node* column_of(Node* node) {
    if (node->col == -1) {return node->matrix->root;}
    return node->matrix->cols[node->col];
}

static inline bool column_is_covered(Node* node) {
    return !(column_of(node)->right->left == column_of(node));
}

#endif