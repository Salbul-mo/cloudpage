/**
 * JavaScript interface for the WebAssembly Sudoku solver
 */

// Wait for the WASM module to initialize
SudokuModule().then(module => {
    // References to DOM elements
    const solveBtn = document.getElementById('solve-btn');
    const clearBtn = document.getElementById('clear-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const generateBtn = document.getElementById('generate-btn');
    const difficultySelect = document.getElementById('difficulty');
    const sudokuGrid = document.getElementById('sudoku-grid');
    const statusElement = document.getElementById('status');

    // Grid dimension (9x9 standard Sudoku)
    const DIM = 9;

    // Sample puzzle (0 represents empty cells)
    const SAMPLE_PUZZLE = [
        5, 3, 0, 0, 7, 0, 0, 0, 0,
        6, 0, 0, 1, 9, 5, 0, 0, 0,
        0, 9, 8, 0, 0, 0, 0, 6, 0,
        8, 0, 0, 0, 6, 0, 0, 0, 3,
        4, 0, 0, 8, 0, 3, 0, 0, 1,
        7, 0, 0, 0, 2, 0, 0, 0, 6,
        0, 6, 0, 0, 0, 0, 2, 8, 0,
        0, 0, 0, 4, 1, 9, 0, 0, 5,
        0, 0, 0, 0, 8, 0, 0, 7, 9
    ];

    // Create references to WASM exported functions
    const solveSudoku = module.cwrap('solve_sudoku', 'number', ['number', 'number', 'number']);
    const allocateSudokuArray = module.cwrap('allocate_sudoku_array', 'number', ['number']);
    const freeSudokuArray = module.cwrap('free_sudoku_array', 'number', ['number']);
    const setSudokuValue = module.cwrap('set_sudoku_value', 'void', ['number', 'number', 'number']);
    const getSudokuValue = module.cwrap('get_sudoku_value', 'number', ['number', 'number']);
    const validateSudoku = module.cwrap('validate_sudoku', 'number', ['number', 'number']);
    const hasUniqueSolution = module.cwrap('has_unique_sudoku_solution', 'number', ['number', 'number']);
    const getPuzzleDifficulty = module.cwrap('get_sudoku_difficulty', 'number', ['number', 'number']);
    const generateSudoku = module.cwrap('generate_sudoku', 'number', ['number', 'number', 'number']);

    // Initialize the Sudoku grid
    function initializeGrid() {
        sudokuGrid.innerHTML = '';
        for (let i = 0; i < DIM; i++) {
            const row = document.createElement('div');
            row.className = 'sudoku-row';
            for (let j = 0; j < DIM; j++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '1';
                input.max = '9';
                input.dataset.row = i;
                input.dataset.col = j;
                cell.appendChild(input);
                row.appendChild(cell);
            }
            sudokuGrid.appendChild(row);
        }
    }

    // Load a puzzle into the grid
    function loadPuzzle(puzzle) {
        const inputs = sudokuGrid.querySelectorAll('input');
        inputs.forEach((input, index) => {
            input.value = puzzle[index] === 0 ? '' : puzzle[index];
        });
    }

    // Get the current puzzle from the grid
    function getPuzzleFromGrid() {
        const puzzle = new Array(DIM * DIM);
        const inputs = sudokuGrid.querySelectorAll('input');
        inputs.forEach((input, index) => {
            puzzle[index] = input.value === '' ? 0 : parseInt(input.value, 10);
        });
        return puzzle;
    }

    // Solve the current puzzle
    function solve() {
        try {
            statusElement.textContent = 'Solving...';
            statusElement.className = 'status';

            // Get puzzle from grid
            const puzzle = getPuzzleFromGrid();

            // Allocate memory for the puzzle and solution
            const puzzlePtr = allocateSudokuArray(DIM);
            const solutionPtr = allocateSudokuArray(DIM);

            // Copy puzzle data to WASM memory
            for (let i = 0; i < DIM * DIM; i++) {
                setSudokuValue(puzzlePtr, i, puzzle[i]);
            }

            // Solve the puzzle
            const solved = solveSudoku(puzzlePtr, DIM, solutionPtr);

            if (solved) {
                // Get solution from WASM memory
                const solution = new Array(DIM * DIM);
                for (let i = 0; i < DIM * DIM; i++) {
                    solution[i] = getSudokuValue(solutionPtr, i);
                }

                // Update the grid with the solution
                loadPuzzle(solution);
                statusElement.textContent = 'Puzzle solved successfully!';
            } else {
                statusElement.textContent = 'No solution exists for this puzzle.';
                statusElement.className = 'status error';
            }

            // Free memory
            freeSudokuArray(puzzlePtr);
            freeSudokuArray(solutionPtr);
        } catch (error) {
            statusElement.textContent = 'Error: ' + error.message;
            statusElement.className = 'status error';
            console.error(error);
        }
    }

    // Clear the grid
    function clearGrid() {
        const inputs = sudokuGrid.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
        });
        statusElement.textContent = 'Ready to solve your Sudoku puzzle.';
        statusElement.className = 'status';
    }

    // Load sample puzzle
    function loadSample() {
        loadPuzzle(SAMPLE_PUZZLE);
        statusElement.textContent = 'Sample puzzle loaded.';
        statusElement.className = 'status';
    }

    // Generate a new puzzle with the selected difficulty
    function generatePuzzle() {
        try {
            const difficulty = parseInt(difficultySelect.value, 10);
            const difficultyNames = ['', 'Easy', 'Medium', 'Hard', 'Expert', 'Evil'];
            
            statusElement.textContent = `Generating ${difficultyNames[difficulty]} puzzle...`;
            statusElement.className = 'status';

            // Allocate memory for the puzzle
            const puzzlePtr = allocateSudokuArray(DIM);

            // Generate the puzzle
            const success = generateSudoku(puzzlePtr, DIM, difficulty);

            if (success) {
                // Get generated puzzle from WASM memory
                const puzzle = new Array(DIM * DIM);
                for (let i = 0; i < DIM * DIM; i++) {
                    puzzle[i] = getSudokuValue(puzzlePtr, i);
                }

                // Update the grid with the generated puzzle
                loadPuzzle(puzzle);
                statusElement.textContent = `${difficultyNames[difficulty]} puzzle generated successfully!`;
            } else {
                statusElement.textContent = 'Failed to generate puzzle.';
                statusElement.className = 'status error';
            }

            // Free memory
            freeSudokuArray(puzzlePtr);
        } catch (error) {
            statusElement.textContent = 'Error: ' + error.message;
            statusElement.className = 'status error';
            console.error(error);
        }
    }

    // Event listeners
    solveBtn.addEventListener('click', solve);
    clearBtn.addEventListener('click', clearGrid);
    sampleBtn.addEventListener('click', loadSample);
    generateBtn.addEventListener('click', generatePuzzle);

    // Initialize the grid
    initializeGrid();
});