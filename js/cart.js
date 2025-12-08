// Estado del carrito (se inicia leyendo del LocalStorage si existe)
let cart = JSON.parse(localStorage.getItem('baristaCart')) || [];

// Elementos del DOM (Los crearemos en el HTML en el paso 2)
const cartCountBubble = document.getElementById('cart-count');
const cartTotalElement = document.getElementById('cart-total');
const cartItemsContainer = document.getElementById('cart-items');
const cartModal = document.getElementById('cart-modal');

// 1. Función para agregar al carrito
function addToCart(product) {
    // Buscamos si ya existe para sumar cantidad
    const existingItem = cart.find(item => item.id_key === product.id_key);

    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert("¡No hay más stock disponible de este producto!");
            return;
        }
    } else {
        // Si no existe, lo agregamos nuevo
        cart.push({ ...product, quantity: 1 });
    }

    updateCartState();
    alert(`✅ ${product.name} agregado al carrito`);
}

// 2. Actualizar estado (Guardar y Renderizar)
function updateCartState() {
    // Guardar en el navegador (Persistencia)
    localStorage.setItem('baristaCart', JSON.stringify(cart));
    
    // Actualizar burbuja del menú
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountBubble) cartCountBubble.innerText = totalItems;

    // Si el modal está abierto, redibujarlo
    if (cartModal && cartModal.style.display === 'flex') {
        renderCartUI();
    }
}

// 3. Dibujar el Carrito (HTML)
function renderCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color:#999;">Tu carrito está vacío ☕</p>';
    } else {
        cart.forEach((item, index) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            itemDiv.innerHTML = `
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toLocaleString()} x ${item.quantity}</p>
                </div>
                <div class="item-actions">
                    <p class="item-subtotal">$${subtotal.toLocaleString()}</p>
                    <button onclick="removeFromCart(${index})" class="btn-delete">🗑️</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });
    }

    cartTotalElement.innerText = `$${total.toLocaleString()}`;
}

// 4. Eliminar Item
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartState();
}

// 5. Vaciar Carrito
function clearCart() {
    if(!confirm("¿Vaciar carrito?")) return;
    cart = [];
    updateCartState();
}

// 6. CHECKOUT (La Transacción ACID del video)
async function checkout() {
    if (cart.length === 0) return alert("El carrito está vacío");
    
    // Botón en estado de carga
    const btnCheckout = document.getElementById('btn-checkout');
    btnCheckout.innerText = "Procesando...";
    btnCheckout.disabled = true;

    try {
        // A. Crear la Orden (Cabecera)
        const totalOrder = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const orderData = {
            date: new Date().toISOString(),
            total: totalOrder,
            delivery_method: "DELIVERY", 
            status: "PENDING",
            client_id: 1,  // HARDCODED_CLIENT_ID
            bill_id: 1     // HARDCODED_BILL_ID
        };

        const orderRes = await fetch(`${API_URL}/orders/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!orderRes.ok) throw new Error("Error creando la orden");
        const newOrder = await orderRes.json();
        console.log("✅ Orden Creada ID:", newOrder.id_key);

        // B. Crear los Detalles
        const detailPromises = cart.map(item => {
            return fetch(`${API_URL}/order_details/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity: item.quantity,
                    price: item.price,
                    order_id: newOrder.id_key,
                    product_id: item.id_key
                })
            });
        });

        await Promise.all(detailPromises);

        // C. Éxito
        alert(`¡Compra Exitosa! 🎉\nOrden #${newOrder.id_key} generada correctamente.`);
        cart = []; // Vaciar carrito
        updateCartState();
        toggleCart(); // Cerrar modal

    } catch (error) {
        console.error(error);
        alert("Error en la transacción: " + error.message);
    } finally {
        btnCheckout.innerText = "Confirmar Compra ($)";
        btnCheckout.disabled = false;
    }
}

// Funciones para abrir/cerrar el modal
function toggleCart() {
    if (cartModal.style.display === 'flex') {
        cartModal.style.display = 'none';
    } else {
        cartModal.style.display = 'flex';
        renderCartUI();
    }
}

// Inicializar burbuja al cargar
document.addEventListener('DOMContentLoaded', updateCartState);