export interface ChessPlayer {
  id: string;
  nombre: string;
  elo: number;
  tiempo_restante_ms: number;
}

export interface ChessPlayers {
  blanco: ChessPlayer;
  negro: ChessPlayer;
}

export interface ChessPiece {
  pieza: 'torre' | 'caballo' | 'alfil' | 'reina' | 'rey' | 'peon';
  color: 'blanco' | 'negro';
}

export interface ChessBoard {
  posiciones: Record<string, ChessPiece>;
}

export interface ChessMove {
  jugador: 'blanco' | 'negro';
  movimiento: string;
  timestamp: number;
}

export interface ChessResult {
  estado: 'pendiente' | 'victoria' | 'tablas';
  ganador: 'blanco' | 'negro' | null;
}

export interface ChessConfig {
  tiempo_por_jugador_ms: number;
  modo: 'bullet' | 'blitz' | 'rapid' | 'classical';
}

export interface ChessRematch {
  ofrecido_por: 'blanco' | 'negro';
  estado: 'pendiente' | 'aceptado' | 'rechazado';
}

export interface DisconnectedPlayers {
  blanco: boolean;
  negro: boolean;
}

export interface LastPing {
  blanco: string;
  negro: string;
}

export interface ChessRoom {
  id: string;
  estado: 'esperando' | 'jugando' | 'finalizado';
  jugadores: ChessPlayers;
  turno: 'blanco' | 'negro';
  tablero: ChessBoard;
  movimientos: ChessMove[];
  resultado: ChessResult;
  privada: boolean;
  clave_acceso: string;
  configuracion: ChessConfig;
  revancha: ChessRematch;
  desconectados: DisconnectedPlayers;
  ultimo_ping: LastPing;
  fecha_creacion: string;
  ultima_actualizacion: string;
} 