let playerA = null;
let playerReady = false;

/* =========================
   YOUTUBE IFRAME API
========================= */
window.onYouTubeIframeAPIReady = function () {
  playerA = new YT.Player('playerA', {
    height: '315',
    width: '560',
    playerVars: {
      controls: 1,
      rel: 0,
      modestbranding: 1
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};

function onPlayerReady() {
  playerReady = true;
  console.log('YouTube Player READY');
}

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
   CARGAR VIDEO
========================= */
document.getElementById('loadVideo').addEventListener('click', () => {
  if (!playerReady) {
    alert('El reproductor de YouTube aún no está listo');
    return;
  }

  const url = document.getElementById('videoA').value.trim();
  const videoId = extractVideoId(url);

  if (!videoId) {
    alert('URL de YouTube inválida');
    return;
  }

  playerA.loadVideoById(videoId);
});

/* =========================
   SINCRONIZACIÓN BASE
========================= */
function onPlayerStateChange(event) {
  switch (event.data) {
    case YT.PlayerState.PLAYING:
      console.log('YouTube PLAY');
      break;

    case YT.PlayerState.PAUSED:
      console.log('YouTube PAUSE');
      break;

    case YT.PlayerState.ENDED:
      console.log('YouTube END');
      break;
  }
}
