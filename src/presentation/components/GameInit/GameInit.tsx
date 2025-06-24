import { useEffect, useRef, useState } from "react";
import { initialBoard } from "../../../shared/types/Constants";
import { Piece, Position } from "../../../domain/models";
import { Board } from "../../../domain/models/Board";
import { Pawn } from "../../../domain/models/Pawn";
import { PieceType, TeamType } from "../../../shared/types/Types";
import Chessboard from "../Chessboard/Chessboard";

export default function GameInit() {
  const [board, setBoard] = useState<Board>(initialBoard.clone());
  function playMove(playedPiece: Piece, destination: Position): boolean {
    // If the playing piece doesn't have any moves return
    if (playedPiece.possibleMoves === undefined) return false;

    // Prevent the inactive team from playing
    if (playedPiece.team === TeamType.OUR && board.totalTurns % 2 !== 1) {
      console.log("OUR TURN");
      return false;
    }
    if (playedPiece.team === TeamType.OPPONENT && board.totalTurns % 2 !== 0) {
      console.log("OPPONENT TURN");
      return false;
    }
    let playedMoveIsValid = false;

    const validMove = playedPiece.possibleMoves?.some((m) =>
      m.samePosition(destination)
    );

    if (!validMove) return false;

    const enPassantMove = isEnPassantMove(
      playedPiece.position,
      destination,
      playedPiece.type,
      playedPiece.team
    );

    // playMove modifies the board thus we
    // need to call setBoard
    setBoard(() => {
      const clonedBoard = board.clone();
      clonedBoard.totalTurns += 1;
      // Playing the move
      playedMoveIsValid = clonedBoard.playMove(
        enPassantMove,
        validMove,
        playedPiece,
        destination
      );

      return clonedBoard;
    });
    return playedMoveIsValid;
  }

  function isEnPassantMove(
    initialPosition: Position,
    desiredPosition: Position,
    type: PieceType,
    team: TeamType
  ) {
    const pawnDirection = team === TeamType.OUR ? 1 : -1;

    if (type === PieceType.PAWN) {
      if (
        (desiredPosition.x - initialPosition.x === -1 ||
          desiredPosition.x - initialPosition.x === 1) &&
        desiredPosition.y - initialPosition.y === pawnDirection
      ) {
        const piece = board.pieces.find(
          (p) =>
            p.position.x === desiredPosition.x &&
            p.position.y === desiredPosition.y - pawnDirection &&
            p.isPawn &&
            (p as Pawn).enPassant
        );
        if (piece) {
          return true;
        }
      }
    }

    return false;
  }

  return (
    <>
      <p style={{ color: "white", fontSize: "24px", textAlign: "center" }}>
        Total turns: {board.totalTurns}
      </p>
      <Chessboard playMove={playMove} pieces={board.pieces} />
    </>
  );
}
