#ifndef SOLUTION_STACK_H
#define SOLUTION_STACK_H

/**
 * @file solution_stack.h
 * @brief Simple linked node based stack for holding solutions
 */

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Solution node structure
 */
typedef struct _solution_node solution_node;
struct _solution_node {
    void* data;
    solution_node* next;
};

/**
 * @brief Solution stack structure
 */
typedef struct _solution_stack solution_stack;
struct _solution_stack {
    solution_node* head;
    int count;
};

/**
 * @brief Create a new solution stack
 * @return Pointer to the newly created solution stack
 */
solution_stack* create_stack(void);

/**
 * @brief Push data onto the stack
 * @param stack Pointer to the stack
 * @param data Pointer to the data to push
 */
void push_stack(solution_stack* stack, void* data);

/**
 * @brief Pop data from the stack
 * @param stack Pointer to the stack
 */
void pop_stack(solution_stack* stack);

/**
 * @brief Delete the stack and free all memory
 * @param stack Pointer to the stack
 */
void delete_stack(solution_stack* stack);

#ifdef __cplusplus
}
#endif

#endif /* SOLUTION_STACK_H */
