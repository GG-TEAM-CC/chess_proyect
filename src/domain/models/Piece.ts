//definimos los tipos de piezas y sus colores
// y la interfaz Piece que representa una pieza de ajedrez
//define the types of pieces and their colors
// and the Piece interface that represents a chess piece
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}
