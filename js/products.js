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
        productsContainer.innerHTML = '<p>No hay productos disponibles. ¡Crea algunos desde Swagger!</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('card');
        // Agregamos un borde de color distinto para productos
        card.style.borderLeft = "5px solid #27ae60"; 
        
        card.innerHTML = `
            <h3>${product.name}</h3>
            <p style="font-size: 1.2rem; font-weight: bold; color: #27ae60;">$${product.price}</p>
            <p>Stock: ${product.stock}</p>
            <p style="font-size: 0.8rem; color: #aaa;">ID: ${product.id_key}</p>
        `;
        productsContainer.appendChild(card);
    });
}

// Evento del botón
btnLoadProducts.addEventListener('click', fetchProducts);