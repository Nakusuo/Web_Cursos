
/**
 * Script de mantenimiento de base de datos
 * Academia Pesquera
 * 
 * Uso:
 * node scripts/db-maintenance.js [comando]
 * 
 * Comandos:
 * - stats: Ver estadísticas de la BD
 * - indexes: Analizar uso de índices
 * - create-indexes: Crear todos los índices
 * - cleanup: Limpiar datos obsoletos
 * - backup: Crear backup
 * - health: Verificar salud de la BD
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, getDatabaseStats, analyzeIndexUsage, createIndexes } = require('../config/database');


require('../models/User');
require('../models/Course');
require('../models/Event');
require('../models/EventRegistration');
require('../models/Purchase');

const command = process.argv[2];

async function showStats() {
    console.log('\n📊 ESTADÍSTICAS DE BASE DE DATOS\n');
    
    try {
        const stats = await getDatabaseStats();
        
        console.log('Resumen General:');
        console.log(`  • Colecciones: ${stats.collections}`);
        console.log(`  • Tamaño de datos: ${stats.dataSize}`);
        console.log(`  • Tamaño de índices: ${stats.indexSize}`);
        console.log(`  • Tamaño total: ${stats.totalSize}`);
        console.log(`  • Documentos: ${stats.objects}`);
        console.log(`  • Índices totales: ${stats.indexes}`);
        console.log(`  • Tamaño promedio doc: ${stats.avgObjSize}\n`);
        
        
        const collections = ['users', 'courses', 'events', 'eventregistrations', 'purchases'];
        
        console.log('Estadísticas por Colección:');
        for (const collName of collections) {
            try {
                const coll = mongoose.connection.db.collection(collName);
                const collStats = await coll.stats();
                
                console.log(`\n  ${collName}:`);
                console.log(`    - Documentos: ${collStats.count}`);
                console.log(`    - Tamaño: ${(collStats.size / 1024).toFixed(2)} KB`);
                console.log(`    - Índices: ${collStats.nindexes}`);
                console.log(`    - Tamaño índices: ${(collStats.totalIndexSize / 1024).toFixed(2)} KB`);
            } catch (err) {
                console.log(`  ${collName}: No existe o sin datos`);
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function analyzeIndexes() {
    console.log('\n🔍 ANÁLISIS DE ÍNDICES\n');
    
    const collections = ['users', 'courses', 'events', 'eventregistrations', 'purchases'];
    
    for (const collName of collections) {
        try {
            console.log(`\n📋 ${collName.toUpperCase()}:`);
            const stats = await analyzeIndexUsage(collName);
            
            if (stats.length === 0) {
                console.log('  No hay índices');
                continue;
            }
            
            
            stats.sort((a, b) => b.accesses.ops - a.accesses.ops);
            
            stats.forEach(stat => {
                const usage = stat.accesses.ops;
                const usageIcon = usage > 1000 ? '🔥' : usage > 100 ? '✅' : usage > 0 ? '⚠️' : '❌';
                console.log(`  ${usageIcon} ${stat.name}: ${usage.toLocaleString()} accesos`);
            });
            
            
            const unused = stats.filter(s => s.accesses.ops === 0 && s.name !== '_id_');
            if (unused.length > 0) {
                console.log(`\n  ⚠️  Índices no utilizados (considerar eliminar):`);
                unused.forEach(u => console.log(`    - ${u.name}`));
            }
        } catch (error) {
            console.log(`  Error analizando ${collName}: ${error.message}`);
        }
    }
}

async function createAllIndexes() {
    console.log('\n🔨 CREANDO ÍNDICES\n');
    
    try {
        await createIndexes();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function cleanup() {
    console.log('\n🧹 LIMPIEZA DE DATOS OBSOLETOS\n');
    
    try {
        
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        
        const Purchase = mongoose.model('Purchase');
        const deletedPurchases = await Purchase.deleteMany({
            status: 'failed',
            createdAt: { $lt: ninetyDaysAgo }
        });
        
        console.log(`✅ Eliminadas ${deletedPurchases.deletedCount} compras fallidas antiguas`);
        
        
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        
        const Event = mongoose.model('Event');
        const archivedEvents = await Event.updateMany(
            {
                status: 'completed',
                date: { $lt: oneYearAgo }
            },
            {
                $set: { isActive: false }
            }
        );
        
        console.log(`✅ Archivados ${archivedEvents.modifiedCount} eventos antiguos`);
        
        
        const EventRegistration = mongoose.model('EventRegistration');
        const deletedRegistrations = await EventRegistration.deleteMany({
            status: 'cancelled',
            registeredAt: { $lt: ninetyDaysAgo }
        });
        
        console.log(`✅ Eliminados ${deletedRegistrations.deletedCount} registros cancelados antiguos`);
        
    } catch (error) {
        console.error('❌ Error en limpieza:', error.message);
    }
}

async function checkHealth() {
    console.log('\n🏥 VERIFICACIÓN DE SALUD\n');
    
    try {
        const admin = mongoose.connection.db.admin();
        const serverStatus = await admin.serverStatus();
        
        console.log('Estado del Servidor:');
        console.log(`  ✅ Estado: OK`);
        console.log(`  • Versión: ${serverStatus.version}`);
        console.log(`  • Uptime: ${Math.floor(serverStatus.uptime / 60)} minutos`);
        console.log(`  • Conexiones actuales: ${serverStatus.connections.current}`);
        console.log(`  • Conexiones disponibles: ${serverStatus.connections.available}`);
        console.log(`  • Network (bytes in): ${(serverStatus.network.bytesIn / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  • Network (bytes out): ${(serverStatus.network.bytesOut / 1024 / 1024).toFixed(2)} MB`);
        
        
        if (serverStatus.repl) {
            console.log(`\n  🔄 Replica Set:`);
            console.log(`    - Nombre: ${serverStatus.repl.setName}`);
            console.log(`    - Es Primary: ${serverStatus.repl.ismaster}`);
        }
        
        
        const connUsage = (serverStatus.connections.current / (serverStatus.connections.current + serverStatus.connections.available)) * 100;
        if (connUsage > 80) {
            console.log(`\n  ⚠️  ADVERTENCIA: Uso de conexiones al ${connUsage.toFixed(1)}%`);
        }
        
    } catch (error) {
        console.error('❌ Error verificando salud:', error.message);
    }
}

async function createBackup() {
    console.log('\n💾 CREANDO BACKUP\n');
    
    const { exec } = require('child_process');
    const path = require('path');
    const fs = require('fs');
    
    const date = new Date().toISOString().split('T')[0];
    const backupDir = path.join(__dirname, '..', 'backups');
    
    
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupPath = path.join(backupDir, `backup_${date}`);
    
    console.log(`📁 Directorio de backup: ${backupPath}`);
    
    const mongoUri = process.env.MONGODB_URI;
    const command = `mongodump --uri="${mongoUri}" --out="${backupPath}" --gzip`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Error creando backup:', error.message);
            return;
        }
        
        console.log('✅ Backup creado exitosamente');
        console.log(`📦 Ubicación: ${backupPath}`);
        
        
        const tarCommand = `tar -czf "${backupPath}.tar.gz" -C "${backupDir}" "backup_${date}"`;
        exec(tarCommand, (err) => {
            if (!err) {
                console.log(`🗜️  Backup comprimido: backup_${date}.tar.gz`);
                
                exec(`rm -rf "${backupPath}"`, () => {
                    console.log('🧹 Directorio temporal eliminado');
                });
            }
        });
    });
}

async function showHelp() {
    console.log(`
📚 SCRIPT DE MANTENIMIENTO DE BASE DE DATOS
Academia Pesquera

USO:
  node scripts/db-maintenance.js [comando]

COMANDOS DISPONIBLES:

  stats           Ver estadísticas completas de la BD
  indexes         Analizar uso de índices
  create-indexes  Crear todos los índices definidos
  cleanup         Limpiar datos obsoletos
  backup          Crear backup de la BD
  health          Verificar salud del servidor
  help            Mostrar esta ayuda

EJEMPLOS:

  node scripts/db-maintenance.js stats
  node scripts/db-maintenance.js indexes
  node scripts/db-maintenance.js cleanup

    `);
}

async function main() {
    try {
        await connectDB();
        
        switch (command) {
            case 'stats':
                await showStats();
                break;
            case 'indexes':
                await analyzeIndexes();
                break;
            case 'create-indexes':
                await createAllIndexes();
                break;
            case 'cleanup':
                await cleanup();
                break;
            case 'backup':
                await createBackup();
                break;
            case 'health':
                await checkHealth();
                break;
            case 'help':
                await showHelp();
                break;
            default:
                console.log('❌ Comando no reconocido. Usa "help" para ver comandos disponibles.');
                await showHelp();
        }
        
        
        if (command !== 'backup') {
            await mongoose.connection.close();
            process.exit(0);
        }
        
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
}

main();
