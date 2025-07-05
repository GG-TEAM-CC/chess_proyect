import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChessRoom } from '../../hooks/useChessRoom';
import Chessboard from '../components/Chessboard/Chessboard';
import { initialBoard } from '../../shared/types/Constants';

const ChessRoomPage: React.FC = () => {
  const { roomId = '' } = useParams();
  const [playerName, setPlayerName] = useState('');
  const [playerElo, setPlayerElo] = useState(1500);
  const [joinedColor, setJoinedColor] = useState<string | null>(null);
  const {
    room,
    loading,
    error,
    isConnected,
    addPlayer,
    addMove,
    refreshRoom
  } = useChessRoom(roomId);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Al cargar la sala, revisa si el usuario ya está registrado en localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`chessroom_${roomId}`);
    if (saved) {
      const { color, name } = JSON.parse(saved);
      setJoinedColor(color);
      setPlayerName(name);
    }
  }, [roomId]);

  // Si el usuario tiene un registro local pero NO es jugador real, limpia el registro
  useEffect(() => {
    if (
      (joinedColor === 'blanco' || joinedColor === 'negro') &&
      room &&
      (!room.jugadores[joinedColor] || room.jugadores[joinedColor]?.nombre !== playerName)
    ) {
      localStorage.removeItem(`chessroom_${roomId}`);
      setJoinedColor(null);
      setPlayerName('');
    }
  }, [room, joinedColor, playerName, roomId]);

  // Handler para unirse a la sala
  const handleJoin = async (color: 'blanco' | 'negro') => {
    if (!roomId || !playerName) {
      alert('Ingresa un nombre');
      return;
    }
    try {
      await addPlayer(color, {
        id: `user:${Date.now()}`,
        nombre: playerName,
        elo: playerElo,
        tiempo_restante_ms: 300000
      });
      localStorage.setItem(`chessroom_${roomId}`,
        JSON.stringify({ color, name: playerName })
      );
      setJoinedColor(color);
      refreshRoom();
    } catch (err) {
      alert(`Error al unirse: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  // Determina si el usuario es jugador o espectador
  const isPlayer =
    (joinedColor === 'blanco' || joinedColor === 'negro') &&
    room &&
    room.jugadores[joinedColor]?.nombre === playerName;
  const isFull = room && room.jugadores.blanco && room.jugadores.negro;

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

  // Componente de chat para la sala
  const ChatSala: React.FC<{
    roomId: string;
    playerName: string;
    joinedColor: string | null;
    isPlayer: boolean;
  }> = ({ roomId, playerName, joinedColor, isPlayer }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Polling de mensajes
    useEffect(() => {
      const fetchMessages = async () => {
        try {
          const res = await fetch(`/api/rooms/${roomId}/messages`);
          const data = await res.json();
          setMessages(data);
        } catch {}
      };
      fetchMessages();
      pollingRef.current = setInterval(fetchMessages, 2000);
      return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, [roomId]);

    // Scroll automático solo en el contenedor de mensajes
    useEffect(() => {
      const chatDiv = messagesContainerRef.current;
      if (!chatDiv) return;
      const isAtBottom = chatDiv.scrollHeight - chatDiv.scrollTop - chatDiv.clientHeight < 50;
      if (isAtBottom) {
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }
    }, [messages]);

    // Enviar mensaje
    const sendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || !playerName || !joinedColor) return;
      await fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: playerName, color: joinedColor, mensaje: input.trim() })
      });
      setInput('');
    };

    return (
      <div className="w-full md:w-80 flex flex-col h-[500px] bg-white rounded-xl shadow-lg border ml-0 md:ml-6">
        <div className="p-3 border-b font-bold text-lg bg-gray-100 rounded-t-xl text-black">Chat de la Sala</div>
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className="flex flex-col">
              <span className={`font-semibold text-sm text-black`}>{msg.nombre} <span className="text-xs text-gray-500">({msg.color})</span></span>
              <span className="text-gray-800 text-base">{msg.mensaje}</span>
              <span className="text-xs text-gray-400 self-end">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
        {isPlayer && (
          <form onSubmit={sendMessage} className="p-3 border-t flex gap-2 bg-gray-100 rounded-b-xl">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-3 py-2 border rounded bg-white text-black"
              maxLength={200}
            />
            <button type="submit" className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Enviar</button>
          </form>
        )}
        {!isPlayer && (
          <div className="p-3 border-t text-center text-gray-400 text-sm bg-gray-100 rounded-b-xl">Solo los jugadores pueden enviar mensajes.</div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sala de Ajedrez: {roomId}</h1>
      {/* Estado de conexión */}
      <div className="mb-6 p-4 rounded-lg border">
        <h2 className="text-xl font-semibold mb-2">Estado de Conexión</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isConnected ? 'Conectado a Redis' : 'Desconectado de Redis'}</span>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
            Error: {error}
          </div>
        )}
      </div>

      {/* Mostrar jugadores y colores */}
      {room && (
        <div className="mb-6 p-4 rounded-lg border bg-black text-white">
          <h2 className="text-xl font-semibold mb-2 text-white">Jugadores</h2>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Tarjeta Blanco */}
            <div className="flex-1 bg-white text-black rounded-xl shadow-lg p-4 flex flex-col items-center border-4 border-purple-600">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded bg-purple-600 text-white font-bold text-lg shadow">
                  <span className="w-3 h-3 rounded-full bg-white border border-purple-600 mr-2"></span>
                  Blanco
                </span>
              </div>
              <div className="text-center">
                <span className={room.jugadores.blanco?.nombre ? "text-xl font-semibold" : "italic text-gray-400"}>
                  {room.jugadores.blanco?.nombre || '(vacante)'}
                </span>
                {room.jugadores.blanco?.elo && (
                  <div className="text-sm text-gray-600">ELO: {room.jugadores.blanco.elo}</div>
                )}
              </div>
            </div>
            {/* Tarjeta Negro */}
            <div className="flex-1 bg-gray-900 text-white rounded-xl shadow-lg p-4 flex flex-col items-center border-4 border-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded bg-black text-white font-bold text-lg shadow">
                  <span className="w-3 h-3 rounded-full bg-black border border-white mr-2"></span>
                  Negro
                </span>
              </div>
              <div className="text-center">
                <span className={room.jugadores.negro?.nombre ? "text-xl font-semibold" : "italic text-gray-400"}>
                  {room.jugadores.negro?.nombre || '(vacante)'}
                </span>
                {room.jugadores.negro?.elo && (
                  <div className="text-sm text-gray-300">ELO: {room.jugadores.negro.elo}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario para unirse solo si no es jugador y hay lugar */}
      {!isPlayer && room && (!room.jugadores.blanco || !room.jugadores.negro) && (
        <div className="mb-6 p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Unirse a la Sala</h2>
          <input
            type="text"
            placeholder="Tu nombre"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            className="mb-2 px-3 py-2 border rounded w-full"
          />
          <input
            type="number"
            placeholder="ELO"
            value={playerElo}
            onChange={e => setPlayerElo(parseInt(e.target.value) || 1500)}
            className="mb-2 px-3 py-2 border rounded w-full"
          />
          {/* Lógica para mostrar solo el color disponible */}
          {room.jugadores.blanco && !room.jugadores.negro ? (
            <>
              <div className="mb-2 text-gray-700">Solo puedes unirte como <span className="font-bold text-gray-800">Negro</span>.</div>
              <button
                onClick={() => handleJoin('negro')}
                className="px-4 py-2 rounded text-white bg-gray-800 hover:bg-gray-900"
              >
                Unirse como Negro
              </button>
            </>
          ) : !room.jugadores.blanco && room.jugadores.negro ? (
            <>
              <div className="mb-2 text-gray-700">Solo puedes unirte como <span className="font-bold text-purple-700">Blanco</span>.</div>
              <button
                onClick={() => handleJoin('blanco')}
                className="px-4 py-2 rounded text-white bg-purple-500 hover:bg-purple-600"
              >
                Unirse como Blanco
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleJoin('blanco')}
                disabled={!!room.jugadores.blanco}
                className={`px-4 py-2 rounded text-white ${room.jugadores.blanco ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'}`}
              >
                Unirse como Blanco
              </button>
              <button
                onClick={() => handleJoin('negro')}
                disabled={!!room.jugadores.negro}
                className={`px-4 py-2 rounded text-white ${room.jugadores.negro ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900'}`}
              >
                Unirse como Negro
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mensaje si la sala está llena y no es jugador */}
      {!isPlayer && isFull && (
        <div className="mb-6 p-4 rounded-lg border bg-yellow-100 text-yellow-800">
          <strong>La sala ya tiene dos jugadores. Puedes observar la partida.</strong>
        </div>
      )}

      {/* Layout principal: tablero a la izquierda, chat a la derecha */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          {/* Mostrar tablero de ajedrez */}
          <div className="mb-6 p-4 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Tablero de Ajedrez</h2>
            <Chessboard
              playMove={() => false}
              pieces={initialBoard.pieces}
            />
          </div>
          {/* Mostrar sala actual */}
          {room && (
            <div className="p-4 rounded-lg border bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">Sala Actual</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Información General</h3>
                  <p><strong>ID:</strong> {room.id}</p>
                  <p><strong>Estado:</strong> {room.estado}</p>
                  <p><strong>Turno:</strong> {room.turno}</p>
                  <p><strong>Privada:</strong> {room.privada ? 'Sí' : 'No'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Movimientos ({room.movimientos.length})</h3>
                  <div className="max-h-32 overflow-y-auto">
                    {room.movimientos.map((move, index) => (
                      <div key={index} className="text-sm">
                        {index + 1}. {move.jugador}: {move.movimiento}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Chat a la derecha */}
        <ChatSala roomId={roomId} playerName={playerName} joinedColor={joinedColor} isPlayer={!!isPlayer} />
      </div>
    </div>
  );
};

export default ChessRoomPage; 