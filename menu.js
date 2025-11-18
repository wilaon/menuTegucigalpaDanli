// ═══════════════════════════════════════════════════════════
// DASHBOARD.JS - Lógica del menú principal
// ═══════════════════════════════════════════════════════════

// Verificar si estamos en la primera semana del mes
function verificarPrimeraSemanaMes() {
  const hoy = new Date();
  const diaDelMes = hoy.getDate();
  
  // Mostrar solo del día 1 al 7
  if (diaDelMes >= 1 && diaDelMes <= 30) {
    const enlaceConfirmacion = document.getElementById('confirmacionLink');
    if (enlaceConfirmacion) {
      enlaceConfirmacion.style.display = 'block';
      console.log('✅ Banner de confirmación visible (día ' + diaDelMes + ')');
    }
  } else {
    console.log('ℹ️ Banner oculto - Fuera de la primera semana (día ' + diaDelMes + ')');
  }
}

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

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Dashboard cargado');
  verificarPrimeraSemanaMes();
  deshabilitarCartillasProximamente();
});
