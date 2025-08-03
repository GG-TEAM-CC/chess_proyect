import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChessRoom } from '../../hooks/useChessRoom';

const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom, loading } = useChessRoom();
  const [joinRoomId, setJoinRoomId] = useState('');

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
      navigate(`/sala/${createdRoom.id}`);
    } catch (err) {
      alert('Error al crear sala');
    }
  };

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) {
      alert('Ingresa un ID de sala');
      return;
    }
    navigate(`/sala/${joinRoomId.trim()}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Ajedrez en Línea</h1>
      <div className="mb-8 flex flex-col md:flex-row gap-8">
        {/* Crear sala */}
        <div className="flex-1 p-6 rounded-lg border flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Crear Nueva Sala</h2>
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Sala de Ajedrez'}
          </button>
        </div>
        {/* Unirse a sala */}
        <div className="flex-1 p-6 rounded-lg border flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Unirse a una Sala</h2>
          <input
            type="text"
            placeholder="ID de la sala"
            value={joinRoomId}
            onChange={e => setJoinRoomId(e.target.value)}
            className="mb-4 px-3 py-2 border rounded w-full"
          />
          <button
            onClick={handleJoinRoom}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Unirse
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPage; 