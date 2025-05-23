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

Matrix* create_matrix(int num_rows, int num_cols) {
    static Matrix mx;   // 정적 Matrix 구조체
    mx.num_rows = num_rows;
    mx.num_cols = num_cols;
    mx.solution = create_stack();
    mx.solved = false;
    init_matrix(&mx);
    return &mx;
}