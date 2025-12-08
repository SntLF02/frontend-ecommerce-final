const productsContainer = document.getElementById('productsList');
const filtersContainer = document.getElementById('categoryFilters');

let allProducts = []; 
let allCategories = [];

// 1. Cargar Datos
async function fetchProducts() {
    try {
        productsContainer.innerHTML = '<p style="text-align:center">Cargando catálogo...</p>';
        
        const [productsRes, categoriesRes] = await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/categories`)
        ]);

        if (!productsRes.ok || !categoriesRes.ok) throw new Error('Error API');

        allProducts = await productsRes.json();
        allCategories = await categoriesRes.json();

        renderFilters();
        renderProducts(allProducts);

    } catch (error) {
        console.error("❌ Error:", error);
        productsContainer.innerHTML = `<p style="color: red; text-align:center">Error: ${error.message}</p>`;
    }
}

// 2. Filtros
function renderFilters() {
    if(!filtersContainer) return;
    filtersContainer.innerHTML = '';

    const btnAll = document.createElement('button');
    btnAll.className = 'filter-btn active';
    btnAll.textContent = 'Todos';
    btnAll.onclick = () => filterProducts('all', btnAll);
    filtersContainer.appendChild(btnAll);

    allCategories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = cat.name;
        btn.onclick = () => filterProducts(cat.id_key, btn); 
        filtersContainer.appendChild(btn);
    });
}

function filterProducts(categoryId, btnElement) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');

    if (categoryId === 'all') {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category_id === categoryId);
        renderProducts(filtered);
    }
}

// 3. Renderizar Tarjetas (LÓGICA STOCK MEJORADA)
function renderProducts(productsToRender) {
    if(!productsContainer) return;
    productsContainer.innerHTML = '';

    if (productsToRender.length === 0) {
        productsContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">No hay productos.</p>';
        return;
    }

    productsToRender.forEach(product => {
        const card = document.createElement('div');
        
        const isOutOfStock = product.stock === 0;
        
        card.className = `card ${isOutOfStock ? 'out-of-stock' : ''}`;
        
        // Lógica de Mensaje de Stock
        let stockDisplay;
        if (isOutOfStock) {
            stockDisplay = `<span class="stock-empty">🚫 AGOTADO</span>`;
        } else if (product.stock < 5) {
            stockDisplay = `Stock: ${product.stock} <span class="stock-warning">¡ÚLTIMAS UNIDADES!</span>`;
        } else {
            stockDisplay = `Stock: ${product.stock}`;
        }

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
                           style="width: 50px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; text-align: center;"
                           ${isOutOfStock ? 'disabled' : ''}>
                    
                    <button class="btn-primary" 
                            onclick="addProductFromCard(${product.id_key})" 
                            style="margin-top:0; flex:1;"
                            ${isOutOfStock ? 'disabled' : ''}>
                        ${isOutOfStock ? 'Sin Stock' : 'Agregar 🛒'}
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

    if (product && qty > 0 && qty <= product.stock) {
        addToCart(product, qty);
        input.value = 1;
    } else {
        alert("Cantidad no válida o stock insuficiente");
    }
}