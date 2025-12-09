const productsContainer = document.getElementById('productsList');
const filtersContainer = document.getElementById('categoryFilters');

// Variables globales
let allProducts = []; 
let allCategories = [];
let allReviews = [];
let currentProductInModal = null;

// 1. Cargar Datos
async function fetchProducts() {
    try {
        if(productsContainer) productsContainer.innerHTML = '<p style="text-align:center">Cargando catálogo...</p>';
        
        const [productsRes, categoriesRes, reviewsRes] = await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/categories`),
            fetch(`${API_URL}/reviews`)
        ]);

        if (!productsRes.ok || !categoriesRes.ok || !reviewsRes.ok) throw new Error('Error API');

        allProducts = await productsRes.json();
        allCategories = await categoriesRes.json();
        allReviews = await reviewsRes.json();

        renderFilters();
        renderProducts(allProducts);

    } catch (error) {
        console.error("❌ Error:", error);
        if(productsContainer) productsContainer.innerHTML = `<p style="color: red; text-align:center">Error: ${error.message}</p>`;
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

// 3. Renderizar Tarjetas
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
        
        // A. Lógica de Stock
        let stockDisplay;
        if (isOutOfStock) {
            stockDisplay = `<span class="stock-empty" style="background:#ddd; padding:4px; border-radius:4px;">🚫 AGOTADO</span>`;
        } else if (product.stock < 5) {
            stockDisplay = `Stock: ${product.stock} <span class="stock-warning">¡ÚLTIMAS!</span>`;
        } else {
            stockDisplay = `Stock: ${product.stock}`;
        }

        // B. Lógica de Rating (Promedio)
        const productReviews = allReviews.filter(r => r.product_id === product.id_key);
        let ratingHtml = '<span style="color:#ccc; font-size:0.9rem;">Sin valoraciones</span>';
        
        if (productReviews.length > 0) {
            const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
            const avg = Math.round(sum / productReviews.length);
            const stars = '★'.repeat(avg) + '☆'.repeat(5 - avg);
            ratingHtml = `<span style="color:#f1c40f; font-size:1.1rem;">${stars}</span> <span style="color:#999; font-size:0.8rem;">(${productReviews.length})</span>`;
        }

        const inputId = `qty-${product.id_key}`;

        card.innerHTML = `
            <div onclick="openProductModal(${product.id_key})" style="cursor: pointer;">
                <h3>${product.name}</h3>
                <div style="margin-bottom: 5px;">${ratingHtml}</div> <p class="stock-tag">${stockDisplay}</p>
                <p class="price-tag">$${product.price.toLocaleString()}</p>
                <p style="font-size: 0.8rem; color: #a98467; text-decoration: underline;">Ver detalles ➔</p>
            </div>
            
            <div class="product-actions" style="display: flex; gap: 10px; align-items: center; margin-top: 10px;">
                <input type="number" id="${inputId}" value="1" min="1" max="${product.stock}" 
                       style="width: 50px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; text-align: center;"
                       ${isOutOfStock ? 'disabled' : ''}>
                
                <button class="btn-primary" 
                        onclick="addProductFromCard(${product.id_key})" 
                        style="margin-top:0; flex:1; ${isOutOfStock ? 'background-color: #95a5a6; cursor: not-allowed;' : ''}"
                        ${isOutOfStock ? 'disabled' : ''}>
                    ${isOutOfStock ? 'Sin Stock' : 'Agregar 🛒'}
                </button>
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

// --- MODAL Y REVIEWS ---

async function openProductModal(productId) {
    const product = allProducts.find(p => p.id_key === productId);
    if (!product) return;

    currentProductInModal = product;

    // Info básica
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-price').textContent = `$${product.price.toLocaleString()}`;
    
    // Configurar botón modal
    const addBtn = document.getElementById('modal-add-btn');
    addBtn.onclick = () => {
        const qty = parseInt(document.getElementById('modal-qty').value) || 1;
        addToCart(product, qty);
        closeProductModal();
    };

    // Refrescar reseñas
    await loadReviewsInModal(productId);

    document.getElementById('product-modal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
    currentProductInModal = null;
    setRating(0);
    document.getElementById('new-review-comment').value = '';
}

async function loadReviewsInModal(productId) {
    const list = document.getElementById('reviews-list');
    list.innerHTML = 'Cargando opiniones...';

    try {
        const res = await fetch(`${API_URL}/reviews`);
        const latestReviews = await res.json();
        
        allReviews = latestReviews; 
        
        const productReviews = latestReviews.filter(r => r.product_id === productId);

        // Calcular Promedio
        let avg = 0;
        if (productReviews.length > 0) {
            const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
            avg = (sum / productReviews.length).toFixed(1);
        }

        document.getElementById('modal-avg-rating').textContent = '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
        document.getElementById('modal-review-count').textContent = `(${productReviews.length} opiniones) - Promedio: ${avg}`;

        list.innerHTML = '';
        if (productReviews.length === 0) {
            list.innerHTML = '<p style="color:#999; font-style:italic;">Aún no hay reseñas. ¡Sé el primero!</p>';
            return;
        }

        productReviews.reverse().forEach(r => {
            const item = document.createElement('div');
            item.style.borderBottom = '1px solid #eee';
            item.style.padding = '10px 0';
            
            const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
            
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <strong style="color:#2c1e16;">Usuario</strong>
                    <span style="color:#f1c40f;">${stars}</span>
                </div>
                <p style="margin:0; color:#555; font-size:0.95rem;">"${r.comment}"</p>
            `;
            list.appendChild(item);
        });

    } catch (error) {
        console.error(error);
        list.innerHTML = 'Error cargando reseñas.';
    }
}

// --- PUBLICAR ---

function setRating(rating) {
    document.getElementById('new-review-rating').value = rating;
    const stars = document.querySelectorAll('.star');
    stars.forEach(s => {
        if (parseInt(s.dataset.value) <= rating) {
            s.style.color = '#f1c40f';
        } else {
            s.style.color = '#ccc';
        }
    });
}

async function submitReview() {
    if (!currentProductInModal) return;

    const rating = parseInt(document.getElementById('new-review-rating').value);
    const comment = document.getElementById('new-review-comment').value.trim();

    // 1. Validación de Estrellas
    if (rating === 0) return alert("Por favor selecciona una calificación (estrellas).");
    
    // 2. Validación de Longitud
    if (comment.length < 10) {
        return alert("El comentario es muy corto. Por favor escribe al menos 10 caracteres.");
    }

    const reviewData = {
        rating: rating,
        comment: comment,
        product_id: currentProductInModal.id_key
    };

    try {
        const res = await fetch(`${API_URL}/reviews/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(JSON.stringify(errorData));
        }

        alert("¡Gracias por tu opinión!");
        
        // Limpiar
        document.getElementById('new-review-comment').value = '';
        setRating(0);
        
        // Recargar reseñas del modal
        await loadReviewsInModal(currentProductInModal.id_key);
        
        // Recargar catálogo principal para actualizar estrellas en la card de atrás
        fetchProducts(); 

    } catch (error) {
        console.error("Error al publicar:", error);
        alert("No se pudo publicar: " + error.message);
    }
}