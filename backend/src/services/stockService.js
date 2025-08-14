import { pool } from "../config/db.js";

export const restarStock = async (codigo_producto, cantidad) => {
  await pool.query(
    "UPDATE Productos SET stock = stock - ? WHERE codigo_producto = ? AND stock >= ?",
    [cantidad, codigo_producto, cantidad]
  );
};

export const sumarStock = async (codigo_producto, cantidad) => {
  await pool.query(
    "UPDATE Productos SET stock = stock + ? WHERE codigo_producto = ?",
    [cantidad, codigo_producto]
  );
};
