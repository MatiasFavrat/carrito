import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Opcional: Prueba la conexión al iniciar
pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL conectado'))
  .catch(err => console.error('❌ Error de conexión a PostgreSQL:', err));


async function main() {
  try {
    const timeResult = await pool.query("SELECT NOW()");
    console.log("🕒 Hora actual desde PostgreSQL:", timeResult.rows[0]);

    const tablesResult = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    console.log("🗂️ Tablas:", tablesResult.rows);
  } catch (err) {
    console.error("❌ Error en la consulta:", err);
  } finally {

  }
}

if (process.argv[1].includes('db.js')) {
  main();
}