const productsContainer = document.getElementById('productsList');
const btnLoadProducts = document.getElementById('btnLoadProducts');

async function fetchProducts() {
    try {
        productsContainer.innerHTML = '<p>Cargando catálogo...</p>';
        
        // Petición a tu API en Render
        const response = await fetch(`${API_URL}/products`);
        
        if (!response.ok) throw new Error('Error al conectar con la API');

        const products = await response.json();
        console.log("Productos recibidos:", products);

        renderProducts(products);

    } catch (error) {
        console.error("Error:", error);
        productsContainer.innerHTML = `<p style="color: red">Error: ${error.message}</p>`;
    }
}

function renderProducts(products) {
    productsContainer.innerHTML = '';

    if (products.length === 0) {
        productsContainer.innerHTML = '<p>Cargando catálogo...</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('card');
        
        // Lógica de Stock Bajo (FOMO)
        let stockDisplay = `Stock: ${product.stock}`;
        if (product.stock < 5) {
            stockDisplay += ` <span class="stock-warning">¡ÚLTIMAS ${product.stock} UNIDADES!</span>`;
        }

        card.innerHTML = `
            <h3>${product.name}</h3>
            <p class="price-tag">$${product.price.toLocaleString()}</p>
            <p class="stock-tag">${stockDisplay}</p>
            
            <button class="btn-primary" onclick="buyProduct(${product.id_key}, ${product.price}, '${product.name}')" style="width: 100%; margin-top: 15px;">
                 Agregar al Pedido
            </button>
        `;
        productsContainer.appendChild(card);
    });
}

// Evento del botón
btnLoadProducts.addEventListener('click', fetchProducts);