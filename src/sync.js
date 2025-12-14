let playerA;

function onYouTubeIframeAPIReady() {
  playerA = new YT.Player('playerA', {
    height: '315',
    width: '560',
    videoId: '',
    events: {
      onStateChange: onPlayerStateChange
    }
  });
}

function loadYouTubeVideo(url) {
  const id = new URL(url).searchParams.get('v');
  playerA.loadVideoById(id);
}

function onPlayerStateChange(event) {
  const videoB = document.getElementById('playerB');

  if (event.data === YT.PlayerState.PLAYING) {
    videoB.play();
  }
  if (event.data === YT.PlayerState.PAUSED) {
    videoB.pause();
  }
}

document.getElementById('loadVideo').addEventListener('click', () => {
  const url = document.getElementById('videoA').value;
  loadYouTubeVideo(url);
});

// YouTube API
const tag = document.createElement('script');
document.getElementById('videoFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const videoB = document.getElementById('playerB');
    videoB.src = URL.createObjectURL(file);
  }
});

tag.src = "https://www.youtube.com/iframe_api";
document.body.appendChild(tag);
let stream;

document.getElementById('startCam').addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    const videoB = document.getElementById('playerB');
    videoB.srcObject = stream;
    videoB.muted = true;
    videoB.play();
  } catch (err) {
    alert('No se pudo acceder a la cámara/micrófono');
  }
document.getElementById('loadVideo').addEventListener('click', () => {
  const url = document.getElementById('videoA').value;
  const videoId = extraerID(url);

  if (!videoId) {
    alert('URL de YouTube inválida');
    return;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
  document.getElementById('playerA').src = embedUrl;
});

function extraerID(url) {
  const regExp = /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

});
