/**
 * ═══════════════════════════════════════════════════════════
 * CONFIG.JS - Configuración centralizada
 * ═══════════════════════════════════════════════════════════
 */

const CONFIG = {
  // API URL única para todo el sistema
  API_URL: 'https://apihorasextras.wavilanuez.workers.dev/',
  
  // Duración del cache (5 minutos)
  CACHE_DURATION: 300000,
  
  // URLs internas del sistema
  RUTAS: {
    MENU: '/',
    FORMULARIO: '/formulario-horas',
    CONFIRMACION: '/confirmacion-horas'
  }
};

// Para compatibilidad con código existente
const GOOGLE_SCRIPT_URL = CONFIG.API_URL;
