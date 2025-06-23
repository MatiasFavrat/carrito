import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Ruta para agregar un producto al carrito
router.post('/', async (req, res) => {
  const id_client = req.user.id;
  const { product_name, amount = 1 } = req.body;

  if (!product_name) {
    return res.status(400).json({ error: "Faltan datos en la solicitud" });
  }

  try {
    // 1. Buscar producto por nombre
    const prodResult = await pool.query(
      "SELECT id_product, product_unit_price FROM product WHERE product_name = $1",
      [product_name]
    );

    if (prodResult.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const producto = prodResult.rows[0];

    // 2. Buscar carrito actual (wish estado 'CARRITO')
    let wishResult = await pool.query(
      "SELECT * FROM wish WHERE fk_client = $1 AND wish_state = 'carrito'",
      [id_client]
    );

    let wish;
    if (wishResult.rows.length === 0) {
      // No existe carrito, crear uno
      const insertWish = await pool.query(
        "INSERT INTO wish (fk_client, wish_date, wish_state, wish_total) VALUES ($1, CURRENT_DATE, 'carrito', 0) RETURNING *",
        [id_client]
      );
      wish = insertWish.rows[0];
    } else {
      wish = wishResult.rows[0];
    }

    // 3. Insertar producto en wish_detail
    const subtotal = producto.product_unit_price * amount;
    const insertDetail = await pool.query(
      "INSERT INTO wish_detail (fk_wish, fk_product, wish_detail_amount, wish_detail_subtotal) VALUES ($1, $2, $3, $4) RETURNING *",
      [wish.id_wish, producto.id_product, amount, subtotal]
    );

    // 4. Actualizar total en wish
    await pool.query(
      "UPDATE wish SET wish_total = (SELECT SUM(wish_detail_subtotal) FROM wish_detail WHERE fk_wish = $1) WHERE id_wish = $1",
      [wish.id_wish]
    );

    res.status(201).json({ mensaje: "Producto agregado al carrito", detalle: insertDetail.rows[0] });

  } catch (error) {
    console.error("❌ Error al agregar producto al carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para obtener el carrito del cliente
router.get('/', async (req, res) => {
  const id_client = req.user.id;

  try {
    // Buscar carrito 'CARRITO'
    const wishResult = await pool.query(
      "SELECT * FROM wish WHERE fk_client = $1 AND wish_state = 'carrito'",
      [id_client]
    );

    if (wishResult.rows.length === 0) {
      return res.json({ carrito: [] }); // carrito vacío
    }

    const wish = wishResult.rows[0];

    // Obtener detalles
    const detalles = await pool.query(
      `SELECT wd.id_wish_detail, p.product_name, wd.wish_detail_amount, wd.wish_detail_subtotal
       FROM wish_detail wd
       JOIN product p ON wd.fk_product = p.id_product
       WHERE wd.fk_wish = $1`,
      [wish.id_wish]
    );

    res.json({ carrito: detalles.rows, total: wish.wish_total });

  } catch (error) {
    console.error("❌ Error al obtener carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para actualizar la cantidad de un producto en el carrito
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM wish_detail WHERE id_wish_detail = $1", [id]);
    res.json({ mensaje: "Producto eliminado del carrito" });
  } catch (err) {
    console.error("❌ Error al eliminar del carrito:", err);
    res.status(500).json({ error: "Error al eliminar producto del carrito" });
  }
});

// Ruta para actualizar cantidad de producto en carrito
router.post('/sincronizar', async (req, res) => {
  const id_client = req.user.id;
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Formato inválido" });
  }

  try {
    // Find or create cart
    let wishResult = await pool.query(
      "SELECT * FROM wish WHERE fk_client = $1 AND wish_state = 'carrito'",
      [id_client]
    );

    let wish;
    if (wishResult.rows.length === 0) {
      const insertResult = await pool.query(
        "INSERT INTO wish (fk_client, wish_date, wish_state, wish_total) VALUES ($1, CURRENT_DATE, 'carrito', 0) RETURNING *",
        [id_client]
      );
      wish = insertResult.rows[0];
    } else {
      wish = wishResult.rows[0];
    }

    const currentItems = await pool.query(
      "SELECT fk_product, wish_detail_amount FROM wish_detail WHERE fk_wish = $1",
      [wish.id_wish]
    );

    const toAdd = [];
    const toUpdate = [];
    const toRemove = [];

    items.forEach(newItem => {
      const existing = currentItems.rows.find(i => i.fk_product === newItem.id);
      if (!existing) {
        toAdd.push(newItem);
      } else if (existing.wish_detail_amount !== newItem.cantidad) {
        toUpdate.push(newItem);
      }
    });

    await Promise.all([
      ...toAdd.map(item => addItem(wish.id_wish, item)),
      ...toUpdate.map(item => updateItem(wish.id_wish, item)),
      ...toRemove.map(item => removeItem(wish.id_wish, item))
    ]);

    // Añadir nuevos productos
    let total = 0;
    for (const item of items) {
      const { id, cantidad } = item;
      const productResult = await pool.query(
        "SELECT product_unit_price FROM product WHERE id_product = $1",
        [id]
      );

      if (productResult.rows.length === 0) continue;

      const precio = productResult.rows[0].product_unit_price;
      const subtotal = precio * cantidad;
      total += subtotal;

      await pool.query(
        "INSERT INTO wish_detail (fk_wish, fk_product, wish_detail_amount, wish_detail_subtotal) VALUES ($1, $2, $3, $4)",
        [wish.id_wish, id, cantidad, subtotal]
      );
    }

    // Update cart total
    await pool.query(
      "UPDATE wish SET wish_total = $1 WHERE id_wish = $2",
      [total, wish.id_wish]
    );

    res.json({ mensaje: "Carrito sincronizado" });
  } catch (error) {
    console.error("Error al sincronizar carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;