import type { ChessRoom, ChessPlayer, ChessMove } from '../shared/types/ChessRoom';

const API_BASE_URL = 'http://localhost:3001/api';

export class ChessRoomService {
  /**
   * Crear una nueva sala vacía
   */
  static async createRoom(config: { configuracion?: any, privada?: boolean, clave_acceso?: string, revancha?: any }): Promise<ChessRoom> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const room = await response.json();
      console.log(`✅ Sala creada: ${room.id}`);
      return room;
    } catch (error) {
      console.error('❌ Error al crear sala:', error);
      throw error;
    }
  }

  /**
   * Obtener una sala por ID
   */
  static async getRoom(roomId: string): Promise<ChessRoom | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
      
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error al obtener sala:', error);
      throw error;
    }
  }

  /**
   * Actualizar una sala existente
   */
  static async updateRoom(roomId: string, updates: Partial<ChessRoom>): Promise<ChessRoom | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const updatedRoom = await response.json();
      console.log(`✅ Sala actualizada: ${roomId}`);
      return updatedRoom;
    } catch (error) {
      console.error('❌ Error al actualizar sala:', error);
      throw error;
    }
  }

  /**
   * Eliminar una sala
   */
  static async deleteRoom(roomId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        return false;
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      console.log(`✅ Sala eliminada: ${roomId}`);
      return true;
    } catch (error) {
      console.error('❌ Error al eliminar sala:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las salas activas
   */
  static async getAllRooms(): Promise<ChessRoom[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error al obtener salas:', error);
      throw error;
    }
  }

  /**
   * Unirse a una sala
   */
  static async joinRoom(roomId: string, color: 'blanco' | 'negro', jugador: ChessPlayer): Promise<ChessRoom | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jugador, color }),
      });
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Error al unirse a la sala:', error);
      throw error;
    }
  }

  /**
   * Registrar un movimiento en la sala
   */
  static async addMove(roomId: string, move: ChessMove): Promise<ChessRoom | null> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) {
        return null;
      }

      room.movimientos.push(move);
      room.turno = room.turno === 'blanco' ? 'negro' : 'blanco';
      room.ultima_actualizacion = new Date().toISOString();

      return await this.updateRoom(roomId, room);
    } catch (error) {
      console.error('❌ Error al agregar movimiento:', error);
      throw error;
    }
  }

  /**
   * Actualizar el estado de desconexión de un jugador
   */
  static async updateDisconnectionStatus(roomId: string, color: 'blanco' | 'negro', disconnected: boolean): Promise<ChessRoom | null> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) {
        return null;
      }

      room.desconectados[color] = disconnected;
      room.ultimo_ping[color] = new Date().toISOString();
      room.ultima_actualizacion = new Date().toISOString();

      return await this.updateRoom(roomId, room);
    } catch (error) {
      console.error('❌ Error al actualizar estado de desconexión:', error);
      throw error;
    }
  }

  /**
   * Ofrecer revancha
   */
  static async offerRematch(roomId: string, offeredBy: 'blanco' | 'negro'): Promise<ChessRoom | null> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) {
        return null;
      }

      room.revancha = {
        ofrecido_por: offeredBy,
        estado: 'pendiente'
      };
      room.ultima_actualizacion = new Date().toISOString();

      return await this.updateRoom(roomId, room);
    } catch (error) {
      console.error('❌ Error al ofrecer revancha:', error);
      throw error;
    }
  }

  /**
   * Responder a la oferta de revancha
   */
  static async respondToRematch(roomId: string, accepted: boolean): Promise<ChessRoom | null> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) {
        return null;
      }

      room.revancha.estado = accepted ? 'aceptado' : 'rechazado';
      room.ultima_actualizacion = new Date().toISOString();

      return await this.updateRoom(roomId, room);
    } catch (error) {
      console.error('❌ Error al responder a revancha:', error);
      throw error;
    }
  }

  /**
   * Finalizar una partida
   */
  static async endGame(roomId: string, winner: 'blanco' | 'negro' | null, result: 'victoria' | 'tablas'): Promise<ChessRoom | null> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) {
        return null;
      }

      room.estado = 'finalizado';
      room.resultado = {
        estado: result,
        ganador: winner
      };
      room.ultima_actualizacion = new Date().toISOString();

      return await this.updateRoom(roomId, room);
    } catch (error) {
      console.error('❌ Error al finalizar partida:', error);
      throw error;
    }
  }
} 