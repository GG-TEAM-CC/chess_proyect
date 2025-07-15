import type { Piece } from '../models/Piece';
//Lógica inicial de movimientos
// Initial move logic for chess pieces
export const isValidMove = (
  piece: Piece | null,
  from: [number, number],
  to: [number, number],
  board: (Piece | null)[][]
): boolean => {
  if (!piece) return false;
    // Verifica si la pieza es nula
  const [fromX, fromY] = from;
  const [toX, toY] = to;
    // Verifica si las coordenadas de origen y destino son válidas
  if (piece.type === 'pawn') {
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;
    // Movimiento hacia adelante
    if (fromX + direction === toX && fromY === toY && !board[toX][toY]) {
      return true;
    }
    // Movimiento doble desde la fila de inicio
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
