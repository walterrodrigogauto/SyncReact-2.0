let playerA = null;
let playerReady = false;

let camStream = null;
let mediaRecorder = null;
let recordedChunks = [];

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
document.getElementById('startCam').addEventListener('click', async () => {
  camStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

 const camBtn = document.getElementById('startCam');
const camVideo = document.getElementById('playerB');

camBtn.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    camVideo.srcObject = stream;
    camVideo.play();

    camBtn.textContent = '📷 Cámara lista';
    camBtn.disabled = true;

    console.log('Cámara activa');
  } catch (err) {
    alert('Permisos de cámara o micrófono denegados');
    console.error(err);
  }
});
/* =========================
   INICIAR REACCIÓN
========================= */
document.getElementById('startReaction').addEventListener('click', () => {
  if (!playerA || !mediaRecorder) return;

  reactionStartTime = Date.now();
  syncEvents = [];
  recordedChunks = [];

  mediaRecorder.start();
  playerA.playVideo();

  camBtn.textContent = '🔴 Grabando';
});

/* =========================
   ESTADOS DE YOUTUBE
========================= */
function onPlayerStateChange(event) {
  if (!reactionStartTime) return;

  if (event.data === YT.PlayerState.PLAYING) {
    logEvent('play');
  }

  if (event.data === YT.PlayerState.PAUSED) {
    logEvent('pause');
  }

  if (event.data === YT.PlayerState.ENDED) {
    logEvent('ended');

    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.stop();
    }

    document.getElementById('recordStatus').textContent =
      '✅ Grabación finalizada';
    document.getElementById('downloadReaction').disabled = false;

    console.table(syncEvents);
  }
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
const reactionBtn = document.getElementById('startReaction');

reactionBtn.addEventListener('click', () => {
  if (!reactionStartTime) {
    reactionStartTime = Date.now();
    syncEvents = [];
    reactionBtn.textContent = '⏹ Finalizar reacción';
    console.log('Reacción iniciada');
  } else {
    endReaction();
  }
});

