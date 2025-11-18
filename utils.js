// utils.js - Solo utilidades de UI

// FECHAS
function obtenerFechaActual() {
    return new Date().toISOString().split('T')[0];
}

function formatearFechaHora() {
    return new Date().toLocaleString('es-HN');
}

// MENSAJES
function mostrarMensaje(elemento, texto, tipo = 'info', duracion = 5000) {
    if (!elemento) return;
    
    elemento.textContent = texto;
    elemento.className = `message ${tipo} show`;
    
    setTimeout(() => {
        elemento.classList.remove('show');
    }, duracion);
}

// MOSTRAR/OCULTAR ELEMENTOS
function mostrarElemento(elemento, mostrar = true) {
    if (!elemento) return;
    
    if (mostrar) {
        elemento.classList.add('show');
    } else {
        elemento.classList.remove('show');
    }
}

// SELECT HELPERS
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
            option.value = texto;      // ✅ Value = texto
            option.textContent = texto; // ✅ Text = texto
        }
        selectElement.appendChild(option);
    });
}

// CONFIGURAR CALENDARIO
function configurarCalendario(elementoFecha) {
    if (!elementoFecha) return;
    
    const hoy = new Date();
    const hace20Dias = new Date(hoy);
    hace20Dias.setDate(hoy.getDate() - 13);
    
    elementoFecha.min = hace20Dias.toISOString().split('T')[0];
    elementoFecha.max = hoy.toISOString().split('T')[0];
    elementoFecha.value = obtenerFechaActual();
}


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


function calcularHoras(horaEntrada, horaSalida) {
    if (!horaEntrada || !horaSalida) return null;
    
    const parseHora = h => {
        const [HH, MM] = h.split(':').map(Number);
        return (isNaN(HH) || isNaN(MM)) ? null : HH * 60 + MM;
    };

    let entradaMin = parseHora(horaEntrada);
    let salidaMin = parseHora(horaSalida);
    
    if (entradaMin === null || salidaMin === null) return null;
    
    // Si la salida es menor, asumimos que es al día siguiente
    if (salidaMin <= entradaMin) salidaMin += 24 * 60;
    
    // Retornar total de horas (simple, solo para validación)
    return (salidaMin - entradaMin) / 60;
}