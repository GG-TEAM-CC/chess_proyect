// Configuración para Redis Cloud REST API
const REDIS_CONFIG = {
  host: import.meta.env.VITE_REDIS_HOST || 'localhost',
  port: import.meta.env.VITE_REDIS_PORT || '6379',
  password: import.meta.env.VITE_REDIS_PASSWORD,
  db: import.meta.env.VITE_REDIS_DB || '0',
};

// Función para hacer peticiones a Redis usando fetch
export const redisRequest = async (method: string, key: string, value?: any) => {
  const url = `https://${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`;
  
  try {
    const response = await fetch(`${url}/${key}`, {
      method: method.toUpperCase(),
      headers: {
        'Authorization': `Bearer ${REDIS_CONFIG.password}`,
        'Content-Type': 'application/json',
      },
      body: value ? JSON.stringify(value) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`Redis request failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error en petición a Redis:', error);
    throw error;
  }
};

// Simulación de conexión para compatibilidad
export const redis = {
  set: async (key: string, value: string) => {
    return redisRequest('PUT', key, value);
  },
  get: async (key: string) => {
    return redisRequest('GET', key);
  },
  del: async (key: string) => {
    return redisRequest('DELETE', key);
  },
  sadd: async (setKey: string, member: string) => {
    return redisRequest('POST', `${setKey}/members`, member);
  },
  srem: async (setKey: string, member: string) => {
    return redisRequest('DELETE', `${setKey}/members/${member}`);
  },
  smembers: async (setKey: string) => {
    return redisRequest('GET', `${setKey}/members`);
  },
};

console.log('🔧 Usando Redis REST API'); 