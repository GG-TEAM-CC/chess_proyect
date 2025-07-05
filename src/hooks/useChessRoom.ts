import { useState, useEffect, useCallback } from 'react';
import { ChessRoomService } from '../services/ChessRoomService';
import type { ChessRoom, ChessPlayer, ChessMove } from '../shared/types/ChessRoom';

export const useChessRoom = (roomId?: string) => {
  const [room, setRoom] = useState<ChessRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Cargar sala inicial
  useEffect(() => {
    if (roomId) {
      loadRoom(roomId);
    }
  }, [roomId]);

  const loadRoom = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const roomData = await ChessRoomService.getRoom(id);
      setRoom(roomData);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la sala');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRoom = useCallback(async (config: { configuracion?: any, privada?: boolean, clave_acceso?: string, revancha?: any }) => {
    setLoading(true);
    setError(null);
    
    try {
      const newRoom = await ChessRoomService.createRoom(config);
      setRoom(newRoom);
      setIsConnected(true);
      return newRoom;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la sala');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRoom = useCallback(async (updates: Partial<ChessRoom>) => {
    if (!roomId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedRoom = await ChessRoomService.updateRoom(roomId, updates);
      setRoom(updatedRoom);
      return updatedRoom;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la sala');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const addPlayer = useCallback(async (color: 'blanco' | 'negro', player: ChessPlayer) => {
    if (!roomId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedRoom = await ChessRoomService.joinRoom(roomId, color, player);
      setRoom(updatedRoom);
      return updatedRoom;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al unirse a la sala');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const addMove = useCallback(async (move: ChessMove) => {
    if (!roomId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedRoom = await ChessRoomService.addMove(roomId, move);
      setRoom(updatedRoom);
      return updatedRoom;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar movimiento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const updateDisconnectionStatus = useCallback(async (color: 'blanco' | 'negro', disconnected: boolean) => {
    if (!roomId) return null;
    
    try {
      const updatedRoom = await ChessRoomService.updateDisconnectionStatus(roomId, color, disconnected);
      setRoom(updatedRoom);
      return updatedRoom;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado de desconexión');
      throw err;
    }
  }, [roomId]);

  const offerRematch = useCallback(async (offeredBy: 'blanco' | 'negro') => {
    if (!roomId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedRoom = await ChessRoomService.offerRematch(roomId, offeredBy);
      setRoom(updatedRoom);
      return updatedRoom;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al ofrecer revancha');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const respondToRematch = useCallback(async (accepted: boolean) => {
    if (!roomId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedRoom = await ChessRoomService.respondToRematch(roomId, accepted);
      setRoom(updatedRoom);
      return updatedRoom;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al responder a revancha');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const endGame = useCallback(async (winner: 'blanco' | 'negro' | null, result: 'victoria' | 'tablas') => {
    if (!roomId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedRoom = await ChessRoomService.endGame(roomId, winner, result);
      setRoom(updatedRoom);
      return updatedRoom;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al finalizar partida');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const deleteRoom = useCallback(async () => {
    if (!roomId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const deleted = await ChessRoomService.deleteRoom(roomId);
      if (deleted) {
        setRoom(null);
      }
      return deleted;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar sala');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const refreshRoom = useCallback(() => {
    if (roomId) {
      loadRoom(roomId);
    }
  }, [roomId, loadRoom]);

  return {
    room,
    loading,
    error,
    isConnected,
    createRoom,
    updateRoom,
    addPlayer,
    addMove,
    updateDisconnectionStatus,
    offerRematch,
    respondToRematch,
    endGame,
    deleteRoom,
    refreshRoom
  };
}; 