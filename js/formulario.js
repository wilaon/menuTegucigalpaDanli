/**
 * ═══════════════════════════════════════════════════════════
 * FORMULARIO.JS - Lógica del formulario de horas extras
 * ═══════════════════════════════════════════════════════════
 */

// REFERENCIAS DOM
const elementos = {
  form: document.getElementById('attendanceForm'),
  fecha: document.getElementById('fecha'),
  dni: document.getElementById('dni'),
  nombre: document.getElementById('nombre'),
  horaEntrada: document.getElementById('horaEntrada'),
  horaSalida: document.getElementById('horaSalida'),
  turno: document.getElementById('turno'),
  turnoIngeniero: document.getElementById('turnoIngeniero'),
  observaciones: document.getElementById('observaciones'),
  submitBtn: document.getElementById('submitBtn'),
  dniValidation: document.getElementById('dniValidation'),
  loading: document.getElementById('loading'),
  successMessage: document.getElementById('successMessage'),
  errorMessage: document.getElementById('errorMessage'),
  clock: document.getElementById('clock')
};

// ═══════════════════════════════════════════════════════════
// LOADING OVERLAY INICIAL
// ═══════════════════════════════════════════════════════════

function crearLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'loadingOverlay';
  overlay.className = 'loading-overlay';
  overlay.innerHTML = `
    <div class="loading-icon">⏰</div>
    <div class="loading-title">Solicitud de Horas Extras</div>
    <div class="loading-status" id="loadingStatus">Iniciando...</div>
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
// OVERLAY DE PROCESAMIENTO (al enviar formulario)
// ═══════════════════════════════════════════════════════════

function mostrarOverlayProcesando(mensaje = 'Registrando solicitud...') {
  // Remover si existe
  const existente = document.getElementById('processingOverlay');
  if (existente) existente.remove();
  
  const overlay = document.createElement('div');
  overlay.id = 'processingOverlay';
  overlay.className = 'processing-overlay';
  overlay.innerHTML = `
    <div class="processing-card">
      <div class="processing-icon">📤</div>
      <div class="processing-title">${mensaje}</div>
      <div class="processing-spinner"></div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function ocultarOverlayProcesando() {
  const overlay = document.getElementById('processingOverlay');
  if (overlay) {
    overlay.style.animation = 'fadeIn 0.3s ease reverse';
    setTimeout(() => overlay.remove(), 300);
  }
}

// ═══════════════════════════════════════════════════════════
// RELOJ
// ═══════════════════════════════════════════════════════════

function actualizarReloj() {
  if (elementos.clock) {
    elementos.clock.textContent = formatearFechaHora();
  }
}

// ═══════════════════════════════════════════════════════════
// VALIDACIÓN DNI (solo UI)
// ═══════════════════════════════════════════════════════════

function validarDNI(dniSinGuiones) {
  if (validarDNILongitud(dniSinGuiones)) {
    const dniConGuiones = formatearDNIConGuiones(dniSinGuiones);
    const empleado = buscarEmpleado(dniConGuiones);
    
    if (empleado) {
      elementos.nombre.value = empleado.nombre;
      elementos.nombre.readOnly = true;
      elementos.dniValidation.textContent = '✓ Empleado encontrado';
      elementos.dniValidation.className = 'validation-message success show';
      elementos.submitBtn.disabled = false;
      
    } else {
      elementos.nombre.value = '';
      elementos.nombre.readOnly = false;
      elementos.dniValidation.textContent = 'DNI no registrado';
      elementos.dniValidation.className = 'validation-message error show';
      elementos.submitBtn.disabled = true;
    }
  } else {
    elementos.dniValidation.classList.remove('show');
    elementos.nombre.value = '';
    elementos.nombre.readOnly = false;
    elementos.submitBtn.disabled = true;
  }
}

// ═══════════════════════════════════════════════════════════
// VALIDAR HORAS EN TIEMPO REAL
// ═══════════════════════════════════════════════════════════

function validarHorasTurno(datosTurno = null, datosEntrada = null, datosSalida = null) {
  const turnoSeleccionado = datosTurno || elementos.turno.value;
  const horaEntrada = datosEntrada || elementos.horaEntrada.value;
  const horaSalida = datosSalida || elementos.horaSalida.value;
  
  if (!turnoSeleccionado || !horaEntrada || !horaSalida) {
    elementos.submitBtn.disabled = true;
    return { valido: false, error: 'Campos incompletos' };
  }
  
  const totalHoras = calcularHoras(horaEntrada, horaSalida);
  if (!totalHoras) {
    elementos.submitBtn.disabled = true;
    return { valido: false, error: 'Error al calcular horas' };
  }
  
  // Turnos especiales sin restricción
  const turnosEspeciales = ['1er Día Descanso', '2do Día Descanso', 'Feriado'];
  
  if (turnosEspeciales.includes(turnoSeleccionado)) {
    elementos.errorMessage.classList.remove('show');
    return { valido: true, horasExtras: totalHoras };
  }
  
  // Determinar horas mínimas
  let horasMinimas = 0;
  if (['06:00-15:00', '07:00-16:00', '09:00-18:00'].includes(turnoSeleccionado)) {
    horasMinimas = 9;
  } else if (['13:00-20:00', '14:00-21:00', '07:00-14:00'].includes(turnoSeleccionado)) {
    horasMinimas = 7;
  } else if (['17:00-23:00', '18:00-00:00', '00:00-06:00'].includes(turnoSeleccionado)) {
    horasMinimas = 6;
  }
  
  if (totalHoras < horasMinimas) {
    const mensaje = 'Jornada incompleta';
    mostrarMensaje(elementos.errorMessage, mensaje, 'error');
    elementos.submitBtn.disabled = true;
    return { valido: false, error: mensaje };
  }
  
  const horasExtras = totalHoras - horasMinimas;
  
  if (horasExtras <= 0) {
    const mensaje = 'Sin horas extras - no laboró más de las horas requeridas en el turno';
    mostrarMensaje(elementos.errorMessage, mensaje, 'error', 8000);
    elementos.submitBtn.disabled = true;
    return { valido: false, error: mensaje };
  }
  
  elementos.submitBtn.disabled = false;
  elementos.errorMessage.classList.remove('show');
  
  return { valido: true, horasExtras: horasExtras };
}

// ═══════════════════════════════════════════════════════════
// CONTADOR DE CARACTERES
// ═══════════════════════════════════════════════════════════

function inicializarContadorCaracteres() {
  const maxLength = elementos.observaciones.getAttribute('maxlength') || 130;
  
  // Crear contador
  const contador = document.createElement('div');
  contador.id = 'charCounter';
  contador.className = 'char-counter';
  elementos.observaciones.parentNode.appendChild(contador);
  
  function actualizarContador() {
    const actual = elementos.observaciones.value.length;
    const restantes = maxLength - actual;
    contador.textContent = `${actual}/${maxLength} caracteres`;
    
    contador.classList.remove('warning', 'danger');
    if (restantes <= 20) {
      contador.classList.add('danger');
    } else if (restantes <= 50) {
      contador.classList.add('warning');
    }
  }
  
  elementos.observaciones.addEventListener('input', actualizarContador);
  actualizarContador();
}

// ═══════════════════════════════════════════════════════════
// GUARDAR SOLICITUD EN HISTORIAL
// ═══════════════════════════════════════════════════════════

function guardarSolicitudEnHistorial(datos) {
  const historial = JSON.parse(localStorage.getItem('historialSolicitudes') || '[]');
  
  const solicitud = {
    fecha: datos.fecha,
    dni: datos.dni,
    nombre: datos.nombre,
    turno: datos.turno,
    horaEntrada: datos.horaEntrada,
    horaSalida: datos.horaSalida,
    ingeniero: datos.turnoIngeniero,
    timestamp: new Date().toISOString()
  };
  
  // Agregar al inicio
  historial.unshift(solicitud);
  
  // Mantener solo últimas 5
  if (historial.length > 5) {
    historial.pop();
  }
  
  localStorage.setItem('historialSolicitudes', JSON.stringify(historial));
}

// ═══════════════════════════════════════════════════════════
// PROCESAR FORMULARIO
// ═══════════════════════════════════════════════════════════

async function procesarFormulario(e) {
  e.preventDefault();
  
  // Validaciones básicas de UI
  if (!elementos.horaEntrada.value && !elementos.horaSalida.value) {
    mostrarMensaje(elementos.errorMessage, 'Debe ingresar al menos una hora', 'error');
    return;
  }
  
  if (!elementos.turno.value) {
    mostrarMensaje(elementos.errorMessage, 'Debe seleccionar un turno', 'error');
    return;
  }
  
  if (!elementos.turnoIngeniero.value) {
    mostrarMensaje(elementos.errorMessage, 'Debe seleccionar un Ingeniero de Turno', 'error');
    return;
  }

  const validacionPrevia = validarHorasTurno(
    elementos.turno.value,
    elementos.horaEntrada.value,
    elementos.horaSalida.value
  );
  
  if (!validacionPrevia.valido) {
    mostrarMensaje(elementos.errorMessage, validacionPrevia.error, 'error', 8000);
    return;
  }

  mostrarOverlayProcesando('Registrando solicitud...');
  
  const dniConGuiones = elementos.dni.value;
  
  const datos = {
    fecha: elementos.fecha.value,
    dni: dniConGuiones,
    nombre: elementos.nombre.value,
    horaEntrada: elementos.horaEntrada.value,
    horaSalida: elementos.horaSalida.value,
    turno: elementos.turno.value,
    turnoIngeniero: elementos.turnoIngeniero.value,
    observaciones: elementos.observaciones.value
  };
  
  console.log('Enviando datos...');
  
  const resultado = await guardarAsistencia(datos);
  
  ocultarOverlayProcesando();
  
  if (resultado.success) {
    // Guardar en historial local
    guardarSolicitudEnHistorial(datos);
    
    mostrarMensaje(elementos.successMessage, '✅ ' + resultado.mensaje, 'success');
    
    // Limpiar formulario
    elementos.form.reset();
    configurarCalendario(elementos.fecha);
    elementos.dniValidation.classList.remove('show');
    elementos.nombre.readOnly = false;
    elementos.submitBtn.disabled = true;
    
    
    // Actualizar contador
    const contador = document.getElementById('charCounter');
    if (contador) contador.textContent = '0/130 caracteres';
    
  } else {
    elementos.submitBtn.disabled = false;
    const mensajeError = resultado.errores 
      ? resultado.errores.join(', ') 
      : resultado.mensaje || 'Error desconocido';
    
    mostrarMensaje(elementos.errorMessage, '❌ ' + mensajeError, 'error', 8000);
  }
}

// ═══════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════

function inicializarEventos() {
  // Input DNI - formato automático
  elementos.dni.addEventListener('input', function(e) {
    e.target.value = formatearDNIInput(e.target.value);
    
    if (e.target.value.length === 15) {
      const dniSinGuiones = e.target.value.replace(/-/g, '');
      validarDNI(dniSinGuiones);
    } else {
      elementos.dniValidation.classList.remove('show');
      elementos.nombre.value = '';
      elementos.nombre.readOnly = false;
      elementos.submitBtn.disabled = true;
    }
  });

  elementos.turno.addEventListener('change', validarHorasTurno);
  elementos.horaEntrada.addEventListener('change', validarHorasTurno);
  elementos.horaSalida.addEventListener('change', validarHorasTurno);
  
  // Submit formulario
  elementos.form.addEventListener('submit', procesarFormulario);
}

// ═══════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════

async function inicializar() {
  // Crear overlay de carga
  crearLoadingOverlay();
  
  try {
    // Paso 1: Configurar calendario
    actualizarLoadingStatus('Configurando calendario...', 10);
    await new Promise(r => setTimeout(r, 300));
    configurarCalendario(elementos.fecha);
    
    // Paso 2: Iniciar reloj
    actualizarLoadingStatus('Iniciando reloj...', 20);
    await new Promise(r => setTimeout(r, 300));
    actualizarReloj();
    setInterval(actualizarReloj, 1000);
    
    // Paso 3: Cargar empleados
    actualizarLoadingStatus('Cargando empleados...', 40);
    await cargarEmpleados();
    
    // Paso 4: Cargar turnos
    actualizarLoadingStatus('Cargando turnos...', 60);
    const turnos = await cargarTurnos();
    llenarSelect(elementos.turno, turnos, 'Seleccionar turno...');
    
    // Paso 5: Cargar ingenieros
    actualizarLoadingStatus('Cargando ingenieros...', 80);
    const ingenieros = await cargarIngenierosTurno();
    llenarSelect(elementos.turnoIngeniero, ingenieros, 'Seleccionar ingeniero...');
    
    // Paso 6: Configurar eventos
    actualizarLoadingStatus('Finalizando...', 95);
    await new Promise(r => setTimeout(r, 300));
    inicializarEventos();
    inicializarContadorCaracteres();
    
    
    // Completado
    actualizarLoadingStatus('¡Listo!', 100);
    await new Promise(r => setTimeout(r, 500));
    
    // Ocultar overlay
    ocultarLoadingOverlay();
    
  } catch (error) {
    actualizarLoadingStatus('Error al cargar el sistema', 0);
    console.error('Error:', error);
    setTimeout(() => {
      ocultarLoadingOverlay();
      mostrarMensaje(elementos.errorMessage, 'Error al cargar el sistema', 'error');
    }, 2000);
  }
}

// INICIO CUANDO DOM ESTÉ LISTO
document.addEventListener('DOMContentLoaded', inicializar);
