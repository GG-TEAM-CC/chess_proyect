// domain/realTime/cooldownConstants.ts
import { PieceType } from "../../shared/types/Types";

export const recoveryTimes: Record<PieceType, number> = {
  [PieceType.PAWN]: 1000,
  [PieceType.KNIGHT]: 2000,
  [PieceType.BISHOP]: 3000,
  [PieceType.ROOK]: 4000,
  [PieceType.QUEEN]: 5000,
  [PieceType.KING]: 6000,
};
