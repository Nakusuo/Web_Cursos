


const isDevelopment = process.env.NODE_ENV !== 'production';
const isProduction = process.env.NODE_ENV === 'production';

const config = {
    
    env: process.env.NODE_ENV || 'development',
    isDevelopment,
    isProduction,

    
    port: process.env.PORT || 3000,
    
    
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/eduplatform',
    
    
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    
    
    allowedOrigins: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',')
        : isDevelopment 
            ? ['http://localhost:3000', 'http://127.0.0.1:3000']
            : [],
    
    
    bcryptSaltRounds: 10,
    
    
    defaultPageSize: 10,
    maxPageSize: 100,
    
    
    maxFileSize: 5 * 1024 * 1024, 
    
    
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
    paypalSecret: process.env.PAYPAL_SECRET,
};


if (isProduction) {
    const required = ['MONGODB_URI', 'JWT_SECRET', 'ALLOWED_ORIGINS'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        console.error('\nPlease set these variables before starting the server in production.');
        process.exit(1);
    }
}

module.exports = config;
