require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Course = require('./models/Course');
const Event = require('./models/Event');
const Purchase = require('./models/Purchase');
const EventRegistration = require('./models/EventRegistration');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduplatform', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB conectado'))
.catch(err => console.error('❌ Error de conexión:', err));

const sampleUsers = [
    {
        email: 'admin@academiapesquera.com',
        password: 'Admin123',
        firstName: 'Admin',
        lastName: 'Principal',
        role: 'admin',
        isActive: true
    },
    {
        email: 'usuario@test.com',
        password: 'Usuario123',
        firstName: 'Juan',
        lastName: 'Pérez',
        role: 'student',
        isActive: true
    }
];

const sampleCourses = [
    {
        title: 'Fundamentos de Acuicultura Marina',
        description: 'Aprende los conceptos básicos de la acuicultura marina, desde el cultivo de especies hasta la gestión de sistemas acuícolas.',
        category: 'data',
        price: 49.99,
        duration: '2h',
        totalMinutes: 120,
        level: 'principiante',
        instructor: 'Dr. Carlos Marino',
        thumbnail: 'https://via.placeholder.com/300x180',
        isActive: true,
        students: { count: 0, active: 0 }
    },
    {
        title: 'Gestión de Recursos Pesqueros',
        description: 'Comprende los principios de gestión sostenible de recursos pesqueros y las políticas internacionales.',
        category: 'negocios',
        price: 59.99,
        duration: '2h 30min',
        totalMinutes: 150,
        level: 'intermedio',
        instructor: 'Dr. Pedro Pescador',
        thumbnail: 'https://via.placeholder.com/300x180',
        isActive: true,
        students: { count: 0, active: 0 }
    },
    {
        title: 'Técnicas Avanzadas de Pesca Sostenible',
        description: 'Domina las técnicas modernas de pesca sostenible y aprende sobre la conservación de los recursos marinos.',
        category: 'otro',
        price: 79.99,
        duration: '3h',
        totalMinutes: 180,
        level: 'avanzado',
        instructor: 'Ing. María Oceánica',
        thumbnail: 'https://via.placeholder.com/300x180',
        isActive: true,
        students: { count: 0, active: 0 }
    },
];

const sampleEvents = [
    {
        title: 'Conferencia: Futuro de la Acuicultura en América Latina',
        description: 'Únete a expertos internacionales en una discusión sobre el futuro de la acuicultura en la región.',
        date: new Date('2026-02-15'),
        speaker: 'Dr. Carlos Marino',
        category: 'tecnologia',
        maxCapacity: 200,
        registrations: 0,
        status: 'upcoming',
        isActive: true,
        isFree: true,
        price: 0
    },
    {
        title: 'Webinar: Innovaciones en Pesca Sostenible',
        description: 'Descubre las últimas tecnologías y métodos para una pesca más sostenible y eficiente.',
        date: new Date('2026-01-25'),
        speaker: 'Ing. María Oceánica',
        category: 'negocios',
        maxCapacity: 500,
        registrations: 0,
        status: 'upcoming',
        isActive: true,
        isFree: true,
        price: 0
    },
    {
        title: 'Taller: Cultivo de Camarones - Nivel Básico',
        description: 'Aprende los fundamentos del cultivo de camarones en este taller práctico.',
        date: new Date('2026-03-10'),
        speaker: 'Dr. Pedro Pescador',
        category: 'otro',
        maxCapacity: 30,
        registrations: 0,
        status: 'upcoming',
        isActive: true,
        isFree: false,
        price: 25.00
    }
];

async function seedDatabase() {
    try {
        console.log('🌱 Iniciando seed de la base de datos...\n');

        console.log('🗑️  Limpiando datos existentes...');
        await User.deleteMany({});
        await Course.deleteMany({});
        await Event.deleteMany({});
        await Purchase.deleteMany({});
        await EventRegistration.deleteMany({});
        console.log('✅ Datos limpiados\n');

        console.log('👥 Creando usuarios...');
        const createdUsers = [];
        for (const userData of sampleUsers) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
            console.log(`   ✓ Usuario creado: ${user.email} (${user.role})`);
        }
        console.log('✅ Usuarios creados\n');

        console.log('📚 Creando cursos...');
        const createdCourses = [];
        for (const courseData of sampleCourses) {
            const course = await Course.create(courseData);
            createdCourses.push(course);
            console.log(`   ✓ Curso creado: ${course.title}`);
        }
        console.log('✅ Cursos creados\n');

        console.log('📅 Creando eventos...');
        const createdEvents = [];
        for (const eventData of sampleEvents) {
            const event = await Event.create(eventData);
            createdEvents.push(event);
            console.log(`   ✓ Evento creado: ${event.title}`);
        }
        console.log('✅ Eventos creados\n');

        const regularUser = createdUsers.find(u => u.role === 'user');
        if (regularUser && createdCourses.length > 0) {
            console.log('🛒 Creando compra de ejemplo...');
            const purchase = await Purchase.create({
                user: regularUser._id,
                course: createdCourses[0]._id,
                amount: createdCourses[0].price,
                currency: 'USD',
                paymentMethod: 'credit_card',
                status: 'completed',
                paymentDate: new Date()
            });

            regularUser.enrolledCourses.push({
                course: createdCourses[0]._id,
                enrolledAt: new Date(),
                progress: 35,
                completed: false
            });
            await regularUser.save();

            createdCourses[0].students += 1;
            await createdCourses[0].save();

            console.log(`   ✓ Compra creada para ${regularUser.email}`);
            console.log('✅ Compra de ejemplo creada\n');
        }

        if (regularUser && createdEvents.length > 0) {
            console.log('🎟️  Creando registro de evento de ejemplo...');
            const registration = await EventRegistration.create({
                user: regularUser._id,
                event: createdEvents[0]._id,
                status: 'confirmed',
                registeredAt: new Date()
            });

            regularUser.registeredEvents.push(createdEvents[0]._id);
            await regularUser.save();

            createdEvents[0].currentAttendees += 1;
            await createdEvents[0].save();

            console.log(`   ✓ Registro creado para ${regularUser.email}`);
            console.log('✅ Registro de evento creado\n');
        }

        console.log('═══════════════════════════════════════════');
        console.log('🎉 ¡Seed completado exitosamente!');
        console.log('═══════════════════════════════════════════');
        console.log('\n📊 Resumen:');
        console.log(`   👥 Usuarios: ${createdUsers.length}`);
        console.log(`   📚 Cursos: ${createdCourses.length}`);
        console.log(`   📅 Eventos: ${createdEvents.length}`);
        console.log('\n🔐 Credenciales de prueba:');
        console.log('   Admin:');
        console.log('   - Email: admin@academiapesquera.com');
        console.log('   - Password: Admin123');
        console.log('\n   Usuario:');
        console.log('   - Email: usuario@test.com');
        console.log('   - Password: Usuario123');
        console.log('═══════════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante el seed:', error);
        process.exit(1);
    }
}


seedDatabase();
