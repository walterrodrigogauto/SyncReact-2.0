let playerA = null;
let playerReady = false;

let camStream = null;
let mediaRecorder = null;
let recordedChunks = [];

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
  if (!playerReady) return alert('YouTube no listo');

  const url = document.getElementById('videoA').value;
  const id = extractVideoId(url);
  if (!id) return alert('URL inválida');

  playerA.cueVideoById(id);
});

/* =========================
   CÁMARA
========================= */
document.getElementById('startCam').addEventListener('click', async () => {
  camStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  const camVideo = document.getElementById('playerB');
  camVideo.srcObject = camStream;
  camVideo.play();

  mediaRecorder = new MediaRecorder(camStream);
  mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
  mediaRecorder.onstop = saveRecording;
});

/* =========================
   SINCRONIZACIÓN
========================= */
function onPlayerStateChange(event) {
  if (!mediaRecorder) return;

  if (event.data === YT.PlayerState.PLAYING) {
    if (mediaRecorder.state !== 'recording') {
      recordedChunks = [];
      mediaRecorder.start();
      console.log('🎬 YouTube PLAY → grabación continúa');
    }
  }

  if (event.data === YT.PlayerState.PAUSED) {
    console.log('⏸ YouTube PAUSE → grabación continúa');
  }

  if (event.data === YT.PlayerState.ENDED) {
    if (mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      console.log('⏹ YouTube END → grabación detenida');
    }
  }
}


/* =========================
   GUARDAR VIDEO
========================= */
function saveRecording() {
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'reaction.webm';
  a.click();
}


