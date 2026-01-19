const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const compression = require('compression');

const { 
    helmetConfig, 
    generalLimiter, 
    sanitizeConfig 
} = require('./middleware/security.middleware');
const logger = require('./config/logger');
const { initRedis } = require('./config/cache');

dotenv.config();

const app = express();

initRedis().catch(err => {
    logger.warn('Redis no disponible, continuar sin cache:', err);
});

app.use(helmetConfig);
app.use(sanitizeConfig);
app.use(compression());
app.use(logger.httpLogger);

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/', generalLimiter);

app.use(express.static(path.join(__dirname, '../frontend')));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduplatform', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    logger.info('✅ MongoDB conectado exitosamente');
    console.log('✅ MongoDB conectado exitosamente');
})
.catch((err) => {
    logger.error('❌ Error de conexión a MongoDB:', err);
    console.error('❌ Error de conexión a MongoDB:', err);
    process.exit(1);
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/password', require('./routes/password.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/event-registrations', require('./routes/eventRegistration.routes'));
app.use('/api/purchases', require('./routes/purchase.routes'));
app.use('/api/payments', require('./routes/payment-verification.routes'));
app.use('/api/contact', require('./routes/contact.routes'));

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`, { 
        stack: err.stack,
        url: req.url,
        method: req.method
    });
    
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

app.logger.info(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    logger.info(`📚 API disponible en http://localhost:${PORT}/api`);
    logger.info(`🔒 Modo: ${process.env.NODE_ENV || 'development'}`);
    
    use((req, res) => {
    logger.warn(`404 - Ruta no encontrada: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📚 API disponible en http://localhost:${PORT}/api`);
});

module.exports = app;
