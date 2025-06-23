import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Obtener todos los paquetes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM PRODUCT');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Crear nuevo paquete
router.post('/', authenticateToken, async (req, res) => {
  const { product_name, product_description, product_unit_price, product_image } = req.body;

  if (!product_name || !product_description || !product_unit_price) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO product 
        (product_name, product_description, product_unit_price, product_image) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [product_name, product_description, product_unit_price, product_image]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear paquete:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Actualizar paquete
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { product_name, product_description, product_unit_price, product_image } = req.body;

  try {
    const result = await pool.query(
      `UPDATE product SET
        product_name = $1,
        product_description = $2,
        product_unit_price = $3,
        product_image = $4
       WHERE id_product = $5
       RETURNING *`,
      [product_name, product_description, product_unit_price, product_image, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Paquete no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar paquete:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Borrar paquete
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM product WHERE id_product = $1", [id]);
    res.json({ mensaje: "Paquete eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar paquete:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;