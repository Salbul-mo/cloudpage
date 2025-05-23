#include <stdlib.h>
#include "solution_stack.h"

/**
 * @brief Create a new solution stack
 * @return Pointer to the newly created solution stack
 */
solution_stack* create_stack(void) {
    solution_stack* stack = (solution_stack*)malloc(sizeof(solution_stack));
    if (!stack) return NULL;
    
    stack->head = NULL;
    stack->count = 0;
    return stack;
}

/**
 * @brief Push data onto the stack
 * @param stack Pointer to the stack
 * @param data Pointer to the data to push
 */
void push_stack(solution_stack* stack, void* data) {
    if (!stack) return;
    
    solution_node* node = (solution_node*)malloc(sizeof(solution_node));
    if (!node) return;
    
    node->data = data;
    node->next = stack->head;
    stack->head = node;
    stack->count++;
}

/**
 * @brief Pop data from the stack
 * @param stack Pointer to the stack
 */
void pop_stack(solution_stack* stack) {
    if (!stack || stack->count < 1) return;
    
    solution_node* tmp = stack->head;
    stack->head = stack->head->next;
    free(tmp);
    stack->count--;
}

/**
 * @brief Delete the stack and free all memory
 * @param stack Pointer to the stack
 */
void delete_stack(solution_stack* stack) {
    if (!stack) return;
    
    if (stack->head != NULL) {
        solution_node* itr = stack->head;
        solution_node* prev = itr;
        
        while (itr->next != NULL) {
            itr = itr->next;
            free(prev);
            prev = itr;
        }
        free(itr);
    }
    
    free(stack);
}
