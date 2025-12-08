// Estado del carrito
let cart = JSON.parse(localStorage.getItem('baristaCart')) || [];

// Elementos del DOM
const cartCountBubble = document.getElementById('cart-count');
const cartTotalElement = document.getElementById('cart-total');
const cartItemsContainer = document.getElementById('cart-items');
const cartModal = document.getElementById('cart-modal');

// 1. Agregar al carrito
function addToCart(product, qty = 1) {
    const existingItem = cart.find(item => item.id_key === product.id_key);

    if (existingItem) {
        if (existingItem.quantity + qty <= product.stock) {
            existingItem.quantity += qty;
        } else {
            alert("¡No hay suficiente stock disponible!");
            return;
        }
    } else {
        if (qty > product.stock) {
            alert("¡No hay suficiente stock!");
            return;
        }
        cart.push({ ...product, quantity: qty });
    }

    updateCartState();
    console.log(`✅ Agregado: ${qty} x ${product.name}`);
    // Opcional: Abrir carrito automáticamente al agregar
    // if (cartModal.style.display === 'none') toggleCart();
}

// 2. Actualizar estado y LocalStorage
function updateCartState() {
    localStorage.setItem('baristaCart', JSON.stringify(cart));
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountBubble) cartCountBubble.innerText = totalItems;
    if (cartModal && cartModal.style.display === 'flex') renderCartUI();
}

// 3. Modificar Cantidad (+/-) desde el Carrito
function updateQuantity(index, change) {
    const item = cart[index];
    const newQty = item.quantity + change;

    if (newQty > 0 && newQty <= item.stock) {
        item.quantity = newQty;
    } else if (newQty <= 0) {
        // Si baja a 0, preguntamos si borrar
        if (confirm("¿Quitar este producto del pedido?")) {
            cart.splice(index, 1);
        }
    } else {
        alert("Stock máximo alcanzado");
    }
    updateCartState();
}

// 4. Dibujar el Carrito
function renderCartUI() {
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Tu carrito está vacío ☕</p>';
    } else {
        cart.forEach((item, index) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            
            // Aquí está el contador que pediste dentro del carrito
            itemDiv.innerHTML = `
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p class="item-price">$${item.price.toLocaleString()}</p>
                </div>
                <div class="item-controls" style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="updateQuantity(${index}, -1)" class="btn-qty" style="width:25px; height:25px; border-radius:50%; border:none; background:#ddd; cursor:pointer;">-</button>
                    <span class="qty-display" style="font-weight:bold;">${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)" class="btn-qty" style="width:25px; height:25px; border-radius:50%; border:none; background:#d4a373; color:white; cursor:pointer;">+</button>
                </div>
                <div class="item-actions">
                    <p class="item-subtotal" style="font-weight:bold;">$${subtotal.toLocaleString()}</p>
                    <button onclick="removeFromCart(${index})" class="btn-delete" title="Eliminar línea" style="background:none; border:none; cursor:pointer;">🗑️</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });
    }
    if(cartTotalElement) cartTotalElement.innerText = `$${total.toLocaleString()}`;
}

function removeFromCart(index) {
    // El icono de basura borra la línea completa (todos los productos de ese tipo)
    if(confirm("¿Eliminar todos los items de este producto?")) {
        cart.splice(index, 1);
        updateCartState();
    }
}

function clearCart() {
    if (cart.length > 0 && confirm("¿Vaciar carrito por completo?")) {
        cart = [];
        updateCartState();
    }
}

// 5. CHECKOUT
async function checkout() {
    const currentUser = JSON.parse(localStorage.getItem('baristaUser'));
    if (!currentUser) {
        alert("🔒 Inicia sesión para finalizar la compra.");
        showSection('login');
        toggleCart();
        return;
    }

    if (cart.length === 0) return alert("El carrito está vacío");

    // 1. CAPTURAR DATOS DEL FORMULARIO
    const paymentSelect = document.getElementById('payment-method');
    const deliverySelect = document.getElementById('delivery-method');
    const addressInput = document.getElementById('delivery-address');

    const paymentType = parseInt(paymentSelect.value);
    const deliveryMethod = parseInt(deliverySelect.value);
    const address = addressInput.value.trim();

    // Validación simple de dirección
    if ((deliveryMethod === 3 || deliveryMethod === 2) && address === "") {
        alert("⚠️ Por favor ingresa una dirección de envío.");
        return;
    }

    // CONFIRMACIÓN VISUAL
    const totalEstimado = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const confirmMsg = `
    📝 Resumen del Pedido:
    ----------------------
    Total: $${totalEstimado.toLocaleString()}
    Pago: ${paymentSelect.options[paymentSelect.selectedIndex].text}
    Envío: ${deliverySelect.options[deliverySelect.selectedIndex].text}
    ${deliveryMethod !== 1 ? `Dirección: ${address}` : ''}
    
    ¿Confirmar compra?
    `;

    if (!confirm(confirmMsg)) return;

    // 2. PROCESAR COMPRA
    const btnCheckout = document.getElementById('btn-checkout');
    btnCheckout.innerText = "Procesando...";
    btnCheckout.disabled = true;

    try {
        // A. Factura
        const billData = {
            bill_number: `F-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            total: totalEstimado,
            payment_type: paymentType, // Valor dinámico
            client_id: currentUser.id_key
        };

        const billRes = await fetch(`${API_URL}/bills/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(billData)
        });

        if (!billRes.ok) {
            const err = await billRes.json();
            throw new Error(`Error Factura: ${JSON.stringify(err.detail)}`);
        }
        const newBill = await billRes.json();

        // B. Orden
        const orderData = {
            date: new Date().toISOString(),
            total: totalEstimado,
            delivery_method: deliveryMethod, // Valor dinámico
            status: 1, // PENDING
            client_id: currentUser.id_key,
            bill_id: newBill.id_key
        };

        const orderRes = await fetch(`${API_URL}/orders/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!orderRes.ok) {
            const err = await orderRes.json();
            throw new Error(`Error Orden: ${JSON.stringify(err.detail)}`);
        }
        const newOrder = await orderRes.json();

        // C. Detalles
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

        alert(`¡Gracias por tu compra! ☕\nTu pedido está siendo preparado.`);
        cart = [];
        updateCartState();
        toggleCart();
        showSection('profile');

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    } finally {
        btnCheckout.innerText = "Confirmar Compra";
        btnCheckout.disabled = false;
    }
}

function toggleCart() {
    if (!cartModal) return;
    if (cartModal.style.display === 'flex') {
        cartModal.style.display = 'none';
    } else {
        cartModal.style.display = 'flex';
        renderCartUI();
    }
}

// Mostrar/Ocultar dirección según envío
function toggleAddressInput() {
    const method = document.getElementById('delivery-method').value;
    const addressContainer = document.getElementById('address-input-container');
    
    if (method === "1") {
        addressContainer.style.display = 'none';
    } else {
        addressContainer.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', updateCartState);