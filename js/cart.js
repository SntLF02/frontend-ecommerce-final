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
}

// 2. Actualizar estado
function updateCartState() {
    localStorage.setItem('baristaCart', JSON.stringify(cart));
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountBubble) cartCountBubble.innerText = totalItems;
    if (cartModal && cartModal.style.display === 'flex') renderCartUI();
}

// 3. Modificar Cantidad
function updateQuantity(index, change) {
    const item = cart[index];
    const newQty = item.quantity + change;

    if (newQty > 0 && newQty <= item.stock) {
        item.quantity = newQty;
    } else if (newQty <= 0) {
        if (confirm("¿Eliminar producto del carrito?")) {
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
    
    // Inicializar estado visual de dirección
    toggleAddressInput();
}

function removeFromCart(index) {
    if(confirm("¿Eliminar items?")) {
        cart.splice(index, 1);
        updateCartState();
    }
}

function clearCart() {
    if (cart.length > 0 && confirm("¿Vaciar carrito?")) {
        cart = [];
        updateCartState();
    }
}

// --- LÓGICA DE DIRECCIONES ---

function toggleAddressInput() {
    const method = document.getElementById('delivery-method').value;
    const addressContainer = document.getElementById('address-input-container');
    const storeAddress = document.getElementById('store-address-display');
    
    // Método 1 = Retiro en Tienda
    if (method === "1") {
        addressContainer.style.display = 'none';
        storeAddress.style.display = 'block';
    } else {
        addressContainer.style.display = 'block';
        storeAddress.style.display = 'none';
    }
}

// Mostrar direcciones guardadas al hacer click en el input
async function showSavedAddresses() {
    const currentUser = JSON.parse(localStorage.getItem('baristaUser'));
    if (!currentUser) return; // Si no está logueado, no mostramos nada

    const listContainer = document.getElementById('saved-addresses-list');
    listContainer.innerHTML = 'Loading...';
    listContainer.style.display = 'block';

    try {
        // Obtenemos todas las direcciones 
        const response = await fetch(`${API_URL}/addresses`);
        const allAddresses = await response.json();
        
        // Filtramos las del usuario actual
        const myAddresses = allAddresses.filter(a => a.client_id === currentUser.id_key);

        listContainer.innerHTML = ''; // Limpiar

        if (myAddresses.length === 0) {
            listContainer.innerHTML = '<div class="address-option" style="cursor:default; color:#999;">No tienes direcciones guardadas</div>';
        } else {
            myAddresses.forEach(addr => {
                const div = document.createElement('div');
                div.className = 'address-option';
                const fullText = `${addr.street} ${addr.number}`; 
                div.textContent = `📍 ${fullText} - ${addr.city}`;
                
                div.onclick = () => {
                    document.getElementById('delivery-address').value = fullText;
                    listContainer.style.display = 'none';
                };
                listContainer.appendChild(div);
            });
        }

        document.addEventListener('click', function closeList(e) {
            if (!e.target.closest('#address-input-container')) {
                listContainer.style.display = 'none';
                document.removeEventListener('click', closeList);
            }
        });

    } catch (error) {
        console.error("Error fetching addresses:", error);
        listContainer.style.display = 'none';
    }
}

// Guardar la dirección actual en la API
async function saveCurrentAddress() {
    const currentUser = JSON.parse(localStorage.getItem('baristaUser'));
    if (!currentUser) return alert("Inicia sesión para guardar direcciones.");

    const inputVal = document.getElementById('delivery-address').value.trim();
    if (!inputVal) return alert("Escribe una dirección primero.");

    const match = inputVal.match(/(\d+)$/); 
    
    let street, number;
    if (match) {
        number = match[0];
        street = inputVal.replace(number, '').trim();
    } else {
        street = inputVal;
        number = "S/N";
    }

    const addressData = {
        street: street,
        number: number,
        city: "Mendoza", // Default para el TP
        client_id: currentUser.id_key
    };

    try {
        const response = await fetch(`${API_URL}/addresses/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addressData)
        });

        if (!response.ok) throw new Error("Error API");
        
        alert("✅ Dirección guardada en tu cuenta.");
        // Ocultar lista por si quedó abierta
        document.getElementById('saved-addresses-list').style.display = 'none';

    } catch (error) {
        console.error(error);
        alert("No se pudo guardar la dirección.");
    }
}

// 5. CHECKOUT FINAL
async function checkout() {
    const currentUser = JSON.parse(localStorage.getItem('baristaUser'));
    if (!currentUser) {
        alert("🔒 Inicia sesión para finalizar la compra.");
        showSection('login');
        toggleCart();
        return;
    }

    if (cart.length === 0) return alert("El carrito está vacío");

    const paymentSelect = document.getElementById('payment-method');
    const deliverySelect = document.getElementById('delivery-method');
    const addressInput = document.getElementById('delivery-address');

    const paymentType = parseInt(paymentSelect.value);
    const deliveryMethod = parseInt(deliverySelect.value);
    const address = addressInput.value.trim();

    // Validación
    if ((deliveryMethod === 3 || deliveryMethod === 2) && address === "") {
        alert("⚠️ Por favor ingresa una dirección de envío.");
        return;
    }

    // Confirmación
    const totalEstimado = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const confirmMsg = `
    📝 Resumen del Pedido:
    ----------------------
    Total: $${totalEstimado.toLocaleString()}
    Pago: ${paymentSelect.options[paymentSelect.selectedIndex].text}
    Envío: ${deliverySelect.options[deliverySelect.selectedIndex].text}
    ${deliveryMethod !== 1 ? `Dirección: ${address}` : 'Retiro en: Av. San Martín 1450'}
    
    ¿Confirmar compra?
    `;

    if (!confirm(confirmMsg)) return;

    const btnCheckout = document.getElementById('btn-checkout');
    btnCheckout.innerText = "Procesando...";
    btnCheckout.disabled = true;

    try {
        // A. Factura
        const billRes = await fetch(`${API_URL}/bills/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bill_number: `F-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                total: totalEstimado,
                payment_type: paymentType,
                client_id: currentUser.id_key
            })
        });

        if (!billRes.ok) throw new Error("Error Factura");
        const newBill = await billRes.json();

        // B. Orden
        const orderRes = await fetch(`${API_URL}/orders/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: new Date().toISOString(),
                total: totalEstimado,
                delivery_method: deliveryMethod,
                status: 1, // PENDING
                client_id: currentUser.id_key,
                bill_id: newBill.id_key
            })
        });

        if (!orderRes.ok) throw new Error("Error Orden");
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

        alert(`¡Gracias por tu compra! ☕\nPedido #${newOrder.id_key} confirmado.`);
        cart = [];
        updateCartState();
        toggleCart();
        showSection('profile');

    } catch (error) {
        console.error(error);
        alert("Error procesando la compra.");
    } finally {
        btnCheckout.innerText = "Confirmar Compra 💳";
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

document.addEventListener('DOMContentLoaded', updateCartState);