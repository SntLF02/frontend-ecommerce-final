# ☕ Barista Coffee Shop | Enterprise Frontend

Este repositorio contiene el Frontend desarrollado para el Trabajo Final Integrador. Es una aplicación web moderna tipo **Single Page Application (SPA)** construida con **Vanilla JavaScript** que consume una API RESTful desarrollada en Python (FastAPI).

El proyecto simula una plataforma de E-commerce de "Nivel Empresarial" con gestión de estado del lado del cliente y monitoreo en tiempo real.

## 🚀 Características Principales

### 🛒 Experiencia de Compra (E-commerce)
* **Catálogo Dinámico:** Consumo de productos y categorías desde la API.
* **Gestión de Stock (FOMO):** Indicadores visuales de "Últimas unidades" y estado "Agotado" (deshabilitando compras) basado en datos reales.
* **Carrito Persistente:** Implementación de **LocalStorage** para mantener la selección del usuario incluso si cierra el navegador (Stateful Client).
* **Checkout Avanzado:** Flujo de compra que incluye:
    * Selección de método de envío (Domicilio vs Retiro).
    * **Gestión de Direcciones:** Guardado y reutilización de direcciones de envío (`POST /addresses`).
    * Generación transaccional de **Facturas (Bills)** y **Órdenes**.

### 👤 Gestión de Usuarios
* **Autenticación:** Sistema de Login y Registro de clientes validado contra la base de datos.
* **Perfil de Usuario:** Visualización del historial de pedidos con desglose de productos comprados y estado del envío.

### 📊 Dashboard de Observabilidad
* **Monitoreo en Tiempo Real:** Panel que consume el endpoint de `health_check` cada 2 segundos.
* **Gráficos de Latencia:** Visualización de la respuesta del servidor utilizando la librería `Chart.js`.

## 🛠️ Tecnologías Utilizadas

* **Lenguajes:** HTML5 Semántico, CSS3 (Diseño Responsivo con Flexbox/Grid), JavaScript (ES6+).
* **Librerías:** `Chart.js` (para gráficos de métricas).
* **API:** Fetch API con manejo de promesas y `async/await`.
* **Diseño:** Estilo minimalista "Coffee Shop" con tipografías *Playfair Display* y *Raleway*.

## ⚙️ Configuración e Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/frontend-ecommerce-final.git](https://github.com/tu-usuario/frontend-ecommerce-final.git)
    ```

2.  **Configurar Endpoint (Opcional):**
    El archivo `js/api.js` ya se encuentra configurado para apuntar al Backend desplegado en Render:
    ```javascript
    const API_URL = "[https://ecommerce-api-hug4.onrender.com](https://ecommerce-api-hug4.onrender.com)";
    ```

3.  **Ejecutar:**
    No requiere instalación de dependencias (`npm`). Simplemente abre el archivo `index.html` en tu navegador o utiliza la extensión **Live Server** de VS Code.

