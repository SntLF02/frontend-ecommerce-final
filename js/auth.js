// Estado del usuario (leído del navegador)
let currentUser = JSON.parse(localStorage.getItem('baristaUser')) || null;

// Elementos del DOM (Login)
const loginSection = document.getElementById('section-login');
const userNavDisplay = document.getElementById('nav-user-display');
const btnLoginMenu = document.getElementById('nav-login');
const btnLogoutMenu = document.getElementById('nav-logout');

// 1. Iniciar Sesión (Buscar por Email)
async function loginByEmail(email) {
    try {
        const response = await fetch(`${API_URL}/clients/`);
        const clients = await response.json();
        
        const foundUser = clients.find(c => c.email.toLowerCase() === email.toLowerCase());

        if (foundUser) {
            setCurrentUser(foundUser);
            alert(`¡Bienvenido de nuevo, ${foundUser.name}!`);
            showSection('home');
        } else {
            // Si no existe, sugerimos registro
            if(confirm("No encontramos ese email. ¿Quieres registrarte?")) {
                showSection('register');
                // Pre-llenar el email en el formulario de registro
                document.getElementById('reg-email').value = email;
            }
        }
    } catch (error) {
        console.error(error);
        alert("Error al intentar iniciar sesión.");
    }
}

// 2. Registrarse (Crear Cliente en API)
async function registerUser(userData) {
    try {
        const response = await fetch(`${API_URL}/clients/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) throw new Error("Error al registrar");

        const newUser = await response.json();
        setCurrentUser(newUser); // Auto-login
        alert("¡Cuenta creada con éxito! Ahora eres parte de Barista Coffee.");
        showSection('home');

    } catch (error) {
        console.error(error);
        alert("No se pudo completar el registro: " + error.message);
    }
}

// 3. Guardar sesión y actualizar UI
function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem('baristaUser', JSON.stringify(user));
    updateAuthUI();
}

// 4. Cerrar Sesión
function logout() {
    currentUser = null;
    localStorage.removeItem('baristaUser');
    updateAuthUI();
    showSection('home');
    alert("Has cerrado sesión.");
}

// 5. Actualizar Barra de Navegación
function updateAuthUI() {
    if (currentUser) {
        // Usuario Logueado
        btnLoginMenu.style.display = 'none';
        btnLogoutMenu.style.display = 'block';
        userNavDisplay.textContent = `Hola, ${currentUser.name}`;
        userNavDisplay.style.display = 'block';
        userNavDisplay.href = "#"; // Ir al perfil (pendiente)
        userNavDisplay.onclick = () => showSection('profile');
    } else {
        // Invitado
        btnLoginMenu.style.display = 'block';
        btnLogoutMenu.style.display = 'none';
        userNavDisplay.style.display = 'none';
    }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', updateAuthUI);