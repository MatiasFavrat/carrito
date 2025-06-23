import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginClient = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query(
            "SELECT * FROM client WHERE client_email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const user = userResult.rows[0];

        // Verificar contraseña
        const match = await bcrypt.compare(password, user.client_password);
        if (!match) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            {
                id: user.id_client,
                email: user.client_email,
                name: user.client_name,
                role: 'client'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user.id_client,
                name: user.client_name,
                email: user.client_email,
                role: 'client'
            }
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const loginEmployee = async (req, res) => {
    const { id, password } = req.body;

    try {
        const userResult = await pool.query(
            "SELECT * FROM internal_user WHERE id_internal_user = $1",
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const user = userResult.rows[0];
        
        // Corrección de seguridad
        const match = await bcrypt.compare(password, user.internal_user_password);
        if (!match) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            { 
                id: user.id_internal_user,
                username: user.internal_user_name,
                role: user.internal_user_role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ 
            token,
            user: {
                id: user.id_internal_user,
                name: user.internal_user_name,
                role: user.internal_user_role
            }
        });
    } catch (error) {
        console.error("Error en login de empleado:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const verifyToken = (req, res) => {
    res.json({ valid: true, user: req.user });
};