const navHome = document.getElementById('nav-home');
const navProducts = document.getElementById('nav-products');
const navDashboard = document.getElementById('nav-dashboard');

// Botones del Hero
const btnGoCatalog = document.getElementById('btnGoCatalog');
const btnGoDashboard = document.getElementById('btnGoDashboard');

const sectionHero = document.getElementById('section-hero');
const sectionProducts = document.getElementById('section-products');
const sectionDashboard = document.getElementById('section-dashboard');

function showSection(sectionName) {
    // Ocultar todo
    sectionHero.style.display = 'none';
    sectionProducts.style.display = 'none';
    sectionDashboard.style.display = 'none';
    
    // Resetear navs
    navHome.classList.remove('active');
    navProducts.classList.remove('active');
    navDashboard.classList.remove('active');

    // Mostrar selección
    if (sectionName === 'home') {
        sectionHero.style.display = 'block';
        navHome.classList.add('active');
    } else if (sectionName === 'products') {
        sectionProducts.style.display = 'block';
        navProducts.classList.add('active');
        fetchProducts();
    } else if (sectionName === 'dashboard') {
        sectionDashboard.style.display = 'block';
        navDashboard.classList.add('active');
    }
}

// Event Listeners Navbar
navHome.addEventListener('click', (e) => { e.preventDefault(); showSection('home'); });
navProducts.addEventListener('click', (e) => { e.preventDefault(); showSection('products'); });
navDashboard.addEventListener('click', (e) => { e.preventDefault(); showSection('dashboard'); });

// Event Listeners Botones Hero
btnGoCatalog.addEventListener('click', () => showSection('products'));
btnGoDashboard.addEventListener('click', () => showSection('dashboard'));