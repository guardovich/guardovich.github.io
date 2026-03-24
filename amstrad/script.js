// Estado del buscador
let currentEngine = 1;
let isSearching = false;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initEngines();
    updateSystemTime();
    setInterval(updateSystemTime, 1000);
    updateMemoryDisplay();
    
    // Teclas de función
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'F1': loadDemo(); break;
            case 'Escape': clearSearch(); break;
            case 'Enter': if(document.activeElement === document.getElementById('searchInput')) performSearch(); break;
        }
    });
});

function initEngines() {
    const engineBtns = document.querySelectorAll('.engine-btn');
    engineBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            engineBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentEngine = parseInt(btn.dataset.engine);
            updateStatus(`MOTOR CAMBIADO A ${btn.textContent}`);
        });
    });
}

function updateStatus(message) {
    const statusSpan = document.getElementById('connectionStatus');
    if(statusSpan) {
        statusSpan.textContent = message;
        setTimeout(() => {
            if(statusSpan.textContent === message) {
                statusSpan.textContent = 'SISTEMA LISTO';
            }
        }, 2000);
    }
}

function handleSearchKey(event) {
    if(event.key === 'Enter') {
        performSearch();
    }
}

async function performSearch() {
    if(isSearching) return;
    
    const query = document.getElementById('searchInput').value.trim();
    if(!query) {
        updateStatus('ERROR: INTRODUZCA TÉRMINO DE BÚSQUEDA');
        return;
    }
    
    isSearching = true;
    updateStatus(`BUSCANDO "${query}" EN ${getEngineName(currentEngine)}...`);
    
    // Mostrar loading
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = `
        <div class="loading">
            <pre>█ BUSCANDO EN ${getEngineName(currentEngine)} █</pre>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <p class="prompt">CONECTANDO A ${getEngineUrl(currentEngine)}...</p>
            <p class="prompt">TRANSFIRIENDO DATOS...</p>
        </div>
    `;
    
    // Simular sonido de módem
    playModemSound();
    
    try {
        let results;
        switch(currentEngine) {
            case 1: results = await searchGoogle(query); break;
            case 2: results = await searchWikipedia(query); break;
            case 3: results = await searchImages(query); break;
            case 4: results = await searchNews(query); break;
            default: results = await searchGoogle(query);
        }
        
        displayResults(results);
        updateStatus(`COMPLETADO: ${results.results.length} RESULTADOS ENCONTRADOS`);
        
    } catch(error) {
        showError(`ERROR DE CONEXIÓN: ${error.message}`);
        updateStatus('ERROR DE RED');
    } finally {
        isSearching = false;
    }
}

async function searchGoogle(query) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                engine: 'Google',
                results: [
                    {
                        title: `${query.toUpperCase()} - RESULTADOS PRINCIPALES`,
                        snippet: `Información detallada sobre ${query} encontrada en la red global. Páginas relacionadas: ${Math.floor(Math.random() * 1000) + 100} resultados.`,
                        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`
                    },
                    {
                        title: `Wikipedia - ${query}`,
                        snippet: `Artículo enciclopédico con información completa sobre ${query}. Historia, características y más.`,
                        url: `https://es.wikipedia.org/wiki/${encodeURIComponent(query)}`
                    },
                    {
                        title: `Foro de discusión: ${query}`,
                        snippet: `Comunidad de usuarios y expertos discutiendo sobre ${query}. Participa en la conversación.`,
                        url: `#`
                    },
                    {
                        title: `Documentación oficial de ${query}`,
                        snippet: `Guía completa y documentación técnica sobre ${query}. Manuales, tutoriales y recursos.`,
                        url: `#`
                    }
                ]
            });
        }, 1500);
    });
}

async function searchWikipedia(query) {
    try {
        const response = await fetch(
            `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
        );
        const data = await response.json();
        
        return {
            engine: 'Wikipedia',
            results: [{
                title: data.title || query,
                snippet: data.extract || 'Información disponible en Wikipedia',
                url: data.content_urls?.desktop?.page || `https://es.wikipedia.org/wiki/${query}`
            }]
        };
    } catch(error) {
        return {
            engine: 'Wikipedia',
            results: [
                {
                    title: `Artículo: ${query}`,
                    snippet: `Consulta la información en Wikipedia sobre ${query}`,
                    url: `https://es.wikipedia.org/wiki/${encodeURIComponent(query)}`
                }
            ]
        };
    }
}

async function searchImages(query) {
    return {
        engine: 'Imágenes',
        results: [
            {
                title: `Galería de imágenes: ${query}`,
                snippet: `Visualiza imágenes relacionadas con ${query} en alta resolución`,
                url: `https://unsplash.com/s/photos/${encodeURIComponent(query)}`
            },
            {
                title: `Banco de imágenes - ${query}`,
                snippet: `Colección de fotografías y gráficos sobre ${query}`,
                url: `#`
            }
        ]
    };
}

async function searchNews(query) {
    return {
        engine: 'Noticias',
        results: [
            {
                title: `Últimas noticias: ${query}`,
                snippet: `Actualidad y noticias recientes sobre ${query}`,
                url: `https://news.google.com/search?q=${encodeURIComponent(query)}`
            },
            {
                title: `Análisis y opinión sobre ${query}`,
                snippet: `Expertos analizan las últimas tendencias de ${query}`,
                url: `#`
            }
        ]
    };
}

function displayResults(data) {
    const resultsDiv = document.getElementById('searchResults');
    const resultCountSpan = document.getElementById('resultCount');
    
    if(resultCountSpan) {
        resultCountSpan.textContent = `${data.results.length} RESULTADOS`;
    }
    
    if(!data.results || data.results.length === 0) {
        resultsDiv.innerHTML = `
            <div class="error">
                <span class="prompt">→</span> NO SE ENCONTRARON RESULTADOS
                <br>
                <span class="prompt">→</span> INTENTE CON OTROS TÉRMINOS
            </div>
        `;
        return;
    }
    
    let html = `<div class="result-stats">
        <span class="prompt">&gt;</span> MOTOR: ${getEngineName(currentEngine)}
        <span style="margin-left: 20px;">&gt;</span> TÉRMINO: ${document.getElementById('searchInput').value}
        <hr style="border-color: #0f0; margin: 10px 0;">
    </div>`;
    
    data.results.forEach((result, index) => {
        html += `
            <div class="result-item">
                <div class="result-title">
                    <span class="prompt">[${index + 1}]</span> 
                    <a href="${result.url}" target="_blank">${result.title}</a>
                </div>
                <div class="result-snippet">${result.snippet}</div>
                <div class="result-url">${result.url}</div>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

function showError(message) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = `
        <div class="error" style="color: #f00;">
            <span class="prompt">!</span> ${message}
            <br>
            <span class="prompt">&gt;</span> VERIFIQUE CONEXIÓN DE RED
            <br>
            <span class="prompt">&gt;</span> INTENTE NUEVAMENTE
        </div>
    `;
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = `
        <div class="welcome-message">
            <pre>
    ╔══════════════════════════════════════════════════════╗
    ║                                                      ║
    ║     AMSTRAD CPC NETWORK INTERFACE v1.0              ║
    ║                                                      ║
    ║     LISTO PARA NAVEGAR POR INTERNET                 ║
    ║                                                      ║
    ║     INTRODUZCA TÉRMINO Y PRESIONE [ENTER]           ║
    ║                                                      ║
    ╚══════════════════════════════════════════════════════╝
            </pre>
        </div>
    `;
    const resultCountSpan = document.getElementById('resultCount');
    if(resultCountSpan) resultCountSpan.textContent = '';
    updateStatus('SISTEMA LISTO');
}

function loadDemo() {
    document.getElementById('searchInput').value = 'AMSTRAD CPC 6128';
    updateStatus('DEMO CARGADA - PRESIONE ENTER PARA BUSCAR');
    performSearch();
}

function getEngineName(engine) {
    const names = {1: 'GOOGLE', 2: 'WIKIPEDIA', 3: 'IMÁGENES', 4: 'NOTICIAS'};
    return names[engine] || 'MOTOR';
}

function getEngineUrl(engine) {
    const urls = {1: 'google.com', 2: 'wikipedia.org', 3: 'unsplash.com', 4: 'news.google.com'};
    return urls[engine] || 'web';
}

function playModemSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.value = 1200;
        gainNode.gain.value = 0.05;
        
        oscillator.start();
        setTimeout(() => {
            oscillator.frequency.value = 2400;
            setTimeout(() => {
                oscillator.stop();
            }, 200);
        }, 200);
    } catch(e) {}
}

function updateSystemTime() {
    const timeDisplay = document.getElementById('systemTime');
    if(timeDisplay) {
        const now = new Date();
        timeDisplay.textContent = now.toLocaleTimeString('es-ES');
    }
}

function updateMemoryDisplay() {
    const memorySpan = document.querySelector('.memory-meter span');
    if(memorySpan) {
        let used = Math.floor(Math.random() * 30) + 30;
        let bars = '█'.repeat(Math.floor(used / 10)) + '░'.repeat(10 - Math.floor(used / 10));
        memorySpan.textContent = `MEM: ${bars} ${64 - used}KB LIBRES`;
    }
    setTimeout(updateMemoryDisplay, 5000);
}
