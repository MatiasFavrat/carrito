document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api/paquetes';
    
    // Selectores actualizados para usar IDs específicos
    const formAnadir = document.getElementById('form-anadir');
    const formEditar = document.getElementById('form-editar');
    const formEliminar = document.getElementById('form-eliminar');
    
    const nombrePaqueteInput = document.getElementById('NombrePaquete');
    const valorPaqueteInput = document.getElementById('ValorPaquete');
    const descripcionPaqueteInput = document.getElementById('DescripcionPaquete');
    const urlImagenInput = document.getElementById('URLImagen');
    const paqueteEditaSelect = document.getElementById('paqueteEdita');
    const paqueteEliminaSelect = document.getElementById('paqueteElimina');
    const mensajeDiv = document.getElementById('mensaje');
    
    const btnAnadir = document.getElementById('botonAñadir');
    const btnEditar = document.getElementById('editar');
    const btnEliminar = document.getElementById('eliminar');

    // Función para cargar paquetes
    async function cargarPaquetes() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Error al cargar paquetes');
            const paquetes = await response.json();
            
            paqueteEditaSelect.innerHTML = '<option value="">Seleccionar...</option>';
            paqueteEliminaSelect.innerHTML = '<option value="">Seleccionar...</option>';
            
            paquetes.forEach(paquete => {
                const option = document.createElement('option');
                option.value = paquete.id_product;
                option.textContent = paquete.product_name;
                paqueteEditaSelect.appendChild(option);
                paqueteEliminaSelect.appendChild(option.cloneNode(true));
            });
            
            mostrarPaquetes(paquetes);
        } catch (error) {
            mostrarMensaje(`Error: ${error.message}`, 'error');
        }
    }

    // Función para mostrar paquetes
    function mostrarPaquetes(paquetes) {
        const contenedor = document.getElementById('mostrar-paquetes');
        contenedor.innerHTML = '';
        
        paquetes.forEach(paquete => {
            const card = document.createElement('div');
            card.className = 'contenedor-paquete';
            card.innerHTML = `
                <img src="${paquete.product_image}" alt="${paquete.product_name}">
                <div class="informacion">
                    <h3>${paquete.product_name}</h3>
                    <p class="descripcion">${paquete.product_description}</p>
                    <p class="precio">$${paquete.product_unit_price.toLocaleString()}</p>
                </div>
            `;
            contenedor.appendChild(card);
        });
    }

    // Cargar datos al seleccionar paquete para editar
    paqueteEditaSelect.addEventListener('change', async (e) => {
        const id = e.target.value;
        if (!id) return;
        
        try {
            const response = await fetch(`${API_URL}/${id}`);
            if (!response.ok) throw new Error('Error al cargar paquete');
            const paquete = await response.json();
            
            document.getElementById('EditarNombrePaquete').value = paquete.product_name;
            document.getElementById('EditarValorPaquete').value = paquete.product_unit_price;
            document.getElementById('EditarDescripcionPaquete').value = paquete.product_description;
            document.getElementById('EditarURLImagen').value = paquete.product_image;
        } catch (error) {
            mostrarMensaje(`Error: ${error.message}`, 'error');
        }
    });

    // Evento para añadir paquete
    btnAnadir.addEventListener('click', async () => {
        const paquete = {
            nombre: nombrePaqueteInput.value,
            precio: parseFloat(valorPaqueteInput.value),
            descripcion: descripcionPaqueteInput.value,
            imagen: urlImagenInput.value
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paquete)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al añadir paquete');
            }
            
            mostrarMensaje('Paquete añadido con éxito', 'success');
            formAnadir.reset();
            cargarPaquetes();
        } catch (error) {
            mostrarMensaje(`Error: ${error.message}`, 'error');
        }
    });

    // Evento para editar paquete
    btnEditar.addEventListener('click', async () => {
        const id = paqueteEditaSelect.value;
        if (!id) {
            mostrarMensaje('Selecciona un paquete para editar', 'error');
            return;
        }
        
        const paqueteActualizado = {
            nombre: document.getElementById('EditarNombrePaquete').value,
            precio: parseFloat(document.getElementById('EditarValorPaquete').value),
            descripcion: document.getElementById('EditarDescripcionPaquete').value,
            imagen: document.getElementById('EditarURLImagen').value
        };
        
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paqueteActualizado)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar');
            }
            
            mostrarMensaje('Paquete actualizado con éxito', 'success');
            cargarPaquetes();
            formEditar.reset();
        } catch (error) {
            mostrarMensaje(`Error: ${error.message}`, 'error');
        }
    });

    // Evento para eliminar paquete
    btnEliminar.addEventListener('click', async () => {
        const id = paqueteEliminaSelect.value;
        if (!id) {
            mostrarMensaje('Selecciona un paquete para eliminar', 'error');
            return;
        }

        if (!confirm('¿Estás seguro de eliminar este paquete?')) return;

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar');
            }
            
            mostrarMensaje('Paquete eliminado con éxito', 'success');
            cargarPaquetes();
            formEliminar.reset();
        } catch (error) {
            mostrarMensaje(`Error: ${error.message}`, 'error');
        }
    });

    // Función para mostrar mensajes
    function mostrarMensaje(texto, tipo) {
        mensajeDiv.textContent = texto;
        mensajeDiv.className = `mensaje ${tipo}`;
        mensajeDiv.style.display = 'block';
        
        setTimeout(() => {
            mensajeDiv.style.display = 'none';
        }, 3000);
    }

    // Carga inicial
    cargarPaquetes();
});