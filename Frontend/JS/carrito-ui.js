import { carrito } from './carrito.js';

export class CarritoUI {
  constructor() {
    this.panel = document.getElementById('panel-carrito');
    this.lista = document.getElementById('lista-carrito');
    this.botonCarrito = document.getElementById('btn-carrito-header');
    this.botonCerrar = document.getElementById('cerrar-carrito');
    this.contador = document.getElementById('contador-carrito');
    this.totalElement = document.getElementById('total-carrito');
    this.botonPago = document.getElementById('proceder-pago');
    this.mensajeVacio = document.getElementById('carrito-vacio');
    this.badgeCarrito = document.getElementById('badge-carrito');

    this.iniciarEventos();
    carrito.subscribe(this.actualizarVista.bind(this));
    this.actualizarVista(carrito.items); // Actualizar al iniciar
  }

  iniciarEventos() {
    this.botonCarrito.addEventListener('click', () => this.abrirCarrito());
    this.botonCerrar.addEventListener('click', () => this.cerrarCarrito());
    this.botonPago.addEventListener('click', () => this.procederAlPago());

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-agregar')) {
        const card = e.target.closest('.card');
        const id = card.dataset.id;
        const nombre = card.dataset.nombre;
        const precio = parseFloat(card.dataset.precio);
        const imagen = card.querySelector('img').src;
        carrito.agregarItem(id, nombre, precio, imagen);
      }
    });

    this.lista.addEventListener('click', (e) => {
      if (e.target.closest('.btn-eliminar')) {
        const id = e.target.closest('.btn-eliminar').dataset.id;
        carrito.eliminarItem(id);
      }
    });

    this.lista.addEventListener('change', (e) => {
      if (e.target.classList.contains('cantidad-input')) {
        const id = e.target.dataset.id;
        const nuevaCantidad = parseInt(e.target.value);
        if (nuevaCantidad > 0) {
          carrito.actualizarCantidad(id, nuevaCantidad);
        } else {
          e.target.value = 1;
        }
      }
    });
  }

  abrirCarrito() {
    this.panel.classList.add('abierto');
    document.body.classList.add('carrito-abierto');
  }

  cerrarCarrito() {
    this.panel.classList.remove('abierto');
    document.body.classList.remove('carrito-abierto');
  }

  procederAlPago() {
    if (carrito.items.length === 0) return;

    // Simulamos un proceso de pago
    setTimeout(() => {
      alert(`¡Pago exitoso! Total: $${carrito.total.toFixed(2)}`);
      carrito.vaciarCarrito();
      this.cerrarCarrito();
    }, 1000);
  }

  actualizarVista(items) {
    const listaCarrito = document.getElementById('lista-carrito');
    const totalCarrito = document.getElementById('total-carrito');
    const carritoVacio = document.getElementById('carrito-vacio');
    const contadorCarrito = document.getElementById('contador-carrito');
    const botonPago = document.getElementById('proceder-pago');
    const badgeCarrito = document.getElementById('badge-carrito');

    // Calcular cantidad total de items
    const cantidadTotal = items.reduce((sum, item) => sum + item.cantidad, 0);

    // Actualizar ambos contadores
    contadorCarrito.textContent = cantidadTotal;
    badgeCarrito.textContent = cantidadTotal;

    if (items.length === 0) {
      listaCarrito.innerHTML = '';
      carritoVacio.style.display = 'block';
      totalCarrito.textContent = '$0.00';
      botonPago.disabled = true;
      return;
    }

    carritoVacio.style.display = 'none';
    listaCarrito.innerHTML = '';
    botonPago.disabled = false;

    items.forEach(item => {
      const precio = Number(item.precio) || 0;
      const subtotal = precio * item.cantidad;
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <img src="${item.imagen}" width="50" height="50" class="me-3 rounded">
            <div>
              <h6 class="mb-0">${item.nombre}</h6>
              <small>$${precio.toFixed(2)} c/u</small>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <input type="number" min="1" value="${item.cantidad}" 
                   class="form-control form-control-sm cantidad-input me-2" 
                   style="width: 60px" data-id="${item.id}">
            <span class="me-3">$${subtotal.toFixed(2)}</span>
            <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${item.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;
      listaCarrito.appendChild(li);
    });

    const total = items.reduce((sum, item) => {
      const precio = Number(item.precio) || 0;
      return sum + (precio * item.cantidad);
    }, 0);

    totalCarrito.textContent = `$${total.toFixed(2)}`;
  }
}