export function errorHandler(err, req, res, next) {
  console.error("Error:", err);
  
  if (err.code === '23505') { 
    return res.status(400).json({ error: "El recurso ya existe" });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: "Datos inválidos" });
  }
  
  res.status(500).json({ error: "Error interno del servidor" });
}