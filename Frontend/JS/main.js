import { carrito } from './carrito.js';
import { CarritoUI } from './carrito-ui.js';

document.addEventListener('DOMContentLoaded', () => {
  new CarritoUI();    // Inicializa la interfaz del carrito
  cargarProductos();  // Carga los productos al iniciar
});

async function cargarProductos() {
  try {
    const response = await fetch('http://localhost:3000/api/paquetes');

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const productos = await response.json();
    renderizarProductos(productos);

  } catch (error) {
    console.error('Error al cargar productos:', error);
    mostrarErrorAlUsuario('No se pudieron cargar los paquetes');
  }
}

function renderizarProductos(productos) {
  const contenedor = document.getElementById('galeria-productos');
  if (!contenedor) return; // Asegurarse de que el elemento existe
  
  contenedor.innerHTML = '';

  // Crear una fila para contener todas las tarjetas
  const row = document.createElement('div');
  row.className = 'row g-3';

  productos.forEach(producto => {
    const precio = Number(producto.product_unit_price) || 0;

    // Crear columna para cada producto
    const col = document.createElement('div');
    col.className = 'col-md-3 mb-4';

    const card = document.createElement('div');
    card.className = 'card h-100';
    card.dataset.id = producto.id_product;
    card.dataset.nombre = producto.product_name;
    card.dataset.precio = precio;
    card.dataset.imagen = `../img/${producto.product_image}`;

    card.innerHTML = `
      <img src="../img/${producto.product_image}" 
           class="card-img-top" 
           alt="${producto.product_name}">
      <div class="card-body">
        <h5 class="card-title">${producto.product_name}</h5>
        <p class="card-text">${producto.product_description}</p>
        <p class="text-primary fw-bold">$${precio.toFixed(2)}</p>
        <button class="btn btn-primary btn-agregar">Agregar al carrito</button>
      </div>
    `;

    col.appendChild(card);
    row.appendChild(col);
  });

  contenedor.appendChild(row);
}

function mostrarErrorAlUsuario(mensaje) {
  const toast = document.createElement('div');
  toast.className = 'position-fixed bottom-0 end-0 p-3';
  toast.innerHTML = `
    <div class="toast show" role="alert">
      <div class="toast-header bg-danger text-white">
        <strong class="me-auto">Error</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">${mensaje}</div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}