import express from 'express';
import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Ruta para registrar un nuevo cliente (POST /api/users/register)
router.post('/register', async (req, res) => {
    const { nombre, apellido, correo, direccion, contrasena } = req.body;

    try {
        // 1. Validar si el correo ya existe en la BD
        const emailCheck = await pool.query(
            'SELECT * FROM CLIENT WHERE CLIENT_EMAIL = $1', 
            [correo]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ 
                error: 'El correo ya está registrado' 
            });
        }

        // 2. Encriptar la contraseña (seguridad obligatoria)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

        // 3. Insertar nuevo cliente en PostgreSQL
        const result = await pool.query(
            `INSERT INTO CLIENT (
                CLIENT_NAME, 
                CLIENT_LAST_NAME, 
                CLIENT_EMAIL, 
                CLIENT_ADDRESS, 
                CLIENT_PASSWORD
            ) VALUES ($1, $2, $3, $4, $5) 
            RETURNING 
                ID_CLIENT,
                CLIENT_NAME, 
                CLIENT_LAST_NAME, 
                CLIENT_EMAIL, 
                CLIENT_ADDRESS`,  // Solo devolver campos necesarios
            [nombre, apellido, correo, direccion, hashedPassword]
        );

        // 4. Extraer datos del cliente (sin contraseña)
        const newClient = result.rows[0];

        // 5. Responder con éxito y datos del cliente
        res.status(201).json({
            success: true,
            client: newClient,
            message: 'Registro exitoso'
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message  // Solo para desarrollo, no en producción
        });
    }
});

export default router;