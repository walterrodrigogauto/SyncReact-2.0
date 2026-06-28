/* ==========================================
   SyncReact 2.1
   sync.js
========================================== */

import {
    playVideo,
    pauseVideo,
    getCurrentTime,
    getVideoId
} from "./youtube.js";

import {
    startRecording,
    stopRecording,
    prepareDownload,
    getReactionBlob
} from "./camera.js";

import {
    saveReaction
} from "./supabase.js";

/* ==========================================
   ESTADO GLOBAL
========================================== */

let reactionRunning = false;

let reactionStartTime = null;

let syncEvents = [];

let lastVideoTime = 0;
let lastClockTime = 0;

let seekTimer = null;

const SEEK_DEBOUNCE = 600;

/* ==========================================
   ELEMENTOS UI
========================================== */

const reactionBtn =
    document.getElementById("startReaction");

const downloadBtn =
    document.getElementById("downloadReaction");

/* ==========================================
   INICIALIZACIÓN
========================================== */

export function initSync() {

    reactionBtn.addEventListener(
        "click",
        toggleReaction
    );

    document.addEventListener(
        "youtubeState",
        handleYoutubeState
    );

    document.addEventListener(
        "recordingFinished",
        handleRecordingFinished
    );

}

/* ==========================================
   INICIAR / FINALIZAR
========================================== */

function toggleReaction() {

    if (!reactionRunning) {

        startReaction();

    } else {

        endReaction();

    }

}

/* ==========================================
   INICIAR REACCIÓN
========================================== */

function startReaction() {

    console.log("▶️ Reacción iniciada");

    reactionRunning = true;

    reactionStartTime = Date.now();

    syncEvents = [];

    lastVideoTime = 0;
    lastClockTime = Date.now();

    reactionBtn.textContent =
        "⏹ Finalizar reacción";

    downloadBtn.disabled = true;

    startRecording();

    playVideo();

}

/* ==========================================
   FINALIZAR REACCIÓN
========================================== */

async function endReaction() {

    console.log("⏹ Finalizando reacción");

    reactionRunning = false;

    pauseVideo();

    stopRecording();

    reactionBtn.textContent =
        "▶️ Iniciar reacción";

}
