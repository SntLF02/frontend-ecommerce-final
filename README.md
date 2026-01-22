# ☕ Barista Coffee Shop | Enterprise Frontend

Este repositorio contiene el Frontend desarrollado para el Trabajo Final Integrador. Es una aplicación web moderna tipo **Single Page Application (SPA)** construida con **Vanilla JavaScript** que consume una API RESTful desarrollada en Python (FastAPI).

## 🔗 Enlaces del Proyecto (Deploy)

* 🌐 **Frontend (Tienda):** [https://barista-coffee-frontend.onrender.com](https://barista-coffee-frontend.onrender.com)
* ⚙️ **Backend (Documentación Swagger):** [https://backend-ecommerce-api-16kf.onrender.com/docs](https://backend-ecommerce-api-16kf.onrender.com/docs)

---

## 🚀 Características Principales

### 🛒 Experiencia de Compra (E-commerce)
* **Catálogo Dinámico:** Consumo de productos y categorías desde la API.
* **Gestión de Stock (FOMO):** Indicadores visuales de "Últimas unidades" y estado "Agotado" con bloqueo de compra.
* **Carrito Persistente:** Implementación de **LocalStorage** para mantener la selección del usuario (Stateful Client).
* **Checkout Avanzado:** Flujo transaccional completo:
    * Selección de envío (Domicilio vs Retiro).
    * **Gestión de Direcciones:** Guardado y autocompletado inteligente de direcciones (`POST /addresses`).
    * Generación atómica de **Facturas (Bills)** y **Órdenes**.

### 👤 Gestión de Usuarios y Social Proof
* **Autenticación:** Login y Registro validado contra base de datos PostgreSQL.
* **Perfil de Usuario:** Historial detallado de pedidos con desglose de productos y estados.
* **Reseñas:** Sistema de calificación (estrellas) y comentarios en tiempo real.

### 📊 Dashboard de Observabilidad
* **Monitoreo en Tiempo Real:** Panel que consume el endpoint de `health_check` cada 2 segundos.
* **Gráficos de Latencia:** Visualización de la respuesta del servidor con `Chart.js`.

## 🛠️ Tecnologías Utilizadas

* **Lenguajes:** HTML5, CSS3 (Flexbox/Grid), JavaScript (ES6+).
* **Librerías:** `Chart.js` (métricas).
* **API:** Fetch API asíncrona.
* **Diseño:** UI minimalista "Coffee Shop" responsiva.
