const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const logger = require('../config/logger');

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

const forgotPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Por seguridad, no revelar si el email existe
            return res.status(200).json({ 
                message: 'Si el email existe, recibirás un enlace de recuperación' 
            });
        }

        // Generar token de recuperación
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Guardar token hasheado y expiración (1 hora)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hora
        await user.save();

        // Crear URL de reset
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5500'}/reset-password.html?token=${resetToken}`;

        // Enviar email
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"Academia Pesquera" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Recuperación de Contraseña - Academia Pesquera',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔒 Recuperación de Contraseña</h1>
                        </div>
                        <div class="content">
                            <p>Hola <strong>${user.firstName}</strong>,</p>
                            
                            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Academia Pesquera.</p>
                            
                            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                            
                            <div style="text-align: center;">
                                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                            </div>
                            
                            <p>O copia y pega este enlace en tu navegador:</p>
                            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                                ${resetUrl}
                            </p>
                            
                            <div class="warning">
                                <strong>⚠️ Importante:</strong>
                                <ul>
                                    <li>Este enlace expira en <strong>1 hora</strong></li>
                                    <li>Si no solicitaste este cambio, ignora este email</li>
                                    <li>Tu contraseña actual permanecerá sin cambios</li>
                                </ul>
                            </div>
                            
                            <p>Si tienes problemas, contáctanos en ${process.env.EMAIL_USER}</p>
                        </div>
                        <div class="footer">
                            <p>Este es un email automático, por favor no respondas.</p>
                            <p>&copy; 2026 Academia Pesquera. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        logger.info(`Email de recuperación enviado a: ${user.email}`);

        res.status(200).json({ 
            message: 'Si el email existe, recibirás un enlace de recuperación' 
        });

    } catch (error) {
        logger.error('Forgot password error:', error);
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error al procesar la solicitud' });
    }
};

// Restablecer contraseña con token
const resetPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { token, password } = req.body;

        // Hashear el token para comparar
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Buscar usuario con token válido y no expirado
        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Token inválido o expirado. Solicita un nuevo enlace.' 
            });
        }

        // Establecer nueva contraseña
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        logger.info(`Contraseña restablecida para: ${user.email}`);

        // Enviar email de confirmación
        const transporter = createTransporter();
        const mailOptions = {
            from: `"Academia Pesquera" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Contraseña Restablecida - Academia Pesquera',
            html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1>✅ Contraseña Restablecida</h1>
                        </div>
                        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                            <p>Hola <strong>${user.firstName}</strong>,</p>
                            <p>Tu contraseña ha sido restablecida exitosamente.</p>
                            <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
                            <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                                <strong>🔒 Recomendaciones de seguridad:</strong>
                                <ul>
                                    <li>Usa una contraseña única y fuerte</li>
                                    <li>No compartas tu contraseña con nadie</li>
                                    <li>Considera usar un gestor de contraseñas</li>
                                </ul>
                            </div>
                            <p>Si no realizaste este cambio, contacta inmediatamente a soporte.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.' 
        });

    } catch (error) {
        logger.error('Reset password error:', error);
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error al restablecer la contraseña' });
    }
};

module.exports = {
    forgotPassword,
    resetPassword
};
