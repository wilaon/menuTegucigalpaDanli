
function verificarPrimeraSemanaMes() {
  const hoy = new Date();
  const diaDelMes = hoy.getDate();
  

  if (diaDelMes >= 2 && diaDelMes <= 9) {
    const enlaceConfirmacion = document.getElementById('confirmacionLink');
    if (enlaceConfirmacion) {
      enlaceConfirmacion.style.display = 'block';
    }
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
  verificarPrimeraSemanaMes();
  deshabilitarCartillasProximamente();
});
