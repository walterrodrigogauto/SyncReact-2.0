/* ==========================================
   SyncReact 2.1
   youtube.js
========================================== */

let player = null;
let playerReady = false;

/* ==========================================
   Inicialización
========================================== */

export function initYouTube() {

    window.onYouTubeIframeAPIReady = () => {

        player = new YT.Player('playerA', {

            height: '315',
            width: '560',

            playerVars: {
                controls: 1,
                rel: 0
            },

            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange
            }

        });

    };

}

/* ==========================================
   Player listo
========================================== */

function onPlayerReady() {

    playerReady = true;

    console.log('✅ YouTube listo');

}

/* ==========================================
   Estado del reproductor
========================================== */

function onPlayerStateChange(event) {

    document.dispatchEvent(

        new CustomEvent("youtubeState", {
            detail: event.data
        })

    );

}

/* ==========================================
   Cargar video
========================================== */

export function loadVideo(url) {

    if (!playerReady) {

        alert("YouTube aún no está listo");
        return;

    }

    const id = extractVideoId(url);

    if (!id) {

        alert("URL inválida");
        return;

    }

    player.cueVideoById(id);

}

/* ==========================================
   Extraer ID
========================================== */

function extractVideoId(url) {

    const match = url.match(
        /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );

    return match ? match[1] : null;

}

/* ==========================================
   Métodos públicos
========================================== */

export function playVideo() {

    if (playerReady)
        player.playVideo();

}

export function pauseVideo() {

    if (playerReady)
        player.pauseVideo();

}

export function getCurrentTime() {

    if (!playerReady)
        return 0;

    return player.getCurrentTime();

}

export function getVideoId() {

    if (!playerReady)
        return null;

    return player.getVideoData().video_id;

}

export function isReady() {

    return playerReady;

}

export function getPlayer() {

    return player;

}
