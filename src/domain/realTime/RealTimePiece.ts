// domain/realTime/RealTimePiece.ts
import { Piece, Position } from "../models";
import { PieceType } from "../../shared/types/Types";

export class RealTimePiece {
  base: Piece;
  cooldownUntil: number;

  constructor(piece: Piece) {
    this.base = piece;
    this.cooldownUntil = 0;
  }

  get type() {
    return this.base.type;
  }

  get team() {
    return this.base.team;
  }

  get image() {
    return this.base.image;
  }

  get position() {
    return this.base.position;
  }

  set position(pos) {
    this.base.position = pos;
  }

  get possibleMoves() {
    return this.base.possibleMoves;
  }

  samePosition(pos: Position) {
    return this.base.position.samePosition(pos);
  }

  isOnCooldown() {
    return Date.now() < this.cooldownUntil;
  }

  setCooldown(durationMs: number) {
    this.cooldownUntil = Date.now() + durationMs;
  }

  clone() {
    const cloned = new RealTimePiece(this.base.clone());
    cloned.cooldownUntil = this.cooldownUntil;
    return cloned;
  }
}
