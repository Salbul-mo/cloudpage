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
