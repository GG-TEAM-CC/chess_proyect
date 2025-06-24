import { useEffect, useRef, useState } from "react";
import { initialBoard } from "../../../shared/types/Constants";
import { Piece, Position } from "../../../domain/models";
import { Board } from "../../../domain/models/Board";
import { Pawn } from "../../../domain/models/Pawn";
import { PieceType, TeamType } from "../../../shared/types/Types";
import Chessboard from "../Chessboard/Chessboard";

export default function GameInit() {
  const [board, setBoard] = useState<Board>(initialBoard.clone());
  
  return (
    <>
      <p style={{ color: "white", fontSize: "24px", textAlign: "center" }}>
        Total turns: {board.totalTurns}
      </p>
      <Chessboard pieces={board.pieces} />
    </>
  );
}
