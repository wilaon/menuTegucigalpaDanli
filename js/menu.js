/**
 * ═══════════════════════════════════════════════════════════
 * MENU.JS - Lógica del menú principal
 * ═══════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════
// LOADING OVERLAY INICIAL
// ═══════════════════════════════════════════════════════════

function crearLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'loadingOverlay';
  overlay.className = 'loading-overlay';
  overlay.innerHTML = `
    <div class="loading-icon">⚡</div>
    <div class="loading-title">Sistema de Gestión</div>
    <div class="loading-status" id="loadingStatus">Cargando...</div>
    <div class="loading-progress">
      <div class="loading-progress-bar" id="loadingProgressBar"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function actualizarLoadingStatus(mensaje, progreso) {
  const statusEl = document.getElementById('loadingStatus');
  const progressBar = document.getElementById('loadingProgressBar');
  
  if (statusEl) statusEl.textContent = mensaje;
  if (progressBar) progressBar.style.width = `${progreso}%`;
}

function ocultarLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 500);
  }
}

// ═══════════════════════════════════════════════════════════
// FUNCIONES DEL MENÚ
// ═══════════════════════════════════════════════════════════


// Deshabilitar enlaces de cartillas "Próximamente"
function deshabilitarCartillasProximamente() {
  const cartillasDisabled = document.querySelectorAll('.card-disabled');
  
  cartillasDisabled.forEach(function(card) {
    card.style.cursor = 'not-allowed';
    card.style.opacity = '0.6';
    
    card.addEventListener('click', function(e) {
      e.preventDefault();
      alert('Esta funcionalidad estará disponible próximamente');
    });
  });
}

// ═══════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async function() {
  // Crear overlay de carga
  crearLoadingOverlay();
  
  try {
    // Paso 1: Preparando sistema
    actualizarLoadingStatus('Preparando sistema...', 30);
    await new Promise(r => setTimeout(r, 400));
    
    // Paso 2: Verificando calendario
    actualizarLoadingStatus('Verificando calendario...', 60);
    await new Promise(r => setTimeout(r, 400));
    
    
    // Paso 3: Configurando opciones
    actualizarLoadingStatus('Configurando opciones...', 90);
    await new Promise(r => setTimeout(r, 400));
    deshabilitarCartillasProximamente();
    
    // Completado
    actualizarLoadingStatus('¡Bienvenido!', 100);
    await new Promise(r => setTimeout(r, 500));
    
    // Ocultar overlay
    ocultarLoadingOverlay();
    
  } catch (error) {
    console.error('Error:', error);
    ocultarLoadingOverlay();
  }
});
