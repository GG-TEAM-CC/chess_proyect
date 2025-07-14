// domain/realTime/RealTimeBoard.ts
import { Board } from "../models/Board";
import { RealTimePiece } from "./RealTimePiece";
import { Piece, Position } from "../models";
import { recoveryTimes } from "./cooldownConstants";

export class RealTimeBoard {
  pieces: RealTimePiece[];

  constructor(baseBoard: Board) {
    this.pieces = baseBoard.pieces.map(p => new RealTimePiece(p));
  }

  playMove(piece: RealTimePiece, destination: Position): boolean {
    if (piece.isOnCooldown()) return false;

    const moveIsValid = piece.possibleMoves?.some(m => m.samePosition(destination));
    if (!moveIsValid) return false;

    // Check for capture
    const target = this.pieces.find(p => p.position.samePosition(destination));
    if (target) {
      this.pieces = this.pieces.filter(p => !p.position.samePosition(destination));
    }

    // Move piece
    piece.position = destination;

    // Apply cooldown
    piece.setCooldown(recoveryTimes[piece.type]);

    return true;
  }

  clone(): RealTimeBoard {
    const clone = Object.create(RealTimeBoard.prototype);
    clone.pieces = this.pieces.map(p => p.clone());
    return clone;
  }
}
