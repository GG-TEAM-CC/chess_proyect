import React, { useState } from 'react';
import { useChessRoom } from '../../../hooks/useChessRoom';
import type { ChessRoom } from '../../../shared/types/ChessRoom';
import Chessboard from '../Chessboard/Chessboard';
import { initialBoard } from '../../../shared/types/Constants';

export const RedisTest: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerElo, setPlayerElo] = useState<number>(1500);
  
  const { 
    room, 
    loading, 
    error, 
    isConnected, 
    createRoom, 
    addPlayer, 
    addMove,
    refreshRoom 
  } = useChessRoom(roomId);

  console.log('Valor de roomId al renderizar:', roomId);

  const handleCreateRoom = async () => {
    try {
      const config = {
        configuracion: {
          tiempo_por_jugador_ms: 300000,
          modo: 'blitz'
        },
        privada: false,
        clave_acceso: ''
      };
      const createdRoom = await createRoom(config);
      console.log('Nuevo roomId asignado:', createdRoom.id);
      setRoomId(createdRoom.id);
      alert(`Sala creada: ${createdRoom.id}`);
    } catch (err) {
      alert(`Error al crear sala: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleAddMove = async () => {
    if (!roomId) {
      alert('Primero crea una sala');
      return;
    }

    try {
      await addMove({
        jugador: 'blanco',
        movimiento: 'e2e4',
        timestamp: Date.now()
      });
      alert('Movimiento agregado');
    } catch (err) {
      alert(`Error al agregar movimiento: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleAddPlayer = async (color: 'blanco' | 'negro') => {
    if (!roomId || !playerName) {
      alert('Ingresa un ID de sala y nombre de jugador');
      return;
    }
    try {
      await addPlayer(color, {
        id: `user:${Date.now()}`,
        nombre: playerName,
        elo: playerElo,
        tiempo_restante_ms: 300000
      });
      alert(`Jugador ${color} agregado`);
    } catch (err) {
      alert(`Error al unirse a la sala: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Prueba de Conexión Redis Cloud</h1>
      <p>Este componente es solo de ejemplo. Usa la navegación para crear y gestionar salas.</p>
    </div>
  );
}; 