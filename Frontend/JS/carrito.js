import { authHeader } from './auth.js';

class Carrito {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('carrito')) || [];
    this.subscribers = [];
  }


  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify() {
    this.subscribers.forEach(cb => cb(this.items));
    localStorage.setItem('carrito', JSON.stringify(this.items));
  }

  agregarItem(id, nombre, precio, imagen) {
    const itemExistente = this.items.find(item => item.id === id);

    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      this.items.push({
        id,
        nombre,
        precio: Number(precio) || 0, // Asegurar que sea número
        imagen,
        cantidad: 1
      });
    }

    this.notify();
  }

  actualizarCantidad(id, nuevaCantidad) {
    const item = this.items.find(item => item.id === id);
    if (!item) return;

    item.cantidad = nuevaCantidad;
    this.notify();
  }

  eliminarItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.notify();
  }

  vaciarCarrito() {
    this.items = [];
    this.notify();
  }

  get total() {
    return this.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  }

  get cantidadItems() {
    return this.items.reduce((sum, item) => sum + item.cantidad, 0);
  }

  async sincronizarBackend() {
    try {
      const response = await fetch('http://localhost:3000/api/carrito/sincronizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          items: this.items
        })
      });

      if (!response.ok) {
        throw new Error('Error al sincronizar carrito');
      }
    } catch (error) {
      console.error('Error al sincronizar carrito:', error);
      throw error;
    }
  }

  async cargarDesdeBackend() {
    try {
      const response = await fetch('http://localhost:3000/api/carrito', {
        headers: authHeader()
      });

      if (!response.ok) {
        throw new Error('Error al cargar carrito');
      }

      const data = await response.json();
      this.items = data.carrito || [];
      this.notify();
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      throw error;
    }
  }
}

export const carrito = new Carrito();

// Función para actualizar el contador del carrito en la interfaz
function actualizarContadorCarrito(cantidad) {
  const badge = document.getElementById('badge-carrito');
  const prevCount = parseInt(badge.textContent) || 0;

  badge.textContent = cantidad;

  // Only animate when adding items
  badge.classList.remove('pop-notification');
  void badge.offsetWidth; // Forzar reflow
  badge.classList.add('pop-notification');
}

// Suscribir esta función al carrito
carrito.subscribe(items => {
  const cantidad = carrito.cantidadItems;
  actualizarContadorCarrito(cantidad);
});