import type { Piece } from '../models/Piece';

export const isValidMove = (
  piece: Piece | null,
  from: [number, number],
  to: [number, number],
  board: (Piece | null)[][]
): boolean => {
  if (!piece) return false;

  const [fromX, fromY] = from;
  const [toX, toY] = to;

  if (piece.type === 'pawn') {
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;

    if (fromX + direction === toX && fromY === toY && !board[toX][toY]) {
      return true;
    }

    if (
      fromX === startRow &&
      fromX + 2 * direction === toX &&
      fromY === toY &&
      !board[toX][toY]
    ) {
      return true;
    }

    // ataque diagonal (simplificado)
    if (
      fromX + direction === toX &&
      Math.abs(fromY - toY) === 1 &&
      board[toX][toY] &&
      board[toX][toY]?.color !== piece.color
    ) {
      return true;
    }
  }

  return false;
};
