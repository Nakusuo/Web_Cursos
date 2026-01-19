const nodemailer = require('nodemailer');

// Crear transporter para envío de correos
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Enviar email de bienvenida
const sendWelcomeEmail = async (email, firstName) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"Academia Pesquera" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '¡Bienvenido a Academia Pesquera!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0B2F4A 0%, #1F6FA3 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">🐟 Academia Pesquera</h1>
                    </div>
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #0B2F4A;">¡Hola ${firstName}!</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">
                            Gracias por registrarte en Academia Pesquera. Estamos emocionados de tenerte con nosotros.
                        </p>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">
                            Ahora puedes acceder a:
                        </p>
                        <ul style="font-size: 16px; line-height: 1.8; color: #333;">
                            <li>Cursos especializados en pesca y acuicultura</li>
                            <li>Eventos y conferencias con expertos</li>
                            <li>Certificados de finalización</li>
                            <li>Comunidad de profesionales del sector</li>
                        </ul>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/login.html" 
                               style="background: linear-gradient(135deg, #1F6FA3 0%, #6EC1E4 100%); 
                                      color: white; 
                                      padding: 15px 40px; 
                                      text-decoration: none; 
                                      border-radius: 5px; 
                                      display: inline-block;
                                      font-weight: bold;">
                                Iniciar Sesión
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #666; margin-top: 30px;">
                            Si tienes alguna pregunta, no dudes en contactarnos.
                        </p>
                    </div>
                    <div style="background: #0B2F4A; padding: 20px; text-align: center; color: white; font-size: 12px;">
                        <p style="margin: 0;">© 2026 Academia Pesquera. Todos los derechos reservados.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de bienvenida enviado a ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email de bienvenida:', error);
        return false;
    }
};

// Enviar email de contacto/más información
const sendContactEmail = async (contactData) => {
    try {
        const transporter = createTransporter();
        
        // Email al usuario
        const userMailOptions = {
            from: `"Academia Pesquera" <${process.env.EMAIL_USER}>`,
            to: contactData.email,
            subject: 'Hemos recibido tu solicitud - Academia Pesquera',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0B2F4A 0%, #1F6FA3 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">🐟 Academia Pesquera</h1>
                    </div>
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #0B2F4A;">¡Hola ${contactData.name}!</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">
                            Hemos recibido tu solicitud de información. Nuestro equipo la revisará y te contactará pronto.
                        </p>
                        <div style="background: white; padding: 20px; border-left: 4px solid #1F6FA3; margin: 20px 0;">
                            <h3 style="color: #0B2F4A; margin-top: 0;">Tu mensaje:</h3>
                            <p style="color: #333;">${contactData.message}</p>
                        </div>
                        <p style="font-size: 14px; color: #666;">
                            Tiempo estimado de respuesta: 24-48 horas hábiles.
                        </p>
                    </div>
                    <div style="background: #0B2F4A; padding: 20px; text-align: center; color: white; font-size: 12px;">
                        <p style="margin: 0;">© 2026 Academia Pesquera. Todos los derechos reservados.</p>
                    </div>
                </div>
            `
        };

        // Email al administrador
        const adminMailOptions = {
            from: `"Academia Pesquera" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            subject: `Nueva solicitud de información - ${contactData.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0B2F4A;">Nueva Solicitud de Información</h2>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <p><strong>Nombre:</strong> ${contactData.name}</p>
                        <p><strong>Email:</strong> ${contactData.email}</p>
                        <p><strong>Teléfono:</strong> ${contactData.phone || 'No proporcionado'}</p>
                        <p><strong>Asunto:</strong> ${contactData.subject || 'No especificado'}</p>
                        <hr>
                        <p><strong>Mensaje:</strong></p>
                        <p>${contactData.message}</p>
                    </div>
                    <p style="font-size: 12px; color: #666; margin-top: 20px;">
                        Fecha: ${new Date().toLocaleString('es-ES')}
                    </p>
                </div>
            `
        };

        await transporter.sendMail(userMailOptions);
        await transporter.sendMail(adminMailOptions);
        
        console.log(`✅ Emails de contacto enviados para ${contactData.name}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando emails de contacto:', error);
        return false;
    }
};

module.exports = {
    sendWelcomeEmail,
    sendContactEmail
};
