(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movieVideo');
    var layer = document.getElementById('playLayer');
    var hls = null;
    var started = false;

    if (!video || !source) {
      return;
    }

    function playVideo() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    function loadVideo() {
      if (started) {
        playVideo();
        return;
      }

      started = true;

      if (layer) {
        layer.classList.add('is-hidden');
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: false,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      } else {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      }
    }

    if (layer) {
      layer.addEventListener('click', loadVideo);
    }

    video.addEventListener('click', function () {
      if (!started) {
        loadVideo();
      }
    });

    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
