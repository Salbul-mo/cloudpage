# WASM Sudoku Solver Makefile

# Emscripten compiler and flags
EMCC = emcc
CFLAGS = -O3 -Wall -Wextra -s WASM=1 -s EXPORTED_RUNTIME_METHODS=['cwrap','ccall'] -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME="SudokuModule"

# Source files
SRC_DIR = src
SOURCES = $(SRC_DIR)/dlinks_matrix.c \
          $(SRC_DIR)/solution_stack.c \
          $(SRC_DIR)/sudoku_core.c \
          $(SRC_DIR)/sudoku_wasm.c

# Output files
OUTPUT_DIR = dist
OUTPUT_JS = $(OUTPUT_DIR)/sudoku_solver.js
OUTPUT_WASM = $(OUTPUT_DIR)/sudoku_solver.wasm

# Include directories
INCLUDES = -I$(SRC_DIR)

# Default target
all: $(OUTPUT_JS)

# Create output directory
$(OUTPUT_DIR):
	mkdir -p $(OUTPUT_DIR)

# Compile WASM module
$(OUTPUT_JS): $(SOURCES) | $(OUTPUT_DIR)
	$(EMCC) $(CFLAGS) $(INCLUDES) $(SOURCES) -o $(OUTPUT_JS)

# Clean build files
clean:
	rm -rf $(OUTPUT_DIR)

# Phony targets
.PHONY: all clean
