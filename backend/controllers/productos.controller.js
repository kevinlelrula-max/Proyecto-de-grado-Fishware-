import pool from "../config/db.js";


export const getProductos = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const result = await pool.query(
      "SELECT * FROM productos WHERE empresa_id = $1",
      [empresa_id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// 🔹 Crear producto
export const crearProducto = async (req, res) => {
  try {
    const { nombre, precio, stock, categoria_id } = req.body;
    const empresa_id = req.user.empresa_id;

    const result = await pool.query(
      `INSERT INTO productos (nombre, precio, stock, categoria_id, empresa_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, precio, stock, categoria_id, empresa_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al crear producto" });
  }
};

// 🔹 Actualizar producto (solo de mi empresa)
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, stock, categoria_id } = req.body;
    const empresa_id = req.user.empresa_id;

    const result = await pool.query(
      `UPDATE productos
       SET nombre = $1, precio = $2, stock = $3, categoria_id = $4
       WHERE id = $5 AND empresa_id = $6
       RETURNING *`,
      [nombre, precio, stock, categoria_id, id, empresa_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

// 🔹 Eliminar producto (solo de mi empresa)
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa_id = req.user.empresa_id;

    await pool.query(
      "DELETE FROM productos WHERE id = $1 AND empresa_id = $2",
      [id, empresa_id]
    );

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};