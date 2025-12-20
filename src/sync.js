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

  syncEvents.push({
    type,
    videoTime: playerA.getCurrentTime(),
    reactionTime: Date.now() - reactionStartTime
  });

  console.log('Evento:', type, syncEvents[syncEvents.length - 1]);
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
   EXTRAER ID
========================= */
function extractVideoId(url) {
  const match = url.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/* =========================
   CARGAR VIDEO
========================= */
document.getElementById('loadVideo').addEventListener('click', () => {
  if (!playerReady) {
    alert('YouTube no listo');
    return;
  }

  const url = document.getElementById('videoA').value;
  const id = extractVideoId(url);

  if (!id) {
    alert('URL inválida');
    return;
  }

  playerA.cueVideoById(id); // 👈 NO autoplay
});

/* =========================
   ACTIVAR CÁMARA (NO graba)
========================= */
document.getElementById('startCam').addEventListener('click', async () => {
  camStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  const camVideo = document.getElementById('playerB');
  camVideo.srcObject = camStream;
  camVideo.play();

  document.getElementById('recordStatus').textContent = '📷 Cámara lista';

  mediaRecorder = new MediaRecorder(camStream);
  mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
  mediaRecorder.onstop = saveRecording;

  document.getElementById('startReaction').disabled = false;
});

/* =========================
   INICIAR REACCIÓN
========================= */
document.getElementById('startReaction').addEventListener('click', () => {
  if (!playerA || !mediaRecorder) return;

  recordedChunks = [];
  mediaRecorder.start();
  playerA.playVideo();

  document.getElementById('recordStatus').textContent = '🔴 Grabando';
});

/* =========================
   ESTADO YOUTUBE
========================= */
function onPlayerStateChange(event) {
  if (!mediaRecorder) return;

  if (event.data === YT.PlayerState.ENDED) {
    if (mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      document.getElementById('recordStatus').textContent =
        '✅ Grabación finalizada';

      document.getElementById('downloadReaction').disabled = false;
    }
  }
}

/* =========================
   GUARDAR VIDEO
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
  }
}


