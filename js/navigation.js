// Referencias a botones del menú
const navClients = document.getElementById('nav-clients');
const navProducts = document.getElementById('nav-products');

// Referencias a secciones
const sectionClients = document.getElementById('section-clients');
const sectionProducts = document.getElementById('section-products');

function showSection(sectionName) {
    // 1. Ocultar todo
    sectionClients.style.display = 'none';
    sectionProducts.style.display = 'none';
    
    // 2. Quitar clase 'active' de todos los botones
    navClients.classList.remove('active');
    navProducts.classList.remove('active');

    // 3. Mostrar la sección elegida
    if (sectionName === 'clients') {
        sectionClients.style.display = 'block';
        navClients.classList.add('active');
    } else if (sectionName === 'products') {
        sectionProducts.style.display = 'block';
        navProducts.classList.add('active');
        fetchProducts(); // Cargar productos automáticamente al entrar
    }
}

// Eventos de clic
navClients.addEventListener('click', (e) => {
    e.preventDefault(); // Evita que el enlace recargue
    showSection('clients');
});

navProducts.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('products');
});