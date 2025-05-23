#ifndef SOLUTION_STACK_H
#define SOLUTION_STACK_H

/**
 * @file solution_stack.h
 * @brief Simple linked node based stack for holding solution to algorithm x
 */

#ifdef __cplusplus
extern "C" {
#endif

typedef struct _solution_node solution_node;
typedef struct _solution_stack solution_stack;

struct _solution_node {
    void* data;
    solution_node* next;
};

struct _solution_stack {
    solution_node* head;
    int count;
};

/**
 * @brief Create a new solution stack
 * @return Pointer to the new solution stack
 */
solution_stack* create_stack(void);

/**
 * @brief Push data onto the solution stack
 * @param stack Pointer to the solution stack
 * @param data Data to push onto the stack
 */
void push_stack(solution_stack* stack, void* data);

/**
 * @brief Pop data from the solution stack
 * @param stack Pointer to the solution stack
 */
void pop_stack(solution_stack* stack);

/**
 * @brief Delete the solution stack and free its memory
 * @param stack Pointer to the solution stack
 */
void delete_stack(solution_stack* stack);

#ifdef __cplusplus
}
#endif

#endif /* SOLUTION_STACK_H */