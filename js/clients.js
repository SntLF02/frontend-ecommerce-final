// Referencias al HTML
const clientsContainer = document.getElementById('clientsList');
const btnLoad = document.getElementById('btnLoadClients');

// Función para obtener clientes de la API
async function fetchClients() {
    try {
        // Mostramos mensaje de carga
        clientsContainer.innerHTML = '<p>Cargando datos...</p>';

        // Hacemos la petición al Backend
        const response = await fetch(`${API_URL}/clients`);
        
        // Si la respuesta no es OK, lanzamos error
        if (!response.ok) throw new Error('Error al conectar con la API');

        // Convertimos la respuesta a JSON
        const clients = await response.json();
        console.log("Clientes recibidos:", clients);

        // Dibujamos los clientes
        renderClients(clients);

    } catch (error) {
        console.error("Error:", error);
        clientsContainer.innerHTML = `<p style="color: red">Error al cargar clientes: ${error.message}</p>`;
    }
}

// Función para dibujar las tarjetas en el HTML
function renderClients(clients) {
    clientsContainer.innerHTML = ''; // Limpiar contenedor

    if (clients.length === 0) {
        clientsContainer.innerHTML = '<p>No hay clientes registrados.</p>';
        return;
    }

    clients.forEach(client => {
        // Creamos el HTML de cada tarjeta
        const card = document.createElement('div');
        card.classList.add('card');
        
        card.innerHTML = `
            <h3>${client.name} ${client.lastname}</h3>
            <p><span class="card-email">${client.email}</span></p>
            <p>${client.telephone || 'Sin teléfono'}</p>
        `;
        
        clientsContainer.appendChild(card);
    });
}

// Eventos
btnLoad.addEventListener('click', fetchClients);

// Cargar automáticamente al abrir la página
document.addEventListener('DOMContentLoaded', fetchClients);