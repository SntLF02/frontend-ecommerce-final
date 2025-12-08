const profileContainer = document.getElementById('profile-content');

async function loadUserProfile() {
    if (!currentUser) return;

    profileContainer.innerHTML = '<p>Cargando tu historial...</p>';

    try {
        // 1. Obtener todas las órdenes
        const response = await fetch(`${API_URL}/orders/`);
        const allOrders = await response.json();

        // 2. Filtrar órdenes del usuario actual
        const myOrders = allOrders.filter(o => o.client_id === currentUser.id_key);

        renderProfile(myOrders);

    } catch (error) {
        console.error(error);
        profileContainer.innerHTML = '<p style="color:red">Error cargando perfil.</p>';
    }
}

function renderProfile(orders) {
    if (orders.length === 0) {
        profileContainer.innerHTML = `
            <h3>Hola, ${currentUser.name} ${currentUser.lastname}</h3>
            <p>Aún no has realizado compras.</p>
            <button onclick="showSection('products')" class="btn-primary">Ir al Catálogo</button>
        `;
        return;
    }

    let html = `
        <div class="profile-header">
            <h2>Mi Cuenta</h2>
            <div class="user-card">
                <p><strong>Nombre:</strong> ${currentUser.name} ${currentUser.lastname}</p>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Teléfono:</strong> ${currentUser.telephone}</p>
            </div>
        </div>
        <h3>Historial de Pedidos (${orders.length})</h3>
        <div class="orders-list">
    `;

    // Ordenar por fecha (más reciente primero)
    orders.reverse().forEach(order => {
        const date = new Date(order.date).toLocaleDateString();
        const statusColor = order.status === 'PENDING' ? '#f39c12' : '#27ae60';
        
        html += `
            <div class="order-card">
                <div class="order-header">
                    <span>📅 ${date}</span>
                    <span style="color: ${statusColor}; font-weight:bold;">${order.status}</span>
                </div>
                <div class="order-body">
                    <p>Total: <strong>$${order.total.toLocaleString()}</strong></p>
                    <p>Envío: ${order.delivery_method}</p>
                    <p style="font-size: 0.8rem; color: #777;">ID Orden: ${order.id_key}</p>
                </div>
            </div>
        `;
    });

    html += '</div>';
    profileContainer.innerHTML = html;
}