import dotenv from 'dotenv';
dotenv.config();

// Logs de depuración para variables de entorno de Redis
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PORT:', process.env.REDIS_PORT);
console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '***' : '(vacío)');
console.log('REDIS_DB:', process.env.REDIS_DB);

import express from 'express';
import cors from 'cors';
import Redis from 'ioredis';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de Redis
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
});

// Manejar eventos de conexión
redis.on('connect', () => {
  console.log('✅ Conectado a Redis Cloud');
});

redis.on('error', (error) => {
  console.error('❌ Error de conexión a Redis:', error);
});

redis.on('close', () => {
  console.log('🔌 Conexión a Redis cerrada');
});

// Endpoints para salas de ajedrez
const ROOM_PREFIX = 'sala:';
const ROOM_LIST_KEY = 'salas_activas';

// GET /api/rooms - Obtener todas las salas
app.get('/api/rooms', async (req, res) => {
  try {
    const roomIds = await redis.smembers(ROOM_LIST_KEY);
    const rooms = [];
    
    for (const roomId of roomIds) {
      const roomData = await redis.get(ROOM_PREFIX + roomId);
      if (roomData) {
        rooms.push(JSON.parse(roomData));
      }
    }
    
    res.json(rooms);
  } catch (error) {
    console.error('Error al obtener salas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/rooms/:id - Obtener una sala específica
app.get('/api/rooms/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const roomData = await redis.get(ROOM_PREFIX + roomId);
    
    if (!roomData) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }
    
    res.json(JSON.parse(roomData));
  } catch (error) {
    console.error('Error al obtener sala:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/rooms - Crear una nueva sala vacía (sin jugadores)
app.post('/api/rooms', async (req, res) => {
  try {
    const { configuracion, privada = false, clave_acceso = '', revancha = null } = req.body;
    const now = new Date().toISOString();
    const id = Date.now().toString();
    const room = {
      id,
      estado: 'esperando',
      jugadores: {},
      turno: 'blanco',
      tablero: null,
      movimientos: [],
      resultado: { estado: 'pendiente', ganador: null },
      privada,
      clave_acceso,
      configuracion: configuracion || { tiempo_por_jugador_ms: 300000, modo: 'blitz' },
      revancha: revancha || { ofrecido_por: null, estado: 'pendiente' },
      desconectados: {},
      ultimo_ping: {},
      fecha_creacion: now,
      ultima_actualizacion: now
    };
    const roomKey = ROOM_PREFIX + id;
    await redis.set(roomKey, JSON.stringify(room));
    await redis.sadd(ROOM_LIST_KEY, id);
    console.log(`✅ Sala creada: ${roomKey}`);
    res.status(201).json(room);
  } catch (error) {
    console.error('Error al crear sala:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/rooms/:id/join - Unirse a una sala
app.post('/api/rooms/:id/join', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { jugador, color } = req.body; // jugador: {id, nombre, elo, tiempo_restante_ms}, color: 'blanco' o 'negro'
    const roomKey = ROOM_PREFIX + roomId;
    const roomData = await redis.get(roomKey);
    if (!roomData) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }
    const room = JSON.parse(roomData);
    if (!room.jugadores) room.jugadores = {};
    if (room.jugadores[color]) {
      return res.status(400).json({ error: `El color ${color} ya está ocupado` });
    }
    room.jugadores[color] = jugador;
    room.ultima_actualizacion = new Date().toISOString();
    // Si ambos jugadores están presentes, cambiar estado a 'jugando' y setear tablero inicial
    if (room.jugadores.blanco && room.jugadores.negro) {
      room.estado = 'jugando';
      // Aquí podrías inicializar el tablero si lo deseas
    }
    await redis.set(roomKey, JSON.stringify(room));
    res.json(room);
  } catch (error) {
    console.error('Error al unirse a la sala:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/rooms/:id - Actualizar una sala
app.put('/api/rooms/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const updates = req.body;
    
    const roomData = await redis.get(ROOM_PREFIX + roomId);
    if (!roomData) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }

    const room = JSON.parse(roomData);
    const updatedRoom = {
      ...room,
      ...updates,
      ultima_actualizacion: new Date().toISOString()
    };

    const roomKey = ROOM_PREFIX + roomId;
    await redis.set(roomKey, JSON.stringify(updatedRoom));
    
    console.log(`✅ Sala actualizada: ${roomId}`);
    res.json(updatedRoom);
  } catch (error) {
    console.error('Error al actualizar sala:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/rooms/:id - Eliminar una sala
app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const roomKey = ROOM_PREFIX + roomId;
    
    const deleted = await redis.del(roomKey);
    
    if (deleted > 0) {
      await redis.srem(ROOM_LIST_KEY, roomId);
      console.log(`✅ Sala eliminada: ${roomId}`);
      res.json({ message: 'Sala eliminada correctamente' });
    } else {
      res.status(404).json({ error: 'Sala no encontrada' });
    }
  } catch (error) {
    console.error('Error al eliminar sala:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente', timestamp: new Date().toISOString() });
});

// ENDPOINTS DE CHAT POR POLLING
// Obtener mensajes de chat de una sala
app.get('/api/rooms/:id/messages', async (req, res) => {
  try {
    const roomId = req.params.id;
    const chatKey = `chat:sala:${roomId}`;
    // Obtiene los últimos 50 mensajes
    const messages = await redis.lrange(chatKey, -50, -1);
    // Devuelve como array de objetos
    res.json(messages.map(m => JSON.parse(m)));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes de chat' });
  }
});

// Enviar mensaje de chat a una sala
app.post('/api/rooms/:id/messages', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { nombre, color, mensaje } = req.body;
    if (!nombre || !color || !mensaje) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    const chatKey = `chat:sala:${roomId}`;
    const msgObj = {
      nombre,
      color,
      mensaje,
      timestamp: Date.now()
    };
    await redis.rpush(chatKey, JSON.stringify(msgObj));
    // Opcional: limitar el tamaño de la lista
    await redis.ltrim(chatKey, -50, -1);
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar mensaje de chat' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Redis configurado con host: ${process.env.REDIS_HOST || 'localhost'}`);
}); 