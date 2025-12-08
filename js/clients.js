// Referencias al HTML
const clientsContainer = document.getElementById('clientsList');
const btnLoad = document.getElementById('btnLoadClients');

// Formulario de creación de cliente
const formCreateClient = document.getElementById('formCreateClient');
const msgContainer = document.getElementById('formMessage');

// Función para obtener clientes de la API
async function fetchClients() {
    if (!clientsContainer) return; // Protección

    try {
        clientsContainer.innerHTML = '<p>Cargando datos...</p>';
        const response = await fetch(`${API_URL}/clients`);
        
        if (!response.ok) throw new Error('Error al conectar con la API');

        const clients = await response.json();
        renderClients(clients);

    } catch (error) {
        console.error("❌ Error:", error);
        clientsContainer.innerHTML = `<p style="color: red">Error: ${error.message}</p>`;
    }
}

function renderClients(clients) {
    if (!clientsContainer) return;
    clientsContainer.innerHTML = ''; 

    if (clients.length === 0) {
        clientsContainer.innerHTML = '<p>No hay clientes registrados.</p>';
        return;
    }

    clients.forEach(client => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <h3>${client.name} ${client.lastname}</h3>
            <p>📧 <span class="card-email">${client.email}</span></p>
            <p>📞 ${client.telephone || 'Sin teléfono'}</p>
        `;
        clientsContainer.appendChild(card);
    });
}

// --- EVENTOS ---

if (btnLoad) {
    btnLoad.addEventListener('click', fetchClients);
}

if (formCreateClient) {
    formCreateClient.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newClient = {
            name: document.getElementById('clientName').value,
            lastname: document.getElementById('clientLastname').value,
            email: document.getElementById('clientEmail').value,
            telephone: document.getElementById('clientPhone').value
        };

        try {
            if(msgContainer) msgContainer.innerHTML = '<p style="color: blue">Enviando...</p>';
            
            const response = await fetch(`${API_URL}/clients/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newClient)
            });

            if (!response.ok) throw new Error('Error al crear cliente');

            if(msgContainer) msgContainer.innerHTML = '<p style="color: green">✅ ¡Cliente creado!</p>';
            formCreateClient.reset();
            fetchClients();
            setTimeout(() => { if(msgContainer) msgContainer.innerHTML = ''; }, 3000);

        } catch (error) {
            console.error(error);
            if(msgContainer) msgContainer.innerHTML = `<p style="color: red">Error: ${error.message}</p>`;
        }
    });
}

// document.addEventListener('DOMContentLoaded', fetchClients);