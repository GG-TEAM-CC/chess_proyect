import { useState } from 'react';
import type { Piece } from '../../domain/models/Piece';
import { isValidMove } from '../../domain/services/MoveLogic';
import './ChessBoard.css';
// Tablero de ajedrez
const initialBoard: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

// Inicializar peones
for (let i = 0; i < 8; i++) {
  initialBoard[1][i] = { type: 'pawn', color: 'black' };
  initialBoard[6][i] = { type: 'pawn', color: 'white' };
}

export const ChessBoard = () => {
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);

  const handleClick = (x: number, y: number) => {
    const piece = board[x][y];

    if (selected) {
      const [selX, selY] = selected;
      const selectedPiece = board[selX][selY];

      if (isValidMove(selectedPiece, selected, [x, y], board)) {
        const newBoard = board.map(row => [...row]);
        newBoard[x][y] = selectedPiece;
        newBoard[selX][selY] = null;
        setBoard(newBoard);
      }

      setSelected(null);
    } else if (piece) {
      setSelected([x, y]);
    }
  };

  return (
    <div className="chess-board">
      {board.map((row, x) =>
        row.map((square, y) => {
          const isSelected = selected?.[0] === x && selected?.[1] === y;
          return (
            <div
              key={`${x}-${y}`}
              className={`square ${(x + y) % 2 === 0 ? 'light' : 'dark'} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleClick(x, y)}
            >
              {square && (
                <span className="piece">
                  {square.color === 'white' ? '♙' : '♟︎'}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
