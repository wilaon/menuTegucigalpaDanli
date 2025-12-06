// app.js - Lógica principal de UI

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

// RELOJ
function actualizarReloj() {
    if (elementos.clock) {
        elementos.clock.textContent = formatearFechaHora();
    }
}

// VALIDACIÓN DNI (solo UI)
function validarDNI(dniSinGuiones) {
    if (validarDNILongitud(dniSinGuiones)) {
        const dniConGuiones = formatearDNIConGuiones(dniSinGuiones)
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
            elementos.dniValidation.textContent = '❌ DNI no registrado';
            elementos.dniValidation.className = 'validation-message error show';
            elementos.submitBtn.disabled = true;
        }
    } else {
        // DNI incompleto
        elementos.dniValidation.classList.remove('show');
        elementos.nombre.value = '';
        elementos.nombre.readOnly = false;
        elementos.submitBtn.disabled = true;
    }
}



// VALIDAR HORAS EN TIEMPO REAL
function validarHorasTurno() {
    const turnoSeleccionado = elementos.turno.value;
    const horaEntrada = elementos.horaEntrada.value;
    const horaSalida = elementos.horaSalida.value;
    
    if (!turnoSeleccionado || !horaEntrada || !horaSalida) {
        return; // No validar si falta información
    }
    
    const totalHoras = calcularHoras(horaEntrada, horaSalida);
    if (!totalHoras) return;
    
    // Turnos especiales sin restricción
    const turnosEspeciales = ['1er Día Descanso', '2do Día Descanso', 'Feriado'];
    
    if (turnosEspeciales.includes(turnoSeleccionado)) {
        // Turno especial - siempre válido
        elementos.submitBtn.disabled = false;
        return;
    }
    
    // Determinar horas mínimas
    let horasMinimas = 0;
    if (['06:00 - 15:00', '07:00 - 16:00', '09:00 - 18:00'].includes(turnoSeleccionado)) {
        horasMinimas = 9;
    } else if (['13:00 - 20:00', '14:00 - 21:00','07:00 - 14:00'].includes(turnoSeleccionado)) {
        horasMinimas = 7;
    } else if (['17:00 - 23:00', '18:00 - 00:00', '00:00 - 06:00'].includes(turnoSeleccionado)) {
        horasMinimas = 6;
    }
    
    // Validar horas
    if (totalHoras < horasMinimas) {
        mostrarMensaje(
            elementos.errorMessage, 
            `El turno ${turnoSeleccionado} requiere ${horasMinimas} horas. Ingresó ${totalHoras.toFixed(2)} horas`, 
            'error'
        );
        elementos.submitBtn.disabled = true;
    } else {
        elementos.submitBtn.disabled = false;
        elementos.errorMessage.classList.remove('show');
    }
}



// PROCESAR FORMULARIO
async function procesarFormulario(e) {
    e.preventDefault();
    
    // Solo validaciones básicas de UI
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

    
    // Mostrar loading
    elementos.loading.style.display = 'block';
    elementos.submitBtn.disabled = true;
    
    const dniConGuiones = elementos.dni.value;
    // Preparar datos para el servidor
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
    
    console.log('Enviando datos');
    
    // El servidor hará TODAS las validaciones críticas
    const resultado = await guardarAsistencia(datos);
    
    // Ocultar loading
    elementos.loading.style.display = 'none';
    elementos.submitBtn.disabled = false;
    
    // Mostrar resultado
    if (resultado.success) {
        mostrarMensaje(
            elementos.successMessage, 
            resultado.mensaje, 
            'success'
        );
        
        // Limpiar formulario
        elementos.form.reset();
        configurarCalendario(elementos.fecha);
        elementos.dniValidation.classList.remove('show');
        elementos.nombre.readOnly = false;
        elementos.submitBtn.disabled = true;
        
    } else {
        // Mostrar errores del servidor
        const mensajeError = resultado.errores ? 
            resultado.errores.join(', ') : 
            resultado.mensaje || 'Error desconocido';
            
        mostrarMensaje(elementos.errorMessage, mensajeError, 'error', 8000);
    }
}

// EVENT LISTENERS
function inicializarEventos() {
    // Input DNI - solo números
  elementos.dni.addEventListener('input', function(e) {
        
        let valor = e.target.value.replace(/\D/g, '');
       
        valor = valor.substring(0, 13);

        if (valor.length > 8) {
            valor = valor.substring(0, 4) + '-' + valor.substring(4, 8) + '-' + valor.substring(8);
        } else if (valor.length > 4) {
            valor = valor.substring(0, 4) + '-' + valor.substring(4);
        }
        
        e.target.value = valor;
        
        
        if (valor.length === 15) {
            const dniSinGuiones = valor.replace(/-/g, '');
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
    
    console.log('Eventos inicializados');
}

// INICIALIZACIÓN
async function inicializar() {
    try {
        console.log('Iniciando sistema...');
        
        
        configurarCalendario(elementos.fecha);
        
        // Iniciar reloj
        actualizarReloj();
        setInterval(actualizarReloj, 1000);
        
        // Cargar datos del servidor
       
        await cargarEmpleados();
        
       
        const turnos = await cargarTurnos();
        llenarSelect(elementos.turno, turnos, 'Seleccionar turno...');
        
        
        console.log('Cargando ingenieros...');
        const ingenieros = await cargarIngenierosTurno();
        llenarSelect(elementos.turnoIngeniero, ingenieros, 'Seleccionar ingeniero...');
        
        // Configurar eventos
        inicializarEventos();
        
        
    } catch (error) {
       
        mostrarMensaje(elementos.errorMessage, 'Error al cargar el sistema', 'error');
    }
}

// INICIO CUANDO DOM ESTÉ LISTO
document.addEventListener('DOMContentLoaded', inicializar);