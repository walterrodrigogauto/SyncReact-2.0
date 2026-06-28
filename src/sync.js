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
/* ==========================================
   EVENTOS YOUTUBE
========================================== */

function handleYoutubeState(event) {

    if (!reactionRunning)
        return;

    const state = event.detail;

    const currentTime = getCurrentTime();

    const now = Date.now();

    /* ==========================
       DETECCIÓN DE SEEK
    ========================== */

    const realAdvance =
        currentTime - lastVideoTime;

    const expectedAdvance =
        (now - lastClockTime) / 1000;

    if (
        Math.abs(realAdvance - expectedAdvance) > 1.2 &&
        Math.abs(realAdvance) > 1.5
    ) {

        clearTimeout(seekTimer);

        seekTimer = setTimeout(() => {

            logSyncEvent("seek");

        }, SEEK_DEBOUNCE);

    }

    lastVideoTime = currentTime;
    lastClockTime = now;

    /* ==========================
       PLAY
    ========================== */

    if (state === YT.PlayerState.PLAYING) {

        logSyncEvent("play");

    }

    /* ==========================
       PAUSE
    ========================== */

    if (state === YT.PlayerState.PAUSED) {

        logSyncEvent("pause");

    }

    /* ==========================
       VIDEO FINALIZADO
    ========================== */

    if (state === YT.PlayerState.ENDED) {

        logSyncEvent("ended");

        endReaction();

    }

}

/* ==========================================
   REGISTRAR EVENTO
========================================== */

function logSyncEvent(type) {

    const event = {

        type,

        videoTime: Number(
            getCurrentTime().toFixed(3)
        ),

        reactionTime:
            Date.now() - reactionStartTime

    };

    syncEvents.push(event);

    console.log("Evento:", event);

}
/* ==========================================
   GRABACIÓN FINALIZADA
========================================== */

async function handleRecordingFinished() {

    console.log("🎬 Grabación terminada");

    prepareDownload();

    exportSyncJSON();

    await uploadReaction();

}

/* ==========================================
   EXPORTAR JSON
========================================== */

function exportSyncJSON() {

    const json = {

        version: "2.1",

        createdAt: new Date().toISOString(),

        youtubeVideoId: getVideoId(),

        events: syncEvents

    };

    const blob = new Blob(

        [JSON.stringify(json, null, 2)],

        {
            type: "application/json"
        }

    );

    const url = URL.createObjectURL(blob);

    downloadBtn.onclick = () => {

        const a = document.createElement("a");

        a.href = url;

        a.download = "syncreact-sync.json";

        a.click();

    };

    console.log("📄 JSON preparado");

}

/* ==========================================
   SUBIR REACCIÓN
========================================== */

async function uploadReaction() {

    try {

        const videoBlob = getReactionBlob();

        await saveReaction({

            youtubeVideoId: getVideoId(),

            syncEvents,

            videoBlob

        });

        console.log("☁️ Reacción subida");

    }

    catch (err) {

        console.error(err);

    }

}
