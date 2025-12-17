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
        const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getTurnos`);
        const data = await response.json();
        
        if (data.success) {
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
            return data.ingenieros;
        }
        
        throw new Error('Error al cargar ingenieros');
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// ENVIAR ASISTENCIA
async function guardarAsistencia(datos) {
    try {
        const validacion = validarHorasTurno(
            datos.turno,
            datos.horaEntrada,
            datos.horaSalida
        );
        
        if (!validacion.valido) {
            return {
                success: false,
                mensaje: validacion.error,
                errores: [validacion.error]
            };
        }
        
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
        
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'guardarAsistencia',
                fila: fila
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        // LEER RESPUESTA 
        const resultado = await response.json();
        
        console.log(' Respuesta del servidor:', resultado);
        
        //SERVIDOR RESPONDE
        if (resultado.success) {
            return {
                success: true,
                mensaje: 'Asistencia registrada correctamente',
                datos: resultado
            };
        } else {
            return {
                success: false,
                mensaje: resultado.error || 'Error al guardar',
                errores: [resultado.error || 'Error desconocido']
            };
        }
        
    } catch (error) {
        console.error(' Error:', error);
        
        if (error.message.includes('Failed to fetch')) {
            return { 
                success: false, 
                mensaje: 'Sin conexión al servidor',
                errores: ['Verifique su conexión a internet']
            };
        }
        return { 
            success: false, 
            mensaje: 'Error: ' + error.message,
            errores: [error.message]
        };
    }
}