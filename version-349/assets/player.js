export function initVideoPlayer(source) {
  var video = document.querySelector('[data-video-player]');
  var button = document.querySelector('[data-play-button]');
  var started = false;
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function attachStream() {
    if (started) {
      return Promise.resolve();
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    return import('./hls-vendor.js').then(function (module) {
      var Hls = module.H;

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }).catch(function () {
      video.src = source;
    });
  }

  function startPlayback() {
    attachStream().then(function () {
      if (button) {
        button.classList.add('hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    });
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
