const apiStatusDot = document.getElementById('api-status-dot');
const apiStatusText = document.getElementById('api-status-text');
const apiLatency = document.getElementById('api-latency');

async function checkSystemHealth() {
    const startTime = Date.now();
    
    try {
        const response = await fetch(`${API_URL}/health_check`);
        
        const endTime = Date.now();
        const latency = endTime - startTime; 

        if (response.ok) {
            // Sistema OK
            apiStatusDot.className = 'dot green';
            apiStatusText.textContent = 'En Línea';
            apiStatusText.style.color = '#27ae60';
            
            apiLatency.textContent = latency;
        } else {
            throw new Error('Estado no 200');
        }

    } catch (error) {
        // Sistema Caído
        apiStatusDot.className = 'dot red';
        apiStatusText.textContent = 'Sin Conexión';
        apiStatusText.style.color = '#e74c3c';
        apiLatency.textContent = '---';
        console.error("Health check falló:", error);
    }
}

// Verificamos cada 3 segundos
setInterval(checkSystemHealth, 3000);

// Primera ejecución inmediata
checkSystemHealth();