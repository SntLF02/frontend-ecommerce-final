// Referencias DOM
const apiStatusDot = document.getElementById('api-status-dot');
const apiStatusText = document.getElementById('api-status-text');
const apiLatency = document.getElementById('api-latency');
const ctx = document.getElementById('latencyChart').getContext('2d');


const maxDataPoints = 20;
const initialData = Array(maxDataPoints).fill(0); // Datos iniciales vacíos

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Array(maxDataPoints).fill(''),
        datasets: [{
            label: 'Latencia (ms)',
            data: initialData,
            borderColor: '#d4a373',
            backgroundColor: 'rgba(212, 163, 115, 0.2)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: {
            y: { beginAtZero: true, suggestedMax: 100 },
            x: { display: false }
        },
        plugins: {
            legend: { display: false }
        }
    }
});

// Función de Monitoreo
async function checkSystemHealth() {
    const startTime = Date.now();
    
    try {
        // Petición real al Health Check
        const response = await fetch(`${API_URL}/health_check`);
        const endTime = Date.now();
        const latency = endTime - startTime;

        if (response.ok) {
            // Actualizar Textos
            apiStatusDot.className = 'dot green';
            apiStatusText.textContent = 'En Línea';
            apiStatusText.style.color = '#27ae60';
            apiLatency.textContent = latency;

            // Actualizar Gráfico
            updateChart(latency);
        } else {
            throw new Error('Estado no 200');
        }

    } catch (error) {
        apiStatusDot.className = 'dot red';
        apiStatusText.textContent = 'Sin Conexión';
        apiStatusText.style.color = '#e74c3c';
        apiLatency.textContent = '---';
        updateChart(0); // Si falla, graficamos 0
        console.error("Health check falló:", error);
    }
}

function updateChart(newValue) {
    // Eliminar el dato más viejo (primero)
    chart.data.datasets[0].data.shift();
    // Agregar el nuevo dato al final
    chart.data.datasets[0].data.push(newValue);
    // Redibujar
    chart.update();
}

// Iniciar sondeo cada 2 segundos
setInterval(checkSystemHealth, 2000);
checkSystemHealth(); // Primera ejecución