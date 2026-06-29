/* ==========================================
   SyncReact 2.1
   ui.js
========================================== */

const camBtn = document.getElementById("startCam");
const reactionBtn = document.getElementById("startReaction");
const downloadBtn = document.getElementById("downloadReaction");

/* ==========================================
   Inicialización
========================================== */

export function initUI() {

    hideDownload();

    setCameraInactive();

}

/* ==========================================
   CÁMARA
========================================== */

export function setCameraInactive() {

    camBtn.disabled = false;
    camBtn.textContent = "📷 Activar cámara";
    camBtn.classList.remove("recording");

}

export function setCameraReady() {

    camBtn.disabled = true;
    camBtn.textContent = "📷 Cámara lista";
    camBtn.classList.remove("recording");

}

export function setCameraRecording() {

    camBtn.textContent = "🔴 Grabando";
    camBtn.classList.add("recording");

}

/* ==========================================
   REACCIÓN
========================================== */

export function setReactionStopped() {

    reactionBtn.textContent = "▶️ Iniciar reacción";
    reactionBtn.disabled = false;

}

export function setReactionRunning() {

    reactionBtn.textContent = "⏹ Finalizar reacción";
    reactionBtn.disabled = false;

}

export function setReactionProcessing() {

    reactionBtn.textContent = "⏳ Procesando...";
    reactionBtn.disabled = true;

}

/* ==========================================
   DESCARGA
========================================== */

export function hideDownload() {

    downloadBtn.disabled = true;

}

export function showDownload() {

    downloadBtn.disabled = false;

}
