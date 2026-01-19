let playerA = null;
let playerReady = false;

let camStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let lastVideoTime = 0;
let lastPausedTime = null;
let lastTick = Date.now();
/* =========================
   EVENTOS DE SINCRONIZACIÓN
========================= */
let syncEvents = [];
let reactionStartTime = null;

function logEvent(type) {
  if (!playerA || !reactionStartTime) return;

  const event = {
    type,
    videoTime: playerA.getCurrentTime(),
    reactionTime: Date.now() - reactionStartTime
  };

  syncEvents.push(event);
  console.log('Evento:', event);
}
function logSyncEvent(type) {
  if (!reactionStartTime || !playerA) return;

  const currentTime = playerA.getCurrentTime();

  const event = {
    type,
    videoTime: Number(currentTime.toFixed(3)),
    reactionTime: Date.now() - reactionStartTime
  };

  syncEvents.push(event);
  console.log('SYNC EVENT:', event);

  lastVideoTime = currentTime;
}
function logSyncEvent(type) {
  if (!reactionStartTime || !playerA) return;

  const currentTime = playerA.getCurrentTime();

  const event = {
    type,
    videoTime: Number(currentTime.toFixed(3)),
    reactionTime: Date.now() - reactionStartTime
  };

  syncEvents.push(event);
  console.log('SYNC EVENT:', event);

  lastVideoTime = currentTime;
}

/* =========================
   YOUTUBE API
========================= */
window.onYouTubeIframeAPIReady = function () {
  playerA = new YT.Player('playerA', {
    height: '315',
    width: '560',
    playerVars: {
      controls: 1,
      rel: 0
    },
    events: {
      onReady: () => {
        playerReady = true;
        console.log('YouTube READY');
      },
      onStateChange: onPlayerStateChange
    }
  });
};

/* =========================
   EXTRAER ID DE YOUTUBE
========================= */
function extractVideoId(url) {
  const match = url.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/* =========================
   CARGAR VIDEO (NO AUTOPLAY)
========================= */
document.getElementById('loadVideo').addEventListener('click', () => {
  if (!playerReady) return alert('YouTube no listo');

  const url = document.getElementById('videoA').value;
  const id = extractVideoId(url);

  if (!id) return alert('URL inválida');

  playerA.cueVideoById(id);
});

/* =========================
   ACTIVAR CÁMARA (NO GRABA)
========================= */
const camBtn = document.getElementById('startCam');
const camVideo = document.getElementById('playerB');

camBtn.addEventListener('click', async () => {
  try {
    camStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    camVideo.srcObject = camStream;
    camVideo.play();

    camBtn.textContent = '📷 Cámara lista';
    camBtn.disabled = true;

    mediaRecorder = new MediaRecorder(camStream);
    mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
    mediaRecorder.onstop = saveRecording;

    document.getElementById('startReaction').disabled = false;

    console.log('Cámara lista');
  } catch (err) {
    alert('Permisos de cámara o micrófono denegados');
    console.error(err);
  }
});


/* =========================
   INICIAR REACCIÓN
========================= */
const reactionBtn = document.getElementById('startReaction');

reactionBtn.addEventListener('click', () => {
  if (!reactionStartTime) {
    // ▶️ INICIAR
    reactionStartTime = Date.now();
    syncEvents = [];
    lastVideoTime = 0;
    recordedChunks = [];

    mediaRecorder.start();
    playerA.playVideo();

    camBtn.textContent = '🔴 Grabando';
    camBtn.classList.add('recording');

    reactionBtn.textContent = '⏹ Finalizar reacción';

    console.log('Reacción iniciada');
  } else {
  // ⏹ FINALIZAR REACCIÓN
  playerA.pauseVideo();

  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }

  exportSyncJSON(); // 📦 Exporta eventos de sincronización

  camBtn.textContent = '📷 Cámara lista';
  camBtn.classList.remove('recording');

  reactionBtn.textContent = '▶️ Iniciar reacción';
  reactionStartTime = null;

  document.getElementById('downloadReaction').disabled = false;

  console.log('Reacción finalizada');
}    
});


/* =========================
   ESTADOS DE YOUTUBE
========================= */
function onPlayerStateChange(event) {
  if (!reactionStartTime) return;

  const currentTime = playerA.getCurrentTime();
  const now = Date.now();

  const expectedAdvance = (now - lastTick) / 1000;
  const realAdvance = currentTime - lastVideoTime;

  // 🔍 SEEK DETECTION
  if (
    Math.abs(realAdvance - expectedAdvance) > 1.2 &&
    Math.abs(realAdvance) > 1.5
  ) {
    logSyncEvent('seek');
  }

  // ▶️ PLAY
  if (event.data === YT.PlayerState.PLAYING) {
    logSyncEvent('play');
  }

  // ⏸ PAUSE
  if (event.data === YT.PlayerState.PAUSED) {
    logSyncEvent('pause');
  }

  // ⏹ END
  if (event.data === YT.PlayerState.ENDED) {
    logSyncEvent('ended');
  }

  lastVideoTime = currentTime;
  lastTick = now;
}
/* =========================
   GUARDAR VIDEO (MANUAL)
========================= */
function saveRecording() {
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);

  const btn = document.getElementById('downloadReaction');
  btn.onclick = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reaction.webm';
    a.click();
  };
}







