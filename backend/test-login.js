require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        const email = 'admin@academiapesquera.com';
        const password = 'Admin123';

        console.log(`🔍 Buscando usuario: ${email}`);
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('❌ Usuario no encontrado');
            process.exit(1);
        }

        console.log('✅ Usuario encontrado');
        console.log('   - Email:', user.email);
        console.log('   - Role:', user.role);
        console.log('   - Password hash:', user.password.substring(0, 20) + '...');
        console.log('   - isActive:', user.isActive);

        console.log(`\n🔐 Probando contraseña: ${password}`);
        const isMatch = await user.comparePassword(password);
        
        if (isMatch) {
            console.log('✅ Contraseña correcta!');
        } else {
            console.log('❌ Contraseña incorrecta');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testLogin();
