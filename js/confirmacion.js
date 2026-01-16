/**
 * ═══════════════════════════════════════════════════════════
 * CONFIRMACION.JS - Lógica del portal de confirmación
 * ═══════════════════════════════════════════════════════════
 */

let registrosActuales = [];
let dniActual = '';

// ═══════════════════════════════════════════════════════════
// LOADING OVERLAY INICIAL
// ═══════════════════════════════════════════════════════════

function crearLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'loadingOverlay';
  overlay.className = 'loading-overlay';
  overlay.innerHTML = `
    <div class="loading-icon">📋</div>
    <div class="loading-title">Visualización o Confirmación de Horas</div>
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


function mostrarOverlayProcesando(mensaje = 'Procesando...', icono = '🔍') {
  // Remover si existe
  const existente = document.getElementById('processingOverlay');
  if (existente) existente.remove();
  
  const overlay = document.createElement('div');
  overlay.id = 'processingOverlay';
  overlay.className = 'processing-overlay';
  overlay.innerHTML = `
    <div class="processing-card">
      <div class="processing-icon">${icono}</div>
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
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async function() {
  // Crear overlay de carga
  crearLoadingOverlay();
  
  try {
    // Paso 1: Verificar días
    actualizarLoadingStatus('Verificando disponibilidad...', 30);
    await new Promise(r => setTimeout(r, 400));
    
    // Paso 2: Configurar eventos
    actualizarLoadingStatus('Configurando sistema...', 60);
    await new Promise(r => setTimeout(r, 400));
    configurarEventos();
    
    // Paso 3: Cargar historial de solicitudes
    actualizarLoadingStatus('Cargando historial...', 80);
    await new Promise(r => setTimeout(r, 400));
    
    
    
    // Completado
    actualizarLoadingStatus('¡Listo!', 100);
    await new Promise(r => setTimeout(r, 500));
    
    // Ocultar overlay
    ocultarLoadingOverlay();
    
  } catch (error) {
    actualizarLoadingStatus('Error al cargar', 0);
    console.error('Error:', error);
    setTimeout(() => ocultarLoadingOverlay(), 2000);
  }
});

function configurarEventos() {
  const dniInput = document.getElementById('dniInput');
  
  // Formatear DNI mientras escribe
  dniInput.addEventListener('input', function(e) {
    e.target.value = formatearDNIInput(e.target.value);
  });
  
  // Buscar con Enter
  dniInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') buscarRegistros();
  });
}


// Verificar si está en el rango de días permitido 
function esModoAprobacion() {
  return esPrimeraSemanaDelMes();
}


// ═══════════════════════════════════════════════════════════
// MENSAJES
// ═══════════════════════════════════════════════════════════

function mostrarMensajeConfirmacion(texto, tipo = 'info') {
  const msg = document.getElementById('mensaje');
  msg.textContent = texto;
  msg.className = 'notice ' + tipo;
  msg.classList.remove('hidden');
  
  setTimeout(() => msg.classList.add('hidden'), 6000);
}


// ═══════════════════════════════════════════════════════════
// BUSCAR REGISTROS
// ═══════════════════════════════════════════════════════════

async function buscarRegistros() {
  const dni = document.getElementById('dniInput').value.trim();
  
  if (!dni || dni.length < 15) {
    mostrarMensajeConfirmacion('Ingrese un DNI válido completo', 'warning');
    return;
  }
  
  
  dniActual = dni;
  
  // ═══ BLOQUEAR BOTÓN ═══
  const btnBuscar = document.getElementById('btnBuscar');
  btnBuscar.disabled = true;
  btnBuscar.classList.add('processing');
  const textoOriginal = btnBuscar.innerHTML;
  btnBuscar.innerHTML = '⏳ Buscando...';
  
  
  // Ocultar secciones
  document.getElementById('empleadoInfo').classList.add('hidden');
  document.getElementById('resultados').classList.add('hidden');
  document.getElementById('historial').classList.add('hidden');
  
  try {
    const data = await obtenerRegistrosPendientes(dni);
    
    // ═══ RESTAURAR BOTÓN ═══
    btnBuscar.classList.remove('processing');
    btnBuscar.innerHTML = textoOriginal;
    btnBuscar.disabled = false;
    
    if (data.error) {
      mostrarMensajeConfirmacion(data.error, 'error');
      return;
    }
    
    // Mostrar info del empleado
    if (data.empleado) {
      document.getElementById('empleadoNombre').textContent = data.empleado.nombre;
      document.getElementById('empleadoDNI').textContent = dni;
      document.getElementById('empleadoInfo').classList.remove('hidden');
    }
    
    // Mostrar registros
    const enPeriodo =  esModoAprobacion();
    const hayPendientes = data.registros && data.registros.length > 0;

    if (enPeriodo && hayPendientes) {
      registrosActuales = data.registros;
      renderizarTabla(registrosActuales,true);
      document.getElementById('resultados').classList.remove('hidden');
      mostrarMensajeConfirmacion(`${registrosActuales.length} registro(s) pendientes de confirmación`, 'success');
    }else{
      if (data.ultimos5 && data.ultimos5.length > 0) {
        renderizarTablaConsulta(data.ultimos5);
        document.getElementById('resultados').classList.remove('hidden')
      }
      if (enPeriodo && !hayPendientes) {
        mostrarMensajeConfirmacion('✅ No tiene registros pendientes de confirmación', 'info');
      } else {
        mostrarMensajeConfirmacion('🔒 Fuera del período de confirmación (días 2-7). Solo consulta disponible.', 'warning');
      }
    }
    
  } catch (error) {
    
    // ═══ RESTAURAR BOTÓN EN ERROR ═══
    btnBuscar.classList.remove('processing');
    btnBuscar.innerHTML = textoOriginal;
    btnBuscar.disabled = false;
    
    console.error('Error:', error);
    mostrarMensajeConfirmacion('Error al buscar registros: ' + error.message, 'error');
  }
}

// ═══════════════════════════════════════════════════════════
// RENDERIZAR TABLA
// ═══════════════════════════════════════════════════════════

function renderizarTabla(registros, conCheckboxes = true) {
  const tabla = document.getElementById('tablaRegistros');
  const thead = tabla.querySelector('thead');
  const tbody = document.getElementById('tablaBody');
  
  // Limpiar
  tbody.innerHTML = '';
  
  // Cambiar encabezados según modo
  thead.innerHTML = `
    <tr>
      <th class="chk-col"></th>
      <th>Fecha</th>
      <th>Turno</th>
      <th>Entrada</th>
      <th>Salida</th>
      <th>Total Horas</th>
      <th>25% Noct</th>
      <th>25% Diur</th>
      <th>50% Noct</th>
      <th>75% Prol</th>
      <th>100% Fer</th>
      <th>Ingeniero</th>
      <th>Observaciones</th>
    </tr>
  `;
  
  document.querySelector('.controls').style.display = 'flex';
  document.querySelector('.totals').style.display = 'flex';
  document.querySelector('.notice.warning').style.display = 'block';
  
  let totalHoras = 0;
  
  registros.forEach((reg, index) => {
    const horasReg = parseFloat(reg.totalHoras) || 0;
    totalHoras += horasReg;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="chk-col">
        <input type="checkbox" class="chkRegistro" data-index="${index}" data-fila="${reg.fila}" onchange="actualizarContador()">
      </td>
      <td>${formatearFecha(reg.fecha)}</td>
      <td>${reg.turno || '-'}</td>
      <td style="text-align:center">${reg.horaEntrada || '-'}</td>
      <td style="text-align:center">${reg.horaSalida || '-'}</td>
      <td style="text-align:center; font-weight:600">${horasReg}</td>
      <td style="text-align:center">${reg.noct25 || 0}</td>
      <td style="text-align:center">${reg.diur25 || 0}</td>
      <td style="text-align:center">${reg.noct50 || 0}</td>
      <td style="text-align:center">${reg.prolong75 || 0}</td>
      <td style="text-align:center">${reg.feriado100 || 0}</td>
      <td>${reg.ingeniero || '-'}</td>
      <td style="font-size:11px">${reg.observaciones || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
  
  document.getElementById('totalRegistros').textContent = registros.length;
  document.getElementById('totalHoras').textContent = totalHoras.toFixed(2);
  actualizarContador();
}

// ═══════════════════════════════════════════════════════════
// RENDERIZAR HISTORIAL DE CONFIRMACIONES (del servidor)
// ═══════════════════════════════════════════════════════════

/*function renderizarHistorialConfirmaciones(historial) {
  const lista = document.getElementById('historialLista');
  lista.innerHTML = '';
  
  historial.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    const fecha = new Date(item.fecha);
    div.textContent = `📅 ${fecha.toLocaleDateString('es-ES')} - ${fecha.toLocaleTimeString('es-ES')} - ${item.cantidad} registro(s)`;
    lista.appendChild(div);
  });
}*/



//===============================================================
//==============================================================

function renderizarTablaConsulta(registros) {
  const tabla = document.getElementById('tablaRegistros');
  const thead = tabla.querySelector('thead');
  const tbody = document.getElementById('tablaBody');
  
  // Limpiar
  tbody.innerHTML = '';
  
  // Cambiar encabezados para modo consulta
  thead.innerHTML = `
    <tr>
      <th>Fecha</th>
      <th>Turno</th>
      <th>Entrada</th>
      <th>Salida</th>
      <th>Horas</th>
      <th>Estado</th>
    </tr>
  `;
  
  // Ocultar controles de confirmación
  document.querySelector('.controls').style.display = 'none';
  document.querySelector('.totals').style.display = 'none';
  document.querySelector('.notice.warning').style.display = 'none';
  
  
  registros.forEach((reg) => {
    const horasReg = parseFloat(reg.totalHoras) || 0;
    
    const estadoTexto = reg.confirmado === 'Sí' ? '✅ Confirmado' : 
                        (reg.estado?.toLowerCase() === 'aprobado' ? '⏳ Aprobado' : '📝 ' + (reg.estado || 'Pendiente'));
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${reg.fecha || '-'}</td>
      <td>${reg.turno || '-'}</td>
      <td style="text-align:center">${reg.horaEntrada || '-'}</td>
      <td style="text-align:center">${reg.horaSalida || '-'}</td>
      <td style="text-align:center; font-weight:600">${horasReg}</td>
      <td style="text-align:center">${estadoTexto}</td>
    `;
    tbody.appendChild(tr);
  });
  
}


// ═══════════════════════════════════════════════════════════
// SELECCIÓN
// ═══════════════════════════════════════════════════════════

function seleccionarTodos() {
  const checks = document.querySelectorAll('.chkRegistro');
  const todosSeleccionados = Array.from(checks).every(c => c.checked);
  checks.forEach(c => (c.checked = !todosSeleccionados));
  actualizarContador();
}

function actualizarContador() {
  const seleccionados = document.querySelectorAll('.chkRegistro:checked').length;
  const btnConfirmar = document.getElementById('btnConfirmar');
  const puedeConfirmar = esModoAprobacion();

  btnConfirmar.disabled = !puedeConfirmar || seleccionados === 0;
  btnConfirmar.textContent = seleccionados > 0
    ? `✅ Confirmar ${seleccionados} registro(s)`
    : '✅ Confirmar seleccionados';
}

// ═══════════════════════════════════════════════════════════
// CONFIRMAR SELECCIONADOS
// ═══════════════════════════════════════════════════════════

async function confirmarSeleccionados() {
  const checksSeleccionados = document.querySelectorAll('.chkRegistro:checked');
  
  if (checksSeleccionados.length === 0) {
    mostrarMensajeConfirmacion('Seleccione al menos un registro', 'warning');
    return;
  }
  
  const filas = [];
  checksSeleccionados.forEach(chk => {
    filas.push(parseInt(chk.dataset.fila));
  });
  
  const confirmar = confirm(
    `¿Está seguro de confirmar ${filas.length} registro(s)?\n\n` +
    `Esta acción no se puede deshacer.`
  );
  
  if (!confirmar) return;
  
  // ═══ BLOQUEAR BOTÓN ═══
  const btnConfirmar = document.getElementById('btnConfirmar');
  btnConfirmar.disabled = true;
  btnConfirmar.classList.add('processing');
  btnConfirmar.textContent = '⏳ Confirmando...';
  
  // Deshabilitar checkboxes mientras procesa
  const allChecks = document.querySelectorAll('.chkRegistro');
  allChecks.forEach(chk => chk.disabled = true);
  
  try {
    await confirmarRegistros(dniActual, filas);
    
    mostrarMensajeConfirmacion(
      `✅ Confirmación enviada para ${filas.length} registro(s). Regresando al menú principal...`,
      'success'
    );
    
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensajeConfirmacion('Error al confirmar: ' + error.message, 'error');
    
    // ═══ RESTAURAR BOTÓN EN ERROR ═══
    btnConfirmar.classList.remove('processing');
    btnConfirmar.disabled = false;
    allChecks.forEach(chk => chk.disabled = false);
    actualizarContador();
  }
}

// ═══════════════════════════════════════════════════════════
// LIMPIAR
// ═══════════════════════════════════════════════════════════

function limpiarTodo() {
  document.getElementById('dniInput').value = '';
  document.getElementById('empleadoInfo').classList.add('hidden');
  document.getElementById('resultados').classList.add('hidden');
  document.getElementById('historial').classList.add('hidden');
  document.getElementById('mensaje').classList.add('hidden');
  registrosActuales = [];
  dniActual = '';
}
