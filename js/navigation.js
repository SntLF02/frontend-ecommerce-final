// --- 1. Referencias al Navbar ---
const navHome = document.getElementById('nav-home');
const navProducts = document.getElementById('nav-products');
const navDashboard = document.getElementById('nav-dashboard');
const navLogin = document.getElementById('nav-login'); // Botón Ingresar
const navLogout = document.getElementById('nav-logout'); // Botón Salir
const navUserDisplay = document.getElementById('nav-user-display'); // Nombre usuario

// --- 2. Referencias a Botones del Hero ---
const btnGoCatalog = document.getElementById('btnGoCatalog');
const btnGoDashboard = document.getElementById('btnGoDashboard');

// --- 3. Referencias a las Secciones (Pantallas) ---
const sectionHero = document.getElementById('section-hero');
const sectionProducts = document.getElementById('section-products');
const sectionDashboard = document.getElementById('section-dashboard');
const sectionLogin = document.getElementById('section-login');
const sectionRegister = document.getElementById('section-register');
const sectionProfile = document.getElementById('section-profile');

// --- 4. Lógica de Formularios (Login/Registro) ---
const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        loginByEmail(email);
    });
}

const formRegister = document.getElementById('form-register');
if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const userData = {
            name: document.getElementById('reg-name').value,
            lastname: document.getElementById('reg-lastname').value,
            email: document.getElementById('reg-email').value,
            telephone: document.getElementById('reg-phone').value
        };
        registerUser(userData);
    });
}

// --- 5. Función Principal de Navegación ---
function showSection(sectionName) {
    // A. Ocultar TODAS las secciones
    [sectionHero, sectionProducts, sectionDashboard, sectionLogin, sectionRegister, sectionProfile]
        .forEach(sec => {
            if (sec) sec.style.display = 'none';
        });
    
    // B. Resetear clases activas del menú
    [navHome, navProducts, navDashboard].forEach(nav => {
        if(nav) nav.classList.remove('active');
    });

    // C. Mostrar la sección elegida
    if (sectionName === 'home') {
        if(sectionHero) sectionHero.style.display = 'block';
        if(navHome) navHome.classList.add('active');
    } else if (sectionName === 'products') {
        if(sectionProducts) sectionProducts.style.display = 'block';
        if(navProducts) navProducts.classList.add('active');
        fetchProducts(); // Cargar productos
    } else if (sectionName === 'dashboard') {
        if(sectionDashboard) sectionDashboard.style.display = 'block';
        if(navDashboard) navDashboard.classList.add('active');
    } else if (sectionName === 'login') {
        if(sectionLogin) sectionLogin.style.display = 'block';
    } else if (sectionName === 'register') {
        if(sectionRegister) sectionRegister.style.display = 'block';
    } else if (sectionName === 'profile') {
        if(sectionProfile) sectionProfile.style.display = 'block';
        loadUserProfile(); // Cargar perfil
    }
}

// --- 6. Event Listeners (Clics) ---
navHome?.addEventListener('click', (e) => { e.preventDefault(); showSection('home'); });
navProducts?.addEventListener('click', (e) => { e.preventDefault(); showSection('products'); });
navDashboard?.addEventListener('click', (e) => { e.preventDefault(); showSection('dashboard'); });

btnGoCatalog?.addEventListener('click', () => showSection('products'));
btnGoDashboard?.addEventListener('click', () => showSection('dashboard'));