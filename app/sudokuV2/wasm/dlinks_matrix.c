#include <assert.h>
#include <string.h>
#include "dlinks_matrix.h"

// 메모리 풀 정의
static unsigned char memory_pool[MEMORY_POOL_SIZE];     // 고정 크기 메모리 풀 (약 168KB)
static bool memory_pool_used[MAX_NODES];                // 사용 여부 플래그
static int memory_pool_next = 0;                        // 다음 할당 위치
static int memory_error = 0;                            // 메모리 에러 플래그

void init_memory_pool(void) {
    memset(memory_pool_used, 0, sizeof(memory_pool_used));
    memory_pool_next = 0;
    memory_error = 0;
}

void reset_memory_pool(void) {
    memset(memory_pool_used, 0, sizeof(memory_pool_used));
    memory_pool_next = 0;
    memory_error = 0;
}

Node* alloc_node(void) {
    while (memory_pool_next < MAX_NODES && memory_pool_used[memory_pool_next]) {
        memory_pool_next++;
    }
    if (memory_pool_next >= MAX_NODES) {
        memory_error = 1; // 메모리 초과 에러
        return NULL;
    }
    int index = memory_pool_next;
    memory_pool_used[index] = true;
    memory_pool_next++;
    Node* node = (Node*)(memory_pool + index * NODE_SIZE);
    node->pool_index = index;
    node->is_used = true;
    return node;
}

void free_node(Node* node) {
    if (node && node->is_used) {
        memory_pool_used[node->pool_index] = false;
        node->is_used = false;
        if (node->pool_index < memory_pool_next) {
            memory_pool_next = node->pool_index;
        }
    }
}

int get_memory_error(void) {
    return memory_error;
}

void clear_memory_error(void) {
    memory_error = 0;
}

void init_matrix(Matrix* mx) {
    Node* root = alloc_node();
    if (!root) return;
    root->row = -1;
    root->col = -1;
    root->type = 3;
    root->value = -1;
    root->count = -1;
    root->up = root->down = root->left = root->right = root;
    mx->root = root;

    for (int i =0; i < mx->num_rows; i++) {
        Node* node = alloc_node();
        if (!node) return;
        node->row = i;
        node->col = -1;
        node->type = 2;
        node->value = -1;
        node->count = 0;
        node->up = (i == 0) ? mx->root : mx->rows[i-1];
        node->down = (i == mx->num_rows - 1) ? mx->root : NULL;
        node->right = node;
        node->left = node;
        mx->rows[i] = node;
        if (i > 0) {
            mx->rows[i - 1]->down = node;
        }
    }
    mx->root->up = mx->rows[mx->num_rows - 1];
    mx->rows[mx->num_rows - 1]->down = mx->root;

    for (int i = 0; i < mx->num_cols; i++) {
        Node* node = alloc_node();
        if (!node) return;
        node->row = -1;
        node->col = i;
        node->type = 2;
        node->value = -1;
        node->count = 0;
        node->left = (i == 0) ? mx->root : mx->cols[i - 1];
        node->right = (i == mx->num_cols - 1) ? mx->root : NULL;
        node->down = node;
        node->up = node;
        mx->cols[i] = node;
        if (i > 0) {
            mx->cols[i - 1]->right = node;
        }

    }
    mx->root->left = mx->cols[mx->num_cols - 1];
    mx->cols[mx->num_cols - 1]->right = mx->root;
    mx->root->count = 0;
}

Matrix* create_matrix(int num_rows, int num_cols) {
    static Matrix mx;   // 정적 Matrix 구조체
    mx.num_rows = num_rows;
    mx.num_cols = num_cols;
    mx.solution = create_stack();
    mx.solved = false;
    init_matrix(&mx);
    return &mx;
}

void insert_node(Matrix* mx, int row, int col, int value) {
    assert(row >= 0 && col >= 0 && row < mx->num_rows && col < mx->num_cols);
    Node* new_node = alloc_node();
    if (!new_node) {
        return; // 메모리 초과 시 무시 (상위 단에서 에러 처리)
    }
    new_node->row = row;
    new_node->col = col;
    new_node->type = 1;
    new_node->value = value;
    new_node->count = -1;
    new_node->matrix = mx;

    Node* itr = mx->rows[row];
    Node* start = itr;
    while (itr->right != start && itr->right->col < col) {
        itr = itr->right;
    }
    if (itr->right->col == col) {
        itr->right->value = value;
        free_node(new_node);
        return;
    }
    new_node->right = itr->right;
    new_node->left = itr;
    itr->right = new_node;
    new_node->right->left = new_node;

    itr = mx->cols[col];
    start = itr;
    while (itr->down != start && itr->down->row < row) {
        itr = itr->down;
    }
    new_node->down = itr->down;
    new_node->up = itr;
    itr->down = new_node;
    new_node->down->up = new_node;

    mx->rows[row]->count++;
    mx->cols[col]->count++;
}

void remove_node(Matrix* mx, int row, int col) {
    assert(row >= 0 && col >= 0 && row < mx->num_rows && col <mx->num_cols);
    Node* itr = mx->rows[row];
    Node* start = itr;
    while (itr->right != start && itr->right->col <= col) {
        itr = itr->right;
    }
    if (itr->col != col) {
        return;
    }
    itr->left->right = itr->right;
    itr->right->left = itr->left;
    itr->up->down = itr->down;
    itr->down->up = itr->up;
    mx->rows[row]->count--;
    mx->cols[col]->count--;
    free_node(itr);
}

void delete_matrix(Matrix* mx) {
    reset_stack(mx->solution);
    reset_memory_pool(); // 모든 노드 해제 대신 메모리 풀 리셋
}


Node* select_min_column(Matrix* matrix) {
    if (matrix_is_empty(matrix)) {
        return matrix->root;
    }
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

void cover(Node* n) {
    Node* col = column_of(n);
    col->right->left = col->left;
    col->left->right = col->right;
    for (Node* vert_itr = col->down; vert_itr != col; vert_itr = vert_itr->down) {
        for (Node* horiz_itr = vert_itr->right; horiz_itr != vert_itr; horiz_itr = horiz_itr->right) {
            horiz_itr->up->down = horiz_itr->down;
            horiz_itr->down->up = horiz_itr->up;
            column_of(horiz_itr)->count--;
        }
    }
}

void uncover(Node* n) {
    Node* col = column_of(n);
    for (Node* vert_itr = col->up; vert_itr != col; vert_itr = vert_itr->up) {
        for (Node* horiz_itr = vert_itr->left; horiz_itr != vert_itr; horiz_itr = horiz_itr->left) {
            horiz_itr->up->down = horiz_itr;
            horiz_itr->down->up = horiz_itr;
            column_of(horiz_itr)->count++;
        }
    }
    col->right->left = col;
    col->left->right = col;
}

bool alg_x_search_iterative(Matrix* matrix, int max_iterations, int* iterations_done) {
    if (matrix_is_empty(matrix)) {
        matrix->solved = true;
        *iterations_done = 0;
        return true;
    }

    search_stack* search_stack = create_search_stack();
    int iteration_count = 0;

    search_state initial_state = {
        .selected_col = select_min_column(matrix),
        .current_row = NULL,
        .is_backtracking = false
    };
    push_search_stack(search_stack, initial_state);

    while (search_stack->top >= 0 && iteration_count < max_iterations) {
        iteration_count++;
        search_state* current_state = &search_stack->states[search_stack->top];

        Node* selected_col = current_state->selected_col;
        if (selected_col->count < 1) {
            pop_search_stack(search_stack);
            continue;
        }

        if (current_state->current_row == NULL) {
            current_state->current_row = selected_col->down;
        } else if (!current_state->is_backtracking) {
            current_state->current_row = current_state->current_row->down;
        }

        if (current_state->current_row == selected_col) {
            current_state->is_backtracking = true;
            if (search_stack->top > 0) {
                Node* row_to_uncover = matrix->solution->items[matrix->solution->top - 1];
                Node* horiz_itr = row_to_uncover;
                do {
                    if (horiz_itr->col >= 0) {
                        uncover(horiz_itr);
                    }
                } while ((horiz_itr = horiz_itr->right) != row_to_uncover);
                pop_stack(matrix->solution);
            }
            pop_search_stack(search_stack);
            continue;
        }

        Node* vert_itr = current_state->current_row;
        push_stack(matrix->solution, matrix->rows[vert_itr->row]);
        Node* horiz_itr = vert_itr;
        do {
            if (horiz_itr->col >= 0) {
                cover(horiz_itr);
            }
        } while ((horiz_itr = horiz_itr->right) != vert_itr);

        if (matrix_is_empty(matrix)) {
            matrix->solved = true;
            *iterations_done = iteration_count;
            return true;
        }

        search_state next_state = {
            .selected_col = select_min_column(matrix),
            .current_row = NULL,
            .is_backtracking = false
        };
        push_search_stack(search_stack, next_state);
    }

    matrix->solved = false;
    *iterations_done = iteration_count;
    return false;
}

bool alg_x_count_solutions(Matrix* matrix, int max_iterations, int* solution_count) {
    *solution_count = 0;
    if (matrix_is_empty(matrix)) {
        (*solution_count)++;
        return false; // 게속 다른 해를 찾기 위해 false 반환
    }

    search_stack* search_stack = create_search_stack();
    int iteration_count = 0;

    search_state initial_state = {
        .selected_col = select_min_column(matrix),
        .current_row = NULL,
        .is_backtracking = false
    };
    push_search_stack(search_stack, initial_state);

    while (search_stack->top >= 0 && iteration_count < max_iterations && *solution_count < 2) {
        iteration_count++;
        search_state* current_state = &search_stack->states[search_stack->top];

        Node* selected_col = current_state->selected_col;
        if (selected_col->count < 1) {
            pop_search_stack(search_stack);
            continue;
        }

        if (current_state->current_row == NULL) {
            current_state->current_row = selected_col->down;
        } else if (!current_state->is_backtracking) {
            current_state->current_row = current_state->current_row->down;
        }

        if (current_state->current_row == selected_col) {
            current_state->is_backtracking = true;
            if (search_stack->top > 0) {
                Node* row_to_uncover = matrix->solution->items[matrix->solution->top -1];
                Node* horiz_itr = row_to_uncover;
                do {
                    if (horiz_itr->col >= 0) {
                        uncover(horiz_itr);
                    }
                } while ((horiz_itr = horiz_itr->right) != row_to_uncover);
                pop_stack(matrix->solution);
            }
            pop_search_stack(search_stack);
            continue;
        }

        Node* vert_itr = current_state->current_row;
        push_stack(matrix->solution, matrix->rows[vert_itr->row]);
        Node* horiz_itr = vert_itr;
        do {
            if (horiz_itr->col >= 0) {
                cover(horiz_itr);
            }
        } while ((horiz_itr = horiz_itr->right) != vert_itr);

        if (matrix_is_empty(matrix)) {
            (*solution_count)++;
            if (*solution_count >= 2) {
                return true;
            }
            horiz_itr = vert_itr->left;
            do {
                if (horiz_itr->col >= 0) {
                    uncover(horiz_itr);
                }
            } while ((horiz_itr = horiz_itr->left) != vert_itr);
            pop_stack(matrix->solution);
        } else {
            search_state next_state = {
                .selected_col = select_min_column(matrix),
                .current_row = NULL,
                .is_backtracking = false
            };
            push_search_stack(search_stack, next_state);
        }
    }

    return *solution_count >= 2;
}

solution_stack* create_stack(void) {
    static solution_stack stack;
    stack.top = 0;
    return &stack;
}

void push_stack(solution_stack* stack, Node* data) {
    if (stack->top < MAX_STACK_SIZE) {
        stack->items[stack->top] = data;
        stack->top++;
    }
}

void pop_stack(solution_stack* stack) {
    if (stack->top > 0) {
        stack->top--;
    }
}

void reset_stack(solution_stack* stack) {
    stack->top = 0;
}

search_stack* create_search_stack(void) {
    static search_stack stack;
    stack.top = -1;
    return &stack;
}

void push_search_stack(search_stack* stack, search_state state) {
    if (stack->top < MAX_STACK_SIZE - 1) {
        stack->top++;
        stack->states[stack->top] = state;
    }
}

search_state* pop_search_stack(search_stack* stack) {
    if (stack->top >= 0) {
        return &stack->states[stack->top--];
    }
    return NULL;
}

void reset_search_stack(search_stack* stack) {
    stack->top = -1;
}
