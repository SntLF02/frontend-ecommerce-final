const profileContainer = document.getElementById('profile-content');

// Diccionarios para traducir los códigos numéricos de la API a texto
const DELIVERY_MAP = {
    1: "🏪 Retiro en Tienda",
    2: "🏃 Delivery Rápido (Apps)",
    3: "🚚 Envío a Domicilio"
};

const STATUS_MAP = {
    1: "⏳ Pendiente",
    2: "🔥 En Preparación",
    3: "✅ Entregado",
    4: "❌ Cancelado"
};

async function loadUserProfile() {
    if (!currentUser) return;

    profileContainer.innerHTML = '<div style="text-align:center; padding:2rem;"><p>Cargando tu historial completo...</p></div>';

    try {
        const [ordersRes, detailsRes, productsRes] = await Promise.all([
            fetch(`${API_URL}/orders/`),
            fetch(`${API_URL}/order_details/`),
            fetch(`${API_URL}/products/`)
        ]);

        const allOrders = await ordersRes.json();
        const allDetails = await detailsRes.json();
        const allProducts = await productsRes.json();

        // Filtrar órdenes de ESTE usuario
        const myOrders = allOrders.filter(o => o.client_id === currentUser.id_key);

        renderProfile(myOrders, allDetails, allProducts);

    } catch (error) {
        console.error(error);
        profileContainer.innerHTML = '<p style="color:red; text-align:center;">Error cargando historial. Intenta recargar.</p>';
    }
}

function renderProfile(orders, allDetails, allProducts) {
    if (orders.length === 0) {
        profileContainer.innerHTML = `
            <div style="text-align:center; padding: 3rem;">
                <h3>¡Hola, ${currentUser.name}! 👋</h3>
                <p style="color:#666;">Aún no tienes pedidos recientes.</p>
                <button onclick="showSection('products')" class="btn-primary" style="margin-top:1rem;">Ir al Catálogo</button>
            </div>
        `;
        return;
    }

    let html = `
        <div class="profile-header" style="margin-bottom: 2rem;">
            <h2 style="font-family: 'Playfair Display', serif; color: #2c1e16;">Mi Cuenta</h2>
            <div class="user-card" style="display:flex; justify-content:space-between; flex-wrap:wrap; align-items:center;">
                <div>
                    <p style="font-size:1.2rem; font-weight:bold; margin-bottom:5px;">${currentUser.name} ${currentUser.lastname}</p>
                    <p style="color:#777; margin:0;">${currentUser.email}</p>
                </div>
                <div style="text-align:right;">
                    <span style="background:#d4a373; color:white; padding:4px 10px; border-radius:15px; font-size:0.8rem;">Cliente Verificado</span>
                </div>
            </div>
        </div>

        <h3 style="border-bottom: 2px solid #e6ccb2; padding-bottom:10px; margin-bottom:20px;">
            Historial de Pedidos (${orders.length})
        </h3>
        
        <div class="orders-list">
    `;

    // Ordenar: Las más nuevas primero
    orders.reverse().forEach(order => {
        const date = new Date(order.date).toLocaleDateString();
        const deliveryText = DELIVERY_MAP[order.delivery_method] || "Método Desconocido";
        const statusText = STATUS_MAP[order.status] || "Desconocido";
        
        const finalStatus = isNaN(order.status) ? order.status : statusText;
        const orderItems = allDetails.filter(d => d.order_id === order.id_key);
        
        let productsHtml = '<ul style="list-style:none; padding:0; margin:10px 0; border-top:1px dashed #eee; padding-top:10px;">';
        
        orderItems.forEach(item => {
            const productInfo = allProducts.find(p => p.id_key === item.product_id);
            const productName = productInfo ? productInfo.name : "Producto Eliminado";
            
            productsHtml += `
                <li style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:5px; color:#555;">
                    <span>${productName} <strong style="color:#2c1e16;">x${item.quantity}</strong></span>
                    <span>$${(item.price * item.quantity).toLocaleString()}</span>
                </li>
            `;
        });
        productsHtml += '</ul>';

        // Renderizar Tarjeta
        html += `
            <div class="order-card" style="margin-bottom: 20px;">
                <div class="order-header" style="background:#fdfbf7; padding:10px; border-radius:5px 5px 0 0; border-bottom:1px solid #eee;">
                    <span style="font-weight:bold; color:#2c1e16;">#${order.id_key} • ${date}</span>
                    <span style="font-weight:bold; color:${finalStatus === 'PENDING' ? '#f39c12' : '#27ae60'}">${finalStatus}</span>
                </div>
                <div class="order-body" style="padding:15px;">
                    <div style="margin-bottom:10px;">
                        <span style="font-size:0.9rem; background:#eee; padding:3px 8px; border-radius:4px;">
                            ${deliveryText}
                        </span>
                    </div>
                    
                    ${productsHtml} <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; padding-top:10px; border-top:2px solid #2c1e16;">
                        <span style="font-size:1.1rem;">Total Pagado:</span>
                        <span style="font-size:1.3rem; font-weight:bold; color:#a98467;">$${order.total.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    profileContainer.innerHTML = html;
}