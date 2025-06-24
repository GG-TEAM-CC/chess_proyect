import { PieceType, TeamType } from "../../shared/types/Types";
import { Pawn } from "../models/Pawn";
import { Piece } from "../models/Piece";
import { Position } from "../models/Position";

export class Board {
  pieces: Piece[];
  totalTurns: number;
  winningTeam?: TeamType;

  constructor(pieces: Piece[], totalTurns: number) {
    this.pieces = pieces;
    this.totalTurns = totalTurns;
  }

  get currentTeam(): TeamType {
    return this.totalTurns % 2 === 0 ? TeamType.OPPONENT : TeamType.OUR;
  }

  playMove(
    enPassantMove: boolean,
    validMove: boolean,
    playedPiece: Piece,
    destination: Position
  ): boolean {
    const pawnDirection = playedPiece.team === TeamType.OUR ? 1 : -1;
    const destinationPiece = this.pieces.find((p) =>
      p.samePosition(destination)
    );

    if (
      playedPiece.isKing &&
      destinationPiece?.isRook &&
      destinationPiece.team === playedPiece.team
    ) {
      const direction =
        destinationPiece.position.x - playedPiece.position.x > 0 ? 1 : -1;
      const newKingXPosition = playedPiece.position.x + direction * 2;
      this.pieces = this.pieces.map((p) => {
        if (p.samePiecePosition(playedPiece)) {
          p.position.x = newKingXPosition;
        } else if (p.samePiecePosition(destinationPiece)) {
          p.position.x = newKingXPosition - direction;
        }

        return p;
      });

      return true;
    }

    if (enPassantMove) {
      this.pieces = this.pieces.reduce((results, piece) => {
        if (piece.samePiecePosition(playedPiece)) {
          if (piece.isPawn) (piece as Pawn).enPassant = false;
          piece.position.x = destination.x;
          piece.position.y = destination.y;
          piece.hasMoved = true;
          results.push(piece);
        } else if (
          !piece.samePosition(
            new Position(destination.x, destination.y - pawnDirection)
          )
        ) {
          if (piece.isPawn) {
            (piece as Pawn).enPassant = false;
          }
          results.push(piece);
        }

        return results;
      }, [] as Piece[]);

    } else if (validMove) {
      //UPDATES THE PIECE POSITION
      //AND IF A PIECE IS ATTACKED, REMOVES IT
      this.pieces = this.pieces.reduce((results, piece) => {
        // Piece that we are currently moving
        if (piece.samePiecePosition(playedPiece)) {
          //SPECIAL MOVE
          if (piece.isPawn)
            (piece as Pawn).enPassant =
              Math.abs(playedPiece.position.y - destination.y) === 2 &&
              piece.type === PieceType.PAWN;
          piece.position.x = destination.x;
          piece.position.y = destination.y;
          piece.hasMoved = true;
          results.push(piece);
        } else if (!piece.samePosition(destination)) {
          if (piece.isPawn) {
            (piece as Pawn).enPassant = false;
          }
          results.push(piece);
        }

        // The piece at the destination location
        // Won't be pushed in the results
        return results;
      }, [] as Piece[]);

    } else {
      return false;
    }

    return true;
  }

  clone(): Board {
    return new Board(
      this.pieces.map((p) => p.clone()),
      this.totalTurns
    );
  }
}
