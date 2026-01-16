/**
 * ═══════════════════════════════════════════════════════════
 * API.JS - Comunicación con el servidor
 * ═══════════════════════════════════════════════════════════
 */

// Cache de empleados
let empleadosCache = null;
let cacheTimestamp = null;


/**
 * Realiza una petición GET al servidor
 * @param {string} action - Acción a ejecutar
 * @param {Object} params - Parámetros adicionales (opcional)
 * @param {number} timeout - Timeout en ms (por defecto 30s)
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function getFromServer(action, params = {}, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // Construir URL con parámetros
    const url = new URL(CONFIG.API_URL);
    url.searchParams.append('action', action);
    
    // Agregar parámetros adicionales
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
    
    console.log(`📡 GET: ${action}`, params);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log(`✅ Respuesta GET ${action}:`, result);
    
    return result;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error(`⏱️ Timeout en GET ${action}`);
      throw new Error(`La operación excedió el tiempo límite (${timeout/1000}s)`);
    }
    
    if (error instanceof TypeError) {
      console.error(`🔌 Error de red en GET ${action}`, error);
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión.');
    }
    
    console.error(`❌ Error en GET ${action}`, error);
    throw error;
  }
}

/**
 * Realiza una petición POST al servidor
 * @param {string} action - Acción a ejecutar
 * @param {Object} data - Datos a enviar
 * @param {number} timeout - Timeout en ms (por defecto 30s)
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function postToServer(action, data = {}, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    console.log(`📤 POST: ${action}`, data);
    
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        ...data
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    console.log(`✅ Respuesta POST ${action}:`, result);
    
    // Verificar si hay error en la respuesta
    if (result.success === false) {
      throw new Error(result.error || 'Error desconocido en el servidor');
    }
    
    return result;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error(`⏱️ Timeout en POST ${action}`);
      throw new Error(`La operación excedió el tiempo límite (${timeout/1000}s)`);
    }
    
    if (error instanceof TypeError) {
      console.error(`🔌 Error de red en POST ${action}`, error);
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión.');
    }
    
    console.error(`❌ Error en POST ${action}`, error);
    throw error;
  }
}



// ═══════════════════════════════════════════════════════════
// EMPLEADOS
// ═══════════════════════════════════════════════════════════

async function cargarEmpleados(forzar = false) {
  const ahora = Date.now();
  
  // Usar cache si es válido
  if (!forzar && empleadosCache && cacheTimestamp && 
      (ahora - cacheTimestamp) < CONFIG.CACHE_DURATION) {
    return empleadosCache;
  }
  
  try {
    const data = await getFromServer('getEmpleados');
    
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

function buscarEmpleado(dni) {
  return empleadosCache?.[dni] || null;
}

// ═══════════════════════════════════════════════════════════
// TURNOS
// ═══════════════════════════════════════════════════════════

async function cargarTurnos() {
  try {
    const data = await getFromServer('getTurnos');
    
    if (data.success) {
      return data.turnos;
    }
    
    throw new Error('Error al cargar turnos');
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════
// INGENIEROS
// ═══════════════════════════════════════════════════════════

async function cargarIngenierosTurno() {
  try {
    const data = await getFromServer('getIngTurno');
    
    if (data.success) {
      return data.ingenieros;
    }
    
    throw new Error('Error al cargar ingenieros');
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════
// GUARDAR ASISTENCIA
// ═══════════════════════════════════════════════════════════

async function guardarAsistencia(datos) {
  try {
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
    
    const resultado = await postToServer('guardarAsistencia', { fila: fila });
    
    return {
      success: true,
      mensaje: 'Asistencia registrada correctamente',
      datos: resultado
    };
    
  } catch (error) {
    console.error('Error guardando asistencia:', error);
    
    return {
      success: false,
      mensaje: error.message || 'Error al guardar',
      errores: [error.message || 'Error desconocido']
    };
  }
}

// ═══════════════════════════════════════════════════════════
// CONFIRMACIÓN DE HORAS
// ═══════════════════════════════════════════════════════════

async function obtenerRegistrosPendientes(dni) {
  try {
    const data = await getFromServer('obtenerRegistrosPendientes', { dni: dni });
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function confirmarRegistros(dni, filas) {
  try {
    const resultado = await postToServer('confirmarRegistros', {
      dni: dni,
      filas: filas
    });
    
    return {
      success: true,
      confirmados: resultado.confirmados || filas.length
    };
    
  } catch (error) {
    console.error('Error confirmando registros:', error);
    throw error;
  }
}
