export const nextMoves: Record<string, number> = {
    // First move
    "100000000": 4,
    "010000000": 4,
    "001000000": 4,
    "000100000": 4,
    "000010000": 0,
    "000001000": 4,
    "000000100": 4,
    "000000010": 4,
    "000000001": 4,
    // Second move (1)
    "100021000": 7,
    "100020010": 5,
    "100020001": 1,
    // Second move (2)
    "010120000": 2,
    "010021000": 0,
    "010020100": 5,
    "010020010": 0,
    "010020001": 3,
    // Second move (3)
    "001120000": 7,
    "001020100": 1,
    "001020010": 3,
    // Second move (4)
    "000121000": 0,
    "000120010": 0,
    "000120001": 1,
    // Second move (5)
    "200010001": 2,
    // Second move (6)
    "000021100": 1,
    "000021010": 2,
    // Second move (7)
    // Second move (8)
    // Second move (9)
}

/**
 * Converts a Tic Tac Toe board encoded as a string of '0', '1', and '2' characters into a number.
 * The board string must only contain '0', '1', and '2' characters.
 * The number is calculated by treating the board string as a base-3 number, where '0' is equivalent to 0, '1' is equivalent to 1, and '2' is equivalent to 2.
 * @param {string} board The Tic Tac Toe board encoded as a string of '0', '1', and '2' characters.
 * @returns {number} The number equivalent to the given board string.
 * @throws {Error} If the given board string contains characters other than '0', '1', and '2'.
 */
export function convertEncodeBoard(board: string): number {
    let result = 0;
    for (let i = 0; i < board.length; i++) {
        if (board[i] !== '0' && board[i] !== '1' && board[i] !== '2') {
            throw new Error(`Invalid board character: ${board[i]}. Board must only contain '0', '1', and '2'.`);
        }
        result += parseInt(board[i]) * Math.pow(3, board.length - 1 - i);
    }
    return result;
}
/**
 * Converts a number into a Tic Tac Toe board encoded as a string of '0', '1', and '2' characters.
 * The number is treated as a base-3 number, where '0' is equivalent to 0, '1' is equivalent to 1, and '2' is equivalent to 2.
 * @param {number} board The number to convert.
 * @returns {string} The Tic Tac Toe board encoded as a string of '0', '1', and '2' characters.
 */
export function convertDecodeBoard(board: number): string {
    let result = '';
    while (board > 0) {
        result = (board % 3).toString() + result;
        board = Math.floor(board / 3);
    }
    return result.padStart(9, '0');
}

/**
 * Checks if a given Tic Tac Toe board is a winning board for the given player.
 * A board is considered a winning board if all cells in one of the following combinations contain the given player's mark:
 * - Row 1: Cells 0, 1, and 2.
 * - Row 2: Cells 3, 4, and 5.
 * - Row 3: Cells 6, 7, and 8.
 * - Column 1: Cells 0, 3, and 6.
 * - Column 2: Cells 1, 4, and 7.
 * - Column 3: Cells 2, 5, and 8.
 * - Diagonal from top-left to bottom-right: Cells 0, 4, and 8.
 * - Diagonal from top-right to bottom-left: Cells 2, 4, and 6.
 * @param {string} board The Tic Tac Toe board encoded as a string of '0', '1', and '2' characters.
 * @param {string} player The player to check for.
 * @returns {boolean} true if the given board is a winning board for the given player, false otherwise.
 */
export function isWinningBoard(board: string, player: '1' | '2'): boolean {
    const winningCombinations = [
        [0, 1, 2], // Row 1
        [3, 4, 5], // Row 2
        [6, 7, 8], // Row 3
        [0, 3, 6], // Column 1
        [1, 4, 7], // Column 2
        [2, 5, 8], // Column 3
        [0, 4, 8], // Diagonal from top-left to bottom-right
        [2, 4, 6], // Diagonal from top-right to bottom-left
    ];
    return winningCombinations.some((combination) => combination.every((index) => board[index] === player));
}

/**
 * Checks if a given Tic Tac Toe board is full.
 * A board is considered full if all cells contain either '1' or '2'.
 * @param {string} board The Tic Tac Toe board encoded as a string of '0', '1', and '2' characters.
 * @returns {boolean} true if the given board is full, false otherwise.
 */
export function isBoardFull(board: string): boolean {
    return !board.includes('0');
}

/**
 * Makes a move on the given Tic Tac Toe board.
 * The move is specified as an index into the board string, where the first character is index 0.
 * The board is modified by replacing the character at the given index with '1'.
 * If the character at the given index is not '0', an error is thrown.
 * @param {string} board The Tic Tac Toe board encoded as a string of '0', '1', and '2' characters.
 * @param {number} move The index of the cell to modify.
 * @returns {string} The modified Tic Tac Toe board encoded as a string of '0', '1', and '2' characters.
 * @throws {Error} If the character at the given index is not '0'.
 */
export function Move(board: string, move: number): string {
    let newBoard = board;
    if (board[move] !== '0') {
        throw new Error(`Invalid move: cell ${move} is already occupied.`);
    }
    newBoard = newBoard.substring(0, move) + '1' + newBoard.substring(move + 1);
    return newBoard;
}

/**
 * Calculates the next move for the given Tic Tac Toe board and player.
 * The algorithm works as follows:
 * 1. Check if the current player can win in the next move.
 * 2. Check if the opponent can win in the next move.
 * 3. If neither player can win in the next move, return a calculated move.
 * 4. If there are no calculated moves, return a random move.
 * @param {string} board The Tic Tac Toe board encoded as a string of '0', '1', and '2' characters.
 * @param {string} player The player to make the next move for.
 * @returns {number} The index of the cell to modify for the next move.
 */
export function getNextMove(board: string, player: '1' | '2'): number {
    // Check if the current player can win in the next move
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '0') {
            const newBoard = board.substring(0, i) + player + board.substring(i + 1);
            if (isWinningBoard(newBoard, player)) {
                return i;
            }
        }
    }

    // Check if the opponent can win in the next move
    const opponent = player === '1' ? '2' : '1';
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '0') {
            const newBoard = board.substring(0, i) + opponent + board.substring(i + 1);
            if (isWinningBoard(newBoard, opponent)) {
                return i;
            }
        }
    }

    // If neither player can win in the next move, return a calculated move
    if (nextMoves[board]) return nextMoves[board];
    // If there are no calculated moves, return a random move
    return Math.floor(Math.random() * board.length);
}
