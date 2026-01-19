const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const logger = require('../config/logger');

// Crear directorios de uploads si no existen
const uploadDir = path.join(__dirname, '../uploads');
const avatarsDir = path.join(uploadDir, 'avatars');
const coursesDir = path.join(uploadDir, 'courses');
const eventsDir = path.join(uploadDir, 'events');

[uploadDir, avatarsDir, coursesDir, eventsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = uploadDir;
        
        if (req.baseUrl.includes('users') || req.baseUrl.includes('auth')) {
            folder = avatarsDir;
        } else if (req.baseUrl.includes('courses')) {
            folder = coursesDir;
        } else if (req.baseUrl.includes('events')) {
            folder = eventsDir;
        }
        
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = file.fieldname + '-' + uniqueSuffix + ext;
        cb(null, name);
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (JPEG, PNG, WEBP, GIF)'));
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB por defecto
    }
});

// Middleware para procesar imágenes con Sharp
const processImage = async (req, res, next) => {
    if (!req.file) return next();
    
    try {
        const filePath = req.file.path;
        const outputPath = filePath.replace(path.extname(filePath), '-optimized.webp');
        
        // Determinar dimensiones según el tipo
        let width = 1200;
        let height = 800;
        
        if (req.baseUrl.includes('users') || req.baseUrl.includes('auth')) {
            width = 400;
            height = 400;
        } else if (req.baseUrl.includes('courses')) {
            width = 800;
            height = 500;
        }
        
        // Procesar imagen
        await sharp(filePath)
            .resize(width, height, {
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: 85 })
            .toFile(outputPath);
        
        // Eliminar archivo original
        fs.unlinkSync(filePath);
        
        // Actualizar req.file con la nueva información
        req.file.path = outputPath;
        req.file.filename = path.basename(outputPath);
        req.file.mimetype = 'image/webp';
        
        logger.info(`Imagen procesada: ${req.file.filename}`);
        next();
    } catch (error) {
        logger.error('Error procesando imagen:', error);
        
        // Si falla el procesamiento, eliminar el archivo y continuar con error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        return res.status(500).json({
            message: 'Error al procesar la imagen',
            error: error.message
        });
    }
};

// Eliminar archivo
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`Archivo eliminado: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        logger.error('Error eliminando archivo:', error);
        return false;
    }
};

// Middleware de manejo de errores de multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'El archivo es demasiado grande. Máximo 5MB'
            });
        }
        return res.status(400).json({
            message: `Error al subir archivo: ${err.message}`
        });
    } else if (err) {
        return res.status(400).json({
            message: err.message || 'Error al subir archivo'
        });
    }
    next();
};

module.exports = {
    upload,
    processImage,
    deleteFile,
    handleMulterError,
    uploadDir
};
