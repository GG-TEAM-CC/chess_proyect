// src/components/Chessboard/RealTimeChessboard.tsx
import { useEffect, useRef, useState } from "react";
import Tile from "../Tile/Tile";
import {
  VERTICAL_AXIS,
  HORIZONTAL_AXIS,
  GRID_SIZE,
} from "../../../shared/types/Constants";
import { Piece, Position } from "../../../domain/models";
import { PieceType } from "../../../shared/types/Types";

interface Props {
  playMove: (piece: Piece, position: Position) => boolean;
  pieces: Piece[];
}

const recoveryTimes: Record<PieceType, number> = {
  pawn: 1000,
  knight: 2000,
  bishop: 3000,
  rook: 4000,
  queen: 5000,
  king: 6000,
};

export default function RealTimeChessboard({ playMove, pieces }: Props) {
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
  const [cooldownMap, setCooldownMap] = useState<Map<string, number>>(new Map());
  const chessboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCooldownMap((prevMap) => {
        const newMap = new Map(prevMap);
        const now = Date.now();
        for (const [key, expiry] of newMap.entries()) {
          if (expiry <= now) {
            newMap.delete(key);
          }
        }
        return newMap;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  function getKey(piece: Piece) {
    return `${piece.position.x},${piece.position.y}`;
  }

  function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;
    if (element.classList.contains("chess-piece") && chessboard) {
      const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
      const grabY = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / GRID_SIZE));
      const piece = pieces.find((p) => p.samePosition(new Position(grabX, grabY)));

      if (!piece) return;

      const key = getKey(piece);
      if (cooldownMap.has(key)) {
        console.log("Pieza en cooldown");
        return;
      }

      setGrabPosition(new Position(grabX, grabY));

      const x = e.clientX - GRID_SIZE / 2;
      const y = e.clientY - GRID_SIZE / 2;
      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      setActivePiece(element);
    }
  }

  function movePiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      const minX = chessboard.offsetLeft - 25;
      const minY = chessboard.offsetTop - 25;
      const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
      const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;
      const x = e.clientX - 50;
      const y = e.clientY - 50;
      activePiece.style.position = "absolute";
      activePiece.style.left = `${Math.max(minX, Math.min(x, maxX))}px`;
      activePiece.style.top = `${Math.max(minY, Math.min(y, maxY))}px`;
    }
  }

  function dropPiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
      const y = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / GRID_SIZE));

      const currentPiece = pieces.find((p) => p.samePosition(grabPosition));
      if (currentPiece) {
        const success = playMove(currentPiece.clone(), new Position(x, y));
        if (!success) {
          activePiece.style.position = "relative";
          activePiece.style.removeProperty("top");
          activePiece.style.removeProperty("left");
        } else {
          const key = `${x},${y}`;
          setCooldownMap((prev) => new Map(prev).set(key, Date.now() + recoveryTimes[currentPiece.type]));
        }
      }
      setActivePiece(null);
    }
  }

  const board = [];

  for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      const number = j + i + 2;
      const position = new Position(i, j);
      const piece = pieces.find((p) => p.samePosition(position));
      const image = piece ? piece.image : undefined;
      const isCooling = piece ? cooldownMap.has(getKey(piece)) : false;

      board.push(
        <Tile
          key={`${j},${i}`}
          image={image}
          number={number}
          highlight={false}
        overlay={isCooling ? "cooldown" : undefined}
        />
      );
    }
  }

  return (
    <div
      onMouseMove={(e) => movePiece(e)}
      onMouseDown={(e) => grabPiece(e)}
      onMouseUp={(e) => dropPiece(e)}
      id="chessboard"
      ref={chessboardRef}
      className="relative"
    >
      {board}
    </div>
  );
}
