let playerA;
let camStream;
let mediaRecorder;
let recordedChunks = [];

// YOUTUBE API
function onYouTubeIframeAPIReady() {
  playerA = new YT.Player('playerA', {
    height: '315',
    width: '560',
    videoId: '',
    playerVars: {
      controls: 1,
      rel: 0
    },
    events: {
      onStateChange: onPlayerStateChange
    }
  });
}

// EXTRAER ID DEL VIDEO
function extractVideoId(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
}

// CARGAR VIDEO
document.getElementById('loadVideo').addEventListener('click', () => {
  const url = document.getElementById('videoA').value;
  const videoId = extractVideoId(url);

  if (!videoId) {
    alert('URL de YouTube inválida');
    return;
  }

  playerA.loadVideoById(videoId);
});

// SINCRONIZACIÓN BASE
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    console.log('YouTube PLAY');
  }

  if (event.data === YT.PlayerState.PAUSED) {
    console.log('YouTube PAUSE');
  }
}
