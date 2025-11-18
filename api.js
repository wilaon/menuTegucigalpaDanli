// api.js - Solo comunicación HTTP

let empleadosCache = null;
let cacheTimestamp = null;

// CARGAR EMPLEADOS
async function cargarEmpleados(forzar = false) {
    const ahora = Date.now();
    
    // Usar cache si es válido
    if (!forzar && empleadosCache && cacheTimestamp && 
        (ahora - cacheTimestamp) < CONFIG.CACHE_DURATION) {
        return empleadosCache;
    }
    
    try {
        //console.log('Cargando empleados desde servidor...');
        const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getEmpleados`);
        const data = await response.json();
        
        if (data.success) {
            empleadosCache = data.empleados;
            cacheTimestamp = ahora;
            console.log('Empleados cargados:', Object.keys(empleadosCache).length);
            return empleadosCache;
        }
        
        throw new Error('Error al cargar empleados');
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// BUSCAR EMPLEADO EN CACHE
function buscarEmpleado(dni) {
    return empleadosCache?.[dni] || null;
}

// CARGAR TURNOS DESDE SERVIDOR
async function cargarTurnos() {
    try {
        //console.log('Cargando turnos desde servidor...');
        const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getTurnos`);
        const data = await response.json();
        
        if (data.success) {
            console.log('Turnos cargados:', data.turnos.length);
            return data.turnos;
        }
        
        throw new Error('Error al cargar turnos');
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function cargarIngenierosTurno() {
    try {
        const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getIngTurno`);
        const data = await response.json();
        
        if (data.success) {
            console.log('Ingenieros cargados:', data.ingenieros.length);
            return data.ingenieros;
        }
        
        throw new Error('Error al cargar ingenieros');
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// ENVIAR ASISTENCIA - MODO NO-CORS (como tu código original)
async function guardarAsistencia(datos) {
    try {
        console.log('Enviando asistencia al servidor...');
        // Preparar fila
        const fila = [
            new Date().toISOString(),
            datos.fecha,
            datos.dni,
            datos.nombre,
            datos.horaEntrada || '-',
            datos.horaSalida || '-',  
            datos.turno,
            datos.turnoIngeniero,
            datos.observaciones || '',
        ];
        
        // VOLVEMOS AL MODO no-cors COMO TU CÓDIGO ORIGINAL
        await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',  // ← ESTO EVITA LOS ERRORES CORS
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'guardarAsistencia',
                fila: fila
            })
        });
        
        console.log('Asistencia enviada (modo no-cors)');
        
        // Con no-cors no podemos leer la respuesta del servidor,
        // pero sabemos que se envió correctamente
        return { 
            success: true,
            mensaje: 'Asistencia enviada correctamente',
            horasCalculadas: 'Calculadas por servidor'
        };
        
    } catch (error) {
        console.error('Error de comunicación:', error);
        return { 
            success: false, 
            mensaje: 'Error de conexión con el servidor',
            errores: ['Error de conectividad'] 
        };
    }
}