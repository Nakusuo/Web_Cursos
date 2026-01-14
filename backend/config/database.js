
const mongoose = require('mongoose');

/**
 * Configuración optimizada de MongoDB para tráfico regular
 * Academia Pesquera - Database Connection
 */

const connectDB = async () => {
    try {
        const options = {
            
            poolSize: 10,                    
            
            
            socketTimeoutMS: 45000,          
            serverSelectionTimeoutMS: 5000,  
            connectTimeoutMS: 10000,         
            
            
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,            
            useFindAndModify: false,         
            
            
            retryWrites: true,               
            retryReads: true,                
            
            
            family: 4,                       
            
            
            readPreference: 'secondaryPreferred',  
            w: 'majority',                         
            
            
            compressors: ['zlib'],           
            zlibCompressionLevel: 6,         
            
            
            autoIndex: process.env.NODE_ENV !== 'production'  
        };
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        
        console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
        console.log(`📊 Base de datos: ${conn.connection.name}`);
        console.log(`🔌 Conexiones en pool: ${options.poolSize}`);
        
        
        setupConnectionEvents();
        
        
        if (process.env.NODE_ENV === 'development') {
            mongoose.set('debug', (collectionName, method, query, doc) => {
                console.log(`🔍 ${collectionName}.${method}`, JSON.stringify(query));
            });
        }
        
    } catch (error) {
        console.error('❌ Error de conexión a MongoDB:', error.message);
        process.exit(1);
    }
};

/**
 * Configurar event listeners para la conexión
 */
function setupConnectionEvents() {
    const db = mongoose.connection;
    
    
    db.on('error', (err) => {
        console.error('❌ MongoDB error:', err);
    });
    
    
    db.on('disconnected', () => {
        console.warn('⚠️  MongoDB desconectado. Intentando reconectar...');
    });
    
    
    db.on('reconnected', () => {
        console.log('✅ MongoDB reconectado');
    });
    
    
    db.on('close', () => {
        console.log('🔒 Conexión MongoDB cerrada');
    });
    
    
    process.on('SIGINT', async () => {
        await db.close();
        console.log('👋 Conexión MongoDB cerrada por terminación de app');
        process.exit(0);
    });
}

/**
 * Verificar salud de la conexión
 */
const checkDatabaseHealth = async () => {
    try {
        const admin = mongoose.connection.db.admin();
        const status = await admin.serverStatus();
        
        return {
            status: 'healthy',
            connections: status.connections,
            uptime: status.uptime,
            version: status.version,
            ok: status.ok === 1
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
};

/**
 * Obtener estadísticas de la base de datos
 */
const getDatabaseStats = async () => {
    try {
        const db = mongoose.connection.db;
        const stats = await db.stats();
        
        return {
            collections: stats.collections,
            dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
            indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
            totalSize: `${((stats.dataSize + stats.indexSize) / 1024 / 1024).toFixed(2)} MB`,
            objects: stats.objects,
            indexes: stats.indexes,
            avgObjSize: `${(stats.avgObjSize / 1024).toFixed(2)} KB`
        };
    } catch (error) {
        throw new Error(`Error obteniendo stats: ${error.message}`);
    }
};

/**
 * Limpiar colecciones en entorno de test
 */
const clearDatabase = async () => {
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('clearDatabase solo se puede usar en entorno de test');
    }
    
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
    
    console.log('🗑️  Base de datos de test limpiada');
};

/**
 * Cerrar conexión limpiamente
 */
const closeDatabase = async () => {
    await mongoose.connection.close();
    console.log('🔒 Conexión a base de datos cerrada');
};

/**
 * Crear índices manualmente (útil en producción)
 */
const createIndexes = async () => {
    try {
        console.log('🔨 Creando índices...');
        
        const models = Object.keys(mongoose.models);
        
        for (const modelName of models) {
            const model = mongoose.model(modelName);
            await model.createIndexes();
            console.log(`✅ Índices creados para ${modelName}`);
        }
        
        console.log('✅ Todos los índices creados exitosamente');
    } catch (error) {
        console.error('❌ Error creando índices:', error);
        throw error;
    }
};

/**
 * Analizar uso de índices (para optimización)
 */
const analyzeIndexUsage = async (collectionName) => {
    try {
        const db = mongoose.connection.db;
        const collection = db.collection(collectionName);
        
        const indexStats = await collection.aggregate([
            { $indexStats: {} }
        ]).toArray();
        
        console.log(`📊 Estadísticas de índices para ${collectionName}:`);
        indexStats.forEach(stat => {
            console.log(`  - ${stat.name}: ${stat.accesses.ops} accesos`);
        });
        
        return indexStats;
    } catch (error) {
        console.error('❌ Error analizando índices:', error);
        throw error;
    }
};

module.exports = {
    connectDB,
    checkDatabaseHealth,
    getDatabaseStats,
    clearDatabase,
    closeDatabase,
    createIndexes,
    analyzeIndexUsage
};
