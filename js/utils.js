/**
 * ═══════════════════════════════════════════════════════════
 * UTILS.JS - Utilidades compartidas
 * ═══════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════
// FECHAS
// ═══════════════════════════════════════════════════════════

function obtenerFechaActual() {
  return new Date().toISOString().split('T')[0];
}

function formatearFechaHora() {
  return new Date().toLocaleString('es-HN');
}

function formatearFecha(fecha) {
  if (!fecha) return '-';
  
  // Si la fecha ya viene en formato "YYYY-MM-DD"
  if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [año, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${año}`;
  }
  
  // Si es un objeto Date o string con hora
  const d = new Date(fecha);
  const año = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  
  return `${dia}/${mes}/${año}`;
}

// ═══════════════════════════════════════════════════════════
// MENSAJES
// ═══════════════════════════════════════════════════════════

function mostrarMensaje(elemento, texto, tipo = 'info', duracion = 5000) {
  if (!elemento) return;
  
  // Si es string (ID), buscar elemento
  if (typeof elemento === 'string') {
    elemento = document.getElementById(elemento);
    if (!elemento) return;
  }
  
  elemento.textContent = texto;
  elemento.className = `message ${tipo} show`;
  
  setTimeout(() => {
    elemento.classList.remove('show');
  }, duracion);
}

// ═══════════════════════════════════════════════════════════
// MOSTRAR/OCULTAR ELEMENTOS
// ═══════════════════════════════════════════════════════════

function mostrarElemento(elemento, mostrar = true) {
  if (!elemento) return;
  
  if (typeof elemento === 'string') {
    elemento = document.getElementById(elemento);
  }
  
  if (!elemento) return;
  
  if (mostrar) {
    elemento.classList.remove('hidden');
    elemento.classList.add('show');
  } else {
    elemento.classList.add('hidden');
    elemento.classList.remove('show');
  }
}

// ═══════════════════════════════════════════════════════════
// SELECT HELPERS
// ═══════════════════════════════════════════════════════════

function llenarSelect(selectElement, opciones, valorPorDefecto = '') {
  if (!selectElement) return;
  
  selectElement.innerHTML = '';
  
  // Opción por defecto
  if (valorPorDefecto) {
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = valorPorDefecto;
    selectElement.appendChild(defaultOption);
  }
  
  // Opciones dinámicas
  opciones.forEach(opcion => {
    const option = document.createElement('option');
    if (typeof opcion === 'string') {
      option.value = opcion;
      option.textContent = opcion;
    } else {
      const texto = opcion.texto || opcion.turno || opcion.nombre;
      option.value = texto;
      option.textContent = texto;
    }
    selectElement.appendChild(option);
  });
}

// ═══════════════════════════════════════════════════════════
// CONFIGURAR CALENDARIO
// ═══════════════════════════════════════════════════════════

function configurarCalendario(elementoFecha) {
  if (!elementoFecha) return;
  
  const hoy = new Date();
  const hace11Dias = new Date(hoy);
  hace11Dias.setDate(hoy.getDate() - 11);
  
  elementoFecha.min = hace11Dias.toISOString().split('T')[0];
  elementoFecha.max = hoy.toISOString().split('T')[0];
  elementoFecha.value = obtenerFechaActual();
}

// ═══════════════════════════════════════════════════════════
// DNI
// ═══════════════════════════════════════════════════════════

function validarDNILongitud(dni) {
  return dni && dni.length === 13;
}

function formatearDNIConGuiones(dni) {
  if (!dni) return '';
  const limpio = dni.replace(/\D/g, '').substring(0, 13);
  if (limpio.length === 13) {
    return limpio.substring(0, 4) + '-' + limpio.substring(4, 8) + '-' + limpio.substring(8);
  }
  return limpio;
}

function formatearDNIInput(valor) {
  let limpio = valor.replace(/\D/g, '').substring(0, 13);
  
  if (limpio.length > 8) {
    return limpio.substring(0, 4) + '-' + limpio.substring(4, 8) + '-' + limpio.substring(8);
  } else if (limpio.length > 4) {
    return limpio.substring(0, 4) + '-' + limpio.substring(4);
  }
  
  return limpio;
}

// ═══════════════════════════════════════════════════════════
// CÁLCULO DE HORAS
// ═══════════════════════════════════════════════════════════

function calcularHoras(horaEntrada, horaSalida) {
  if (!horaEntrada || !horaSalida) return null;
  
  const parseHora = h => {
    const [HH, MM] = h.split(':').map(Number);
    return (isNaN(HH) || isNaN(MM)) ? null : HH * 60 + MM;
  };

  let entradaMin = parseHora(horaEntrada);
  let salidaMin = parseHora(horaSalida);
  
  if (entradaMin === null || salidaMin === null) return null;
  
  // Si salida es menor, es del día siguiente
  if (salidaMin <= entradaMin) salidaMin += 24 * 60;
  
  return (salidaMin - entradaMin) / 60;
}

// ═══════════════════════════════════════════════════════════
// VERIFICACIÓN DE FECHAS
// ═══════════════════════════════════════════════════════════

function esPrimeraSemanaDelMes() {
  const hoy = new Date();
  const diaDelMes = hoy.getDate();
  return diaDelMes >= 2 && diaDelMes <= 7;
}
