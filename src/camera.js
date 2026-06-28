/* ==========================================
   SyncReact 2.1
   camera.js
========================================== */

let stream = null;
let recorder = null;
let chunks = [];

const camBtn = document.getElementById("startCam");
const video = document.getElementById("playerB");
const downloadBtn = document.getElementById("downloadReaction");

/* ==========================================
   Inicialización
========================================== */

export function initCamera() {

    camBtn.addEventListener("click", activateCamera);

}

/* ==========================================
   Activar cámara
========================================== */

async function activateCamera() {

    try {

        stream = await navigator.mediaDevices.getUserMedia({

            video: true,
            audio: true

        });

        video.srcObject = stream;
        await video.play();

        recorder = new MediaRecorder(stream);

        recorder.ondataavailable = e => {

            if (e.data.size > 0)
                chunks.push(e.data);

        };

        recorder.onstop = () => {

            document.dispatchEvent(

                new CustomEvent("recordingFinished")

            );

        };

        camBtn.textContent = "📷 Cámara lista";
        camBtn.disabled = true;

        console.log("📷 Cámara activada");

        document.dispatchEvent(

            new CustomEvent("cameraReady")

        );

    }

    catch (err) {

        console.error(err);

        alert("No fue posible acceder a la cámara.");

    }

}

/* ==========================================
   Comenzar grabación
========================================== */

export function startRecording() {

    if (!recorder)
        return;

    chunks = [];

    recorder.start();

    camBtn.textContent = "🔴 Grabando";
    camBtn.classList.add("recording");

    console.log("🔴 Grabando");

}

/* ==========================================
   Finalizar grabación
========================================== */

export function stopRecording() {

    if (!recorder)
        return;

    if (recorder.state === "recording")
        recorder.stop();

    camBtn.textContent = "📷 Cámara lista";
    camBtn.classList.remove("recording");

}

/* ==========================================
   Descargar WEBM
========================================== */

export function prepareDownload() {

    const blob = new Blob(chunks, {

        type: "video/webm"

    });

    const url = URL.createObjectURL(blob);

    downloadBtn.disabled = false;

    downloadBtn.onclick = () => {

        const a = document.createElement("a");

        a.href = url;
        a.download = "reaction.webm";

        a.click();

    };

}

/* ==========================================
   Obtener Blob
========================================== */

export function getReactionBlob() {

    return new Blob(chunks, {

        type: "video/webm"

    });

}

/* ==========================================
   Estado
========================================== */

export function isCameraReady() {

    return recorder !== null;

}

export function isRecording() {

    if (!recorder)
        return false;

    return recorder.state === "recording";

}
