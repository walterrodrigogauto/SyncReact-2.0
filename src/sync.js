/* =========================
   ESTADO GLOBAL
========================= */
let playerA = null;
let playerReady = false;

let camStream = null;
let mediaRecorder = null;
let recordedChunks = [];

let reactionStartTime = null;
let syncEvents = [];

let lastVideoTime = 0;
let lastTickTime = null;

let seekDebounceTimer = null;
const SEEK_DEBOUNCE_MS = 600;

/* =========================
   UTILIDADES
========================= */
function nowReactionTime() {
  return Date.now() - reactionStartTime;
}
  function logSyncEvent(type) {
  if (!reactionStartTime || !playerA) return;

  const event = {
    type,
    videoTime: Number(playerA.getCurrentTime().toFixed(3)),
    reactionTime: nowReactionTime()
  };

  syncEvents.push(event);
  console.log('Evento:', event);
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
   EXTRAER ID YOUTUBE
========================= */
function extractVideoId(url) {
  const match = url.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/* =========================
   CARGAR VIDEO (NO autoplay)
========================= */
document.getElementById('loadVideo').addEventListener('click', () => {
  if (!playerReady) return alert('YouTube no listo');

  const url = document.getElementById('videoA').value;
  const id = extractVideoId(url);
  if (!id) return alert('URL inválida');

  playerA.cueVideoById(id);
});

/* =========================
   ACTIVAR CÁMARA (NO graba)
========================= */
const camBtn = document.getElementById('startCam');
const camVideo = document.getElementById('playerB');
const reactionBtn = document.getElementById('startReaction');
const downloadBtn = document.getElementById('downloadReaction');

camBtn.addEventListener('click', async () => {
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
  mediaRecorder.onstop = () => {
    downloadBtn.disabled = false;
  };

  reactionBtn.disabled = false;
});

/* =========================
   INICIAR / FINALIZAR REACCIÓN
========================= */
reactionBtn.addEventListener('click', () => {
  // ▶️ INICIAR
  if (!reactionStartTime) {
    reactionStartTime = Date.now();
    syncEvents = [];
    recordedChunks = [];
    lastVideoTime = 0;
    lastTickTime = Date.now();

    mediaRecorder.start();
    playerA.playVideo();

    camBtn.textContent = '🔴 Grabando';
    camBtn.classList.add('recording');

    reactionBtn.textContent = '⏹ Finalizar reacción';

    console.log('Reacción iniciada');
    return;
  }

  // ⏹ FINALIZAR
  endReaction();
});

/* =========================
   FINALIZAR REACCIÓN
========================= */
function endReaction() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }

  playerA.pauseVideo();

  camBtn.textContent = '📷 Cámara lista';
  camBtn.classList.remove('recording');

  reactionBtn.textContent = '▶️ Iniciar reacción';
  reactionBtn.disabled = true;
const videoId = playerA.getVideoData().video_id;
saveReactionToDB(videoId, syncEvents);
  exportSyncJSON();

  // LIMPIEZA
  reactionStartTime = null;
  lastVideoTime = 0;
  lastTickTime = null;
  clearTimeout(seekDebounceTimer);

  console.log('Reacción finalizada');
}

/* =========================
   YOUTUBE STATE + SEEK
========================= */
function onPlayerStateChange(event) {
  if (!reactionStartTime) return;

  const currentTime = playerA.getCurrentTime();
  const now = Date.now();

  if (lastTickTime !== null) {
    const realAdvance = currentTime - lastVideoTime;
    const expectedAdvance = (now - lastTickTime) / 1000;

    // 🔍 SEEK DETECTION (con debounce)
    if (
      Math.abs(realAdvance - expectedAdvance) > 1.2 &&
      Math.abs(realAdvance) > 1.5
    ) {
      clearTimeout(seekDebounceTimer);
      seekDebounceTimer = setTimeout(() => {
        logSyncEvent('seek');
      }, SEEK_DEBOUNCE_MS);
    }
  }

  lastVideoTime = currentTime;
  lastTickTime = now;

  if (event.data === YT.PlayerState.PLAYING) {
    logSyncEvent('play');
  }

  if (event.data === YT.PlayerState.PAUSED) {
    logSyncEvent('pause');
  }

  if (event.data === YT.PlayerState.ENDED) {
    logSyncEvent('ended');
    endReaction();
  }
}
const videoId = playerA.getVideoData().video_id;
saveReactionToDB(videoId, syncEvents);
/* =========================
   EXPORTAR JSON DE SINCRONÍA
========================= */
function exportSyncJSON() {
  const data = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    events: syncEvents
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);

  downloadBtn.onclick = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'syncreact-sync.json';
    a.click();
  };

  console.log('JSON listo para exportar', data);
}
async function saveReactionToDB(videoId, events) {
  const { data, error } = await supabase
    .from('reactions')
    .insert([
      {
        youtube_video_id: videoId,
        sync_events: events
      }
    ])
    .select();

  if (error) {
    console.error('Error guardando en DB:', error);
    return null;
  }

  console.log('Guardado en DB:', data);
  return data[0];
}
