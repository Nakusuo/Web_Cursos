const redis = require('redis');
const logger = require('./logger');

let redisClient = null;
let isRedisConnected = false;

// Inicializar Redis (opcional)
const initRedis = async () => {
    try {
        if (!process.env.REDIS_URL) {
            logger.info('Redis URL no configurada. Caché deshabilitado.');
            return null;
        }

        redisClient = redis.createClient({
            url: process.env.REDIS_URL
        });

        redisClient.on('error', (err) => {
            logger.error('Redis Client Error:', err);
            isRedisConnected = false;
        });

        redisClient.on('connect', () => {
            logger.info('✅ Redis conectado exitosamente');
            isRedisConnected = true;
        });

        await redisClient.connect();
        return redisClient;
    } catch (error) {
        logger.warn('Redis no disponible. La aplicación funcionará sin caché.', error);
        return null;
    }
};

// Obtener valor del caché
const getCache = async (key) => {
    if (!isRedisConnected || !redisClient) return null;
    
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        logger.error(`Error getting cache for key ${key}:`, error);
        return null;
    }
};

// Guardar en caché
const setCache = async (key, value, ttl = 3600) => {
    if (!isRedisConnected || !redisClient) return false;
    
    try {
        await redisClient.setEx(key, ttl, JSON.stringify(value));
        return true;
    } catch (error) {
        logger.error(`Error setting cache for key ${key}:`, error);
        return false;
    }
};

// Eliminar del caché
const delCache = async (key) => {
    if (!isRedisConnected || !redisClient) return false;
    
    try {
        await redisClient.del(key);
        return true;
    } catch (error) {
        logger.error(`Error deleting cache for key ${key}:`, error);
        return false;
    }
};

// Eliminar múltiples keys por patrón
const delCachePattern = async (pattern) => {
    if (!isRedisConnected || !redisClient) return false;
    
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
        return true;
    } catch (error) {
        logger.error(`Error deleting cache pattern ${pattern}:`, error);
        return false;
    }
};

// Middleware de caché para rutas
const cacheMiddleware = (duration = 300) => {
    return async (req, res, next) => {
        if (!isRedisConnected) return next();
        
        // Solo cachear peticiones GET
        if (req.method !== 'GET') return next();
        
        const key = `cache:${req.originalUrl || req.url}`;
        
        try {
            const cachedData = await getCache(key);
            
            if (cachedData) {
                logger.debug(`Cache HIT for ${key}`);
                return res.json(cachedData);
            }
            
            // Interceptar res.json para guardar en caché
            const originalJson = res.json.bind(res);
            res.json = (data) => {
                setCache(key, data, duration);
                logger.debug(`Cache SET for ${key}`);
                return originalJson(data);
            };
            
            next();
        } catch (error) {
            logger.error('Cache middleware error:', error);
            next();
        }
    };
};

// Cerrar conexión Redis
const closeRedis = async () => {
    if (redisClient && isRedisConnected) {
        await redisClient.quit();
        logger.info('Redis desconectado');
    }
};

module.exports = {
    initRedis,
    getCache,
    setCache,
    delCache,
    delCachePattern,
    cacheMiddleware,
    closeRedis,
    isConnected: () => isRedisConnected
};
