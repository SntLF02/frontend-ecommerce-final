const productsContainer = document.getElementById('productsList');
const filtersContainer = document.getElementById('categoryFilters');

const HARDCODED_CLIENT_ID = 1; 
const HARDCODED_BILL_ID = 1;   

let allProducts = []; 
let allCategories = [];

// 1. Cargar Categorías y Productos al inicio
async function fetchProducts() {
    try {
        productsContainer.innerHTML = '<p style="text-align:center">Moliendo granos...</p>';
        
        const [productsRes, categoriesRes] = await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/categories`)
        ]);

        if (!productsRes.ok || !categoriesRes.ok) throw new Error('Error conectando con API');

        allProducts = await productsRes.json();
        allCategories = await categoriesRes.json();

        // Renderizar Filtros y Productos
        renderFilters();
        renderProducts(allProducts); // Mostrar todos al principio

    } catch (error) {
        console.error("❌ Error:", error);
        productsContainer.innerHTML = `<p style="color: red; text-align:center">Error de conexión: ${error.message}</p>`;
    }
}

// 2. Dibujar Botones de Categoría
function renderFilters() {
    filtersContainer.innerHTML = '';

    // Botón "Todos"
    const btnAll = document.createElement('button');
    btnAll.className = 'filter-btn active';
    btnAll.textContent = 'Todos';
    btnAll.onclick = () => filterProducts('all', btnAll);
    filtersContainer.appendChild(btnAll);

    // Botones dinámicos desde la API
    allCategories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = cat.name;
        btn.onclick = () => filterProducts(cat.id_key, btn); 
        filtersContainer.appendChild(btn);
    });
}

// 3. Lógica de Filtrado
function filterProducts(categoryId, btnElement) {
    // Actualizar clase visual 'active'
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');

    if (categoryId === 'all') {
        renderProducts(allProducts);
    } else {
        // Filtrar array en memoria
        const filtered = allProducts.filter(p => p.category_id === categoryId);
        renderProducts(filtered);
    }
}

// 4. Dibujar Tarjetas
function renderProducts(productsToRender) {
    productsContainer.innerHTML = '';

    if (productsToRender.length === 0) {
        productsContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">No se encontraron productos.</p>';
        return;
    }

    productsToRender.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('card');
        
        // Stock Display
        let stockDisplay = `Stock: ${product.stock}`;
        if (product.stock < 5) {
            stockDisplay += ` <span class="stock-warning">¡ÚLTIMAS ${product.stock}!</span>`;
        }

        // Input ID único para este producto
        const inputId = `qty-${product.id_key}`;

        card.innerHTML = `
            <div>
                <h3>${product.name}</h3>
                <p class="stock-tag">${stockDisplay}</p>
            </div>
            <div>
                <p class="price-tag">$${product.price.toLocaleString()}</p>
                
                <div class="product-actions" style="display: flex; gap: 10px; align-items: center; margin-top: 10px;">
                    <input type="number" id="${inputId}" value="1" min="1" max="${product.stock}" 
                           style="width: 60px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; text-align: center;">
                    
                    <button class="btn-primary" onclick="addProductFromCard(${product.id_key})" style="margin-top:0; flex:1;">
                        Agregar 🛒
                    </button>
                </div>
            </div>
        `;
        productsContainer.appendChild(card);
    });
}

function addProductFromCard(productId) {
    const product = allProducts.find(p => p.id_key === productId);
    const input = document.getElementById(`qty-${productId}`);
    const qty = parseInt(input.value);

    if (product && qty > 0) {
        addToCart(product, qty);
        input.value = 1; // Resetear input
    }
}

// 5. Lógica de Compra (Transacción)
async function buyProduct(productId, price, productName) {
    if (!confirm(`¿Confirmar compra de "${productName}"?`)) return;

    try {
        // A. Crear Orden
        const orderData = {
            date: new Date().toISOString(),
            total: price,
            delivery_method: "DELIVERY",
            status: "PENDING",
            client_id: HARDCODED_CLIENT_ID,
            bill_id: HARDCODED_BILL_ID
        };

        const orderRes = await fetch(`${API_URL}/orders/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!orderRes.ok) throw new Error("Error creando orden");
        const newOrder = await orderRes.json();

        // B. Crear Detalle
        const detailData = {
            quantity: 1,
            price: price,
            order_id: newOrder.id_key,
            product_id: productId
        };

        const detailRes = await fetch(`${API_URL}/order_details/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(detailData)
        });

        if (!detailRes.ok) throw new Error("Error en detalle de orden");

        alert(`¡Pedido #${newOrder.id_key} confirmado! Gracias por elegir Barista Coffee.`);
        fetchProducts(); // Recargar para actualizar stock

    } catch (error) {
        console.error(error);
        alert("Hubo un error al procesar el pedido. Revisa la consola.");
    }
}