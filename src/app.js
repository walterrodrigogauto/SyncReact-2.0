/* ==========================================
   SyncReact 2.1
   Archivo principal
========================================== */

import { initYouTube } from './youtube.js';
import { initCamera } from './camera.js';
import { initSync } from './sync.js';
import { initSupabase } from './supabase.js';
import { initUI } from './ui.js';

/* ==========================================
   INICIO
========================================== */

window.addEventListener('DOMContentLoaded', async () => {

    console.log('🚀 SyncReact iniciando...');

    // Base de datos
    await initSupabase();

    // Interfaz
    initUI();

    // Cámara
    initCamera();

    // YouTube
    initYouTube();

    // Sincronización
    initSync();

    console.log('✅ SyncReact listo');

});
