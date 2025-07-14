// src/pages/RealTimeGame.tsx
import { useState } from "react";
import { initialBoard } from "../../../shared/types/Constants";
import { Piece, Position } from "../../../domain/models";
import { Board } from "../../../domain/models/Board";
import { PieceType } from "../../../shared/types/Types";
import RealTimeChessboard from "../RealTimeChessboard/RealTimeChessboard";

const recoveryTimes: Record<PieceType, number> = {
  pawn: 1000,
  king: 2000,
  b: 3000,
  ROOK: 4000,
  QUEEN: 5000,
  KING: 6000,
};

export default function RealTimeGame() {
  const [board, setBoard] = useState<Board>(initialBoard.clone());

  function playMove(playedPiece: Piece, destination: Position): boolean {
    if (playedPiece.possibleMoves === undefined) return false;

    const validMove = playedPiece.possibleMoves?.some((m) =>
      m.samePosition(destination)
    );
    if (!validMove) return false;

    setBoard(() => {
      const clonedBoard = board.clone();
      clonedBoard.playMove(false, true, playedPiece, destination);
      return clonedBoard;
    });

    return true;
  }

  return (
    <div className="flex flex-col items-center justify-center text-white min-h-screen bg-gray-900">
      <h1 className="text-3xl font-bold mb-4">Ajedrez en Tiempo Real</h1>
      <RealTimeChessboard playMove={playMove} pieces={board.pieces} />
    </div>
  );
}
