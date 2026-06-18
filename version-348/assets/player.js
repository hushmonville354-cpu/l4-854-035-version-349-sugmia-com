(() => {
  const scriptUrl = document.currentScript ? document.currentScript.src : "";
  const assetBase = scriptUrl ? new URL(".", scriptUrl).href : "../assets/";

  const loadLocalHls = async () => {
    if (window.Hls) return window.Hls;
    try {
      const module = await import(new URL("hls-vendor.js", assetBase).href);
      return module.H || module.default || null;
    } catch (error) {
      return null;
    }
  };

  const setupPlayer = async (wrap) => {
    const video = wrap.querySelector("video");
    const layer = wrap.querySelector(".play-layer");
    if (!video) return;

    let ready = false;
    let hls = null;

    const start = async () => {
      const source = video.dataset.play;
      if (!source) return;

      if (!ready) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          const HlsClass = await loadLocalHls();
          if (HlsClass && HlsClass.isSupported && HlsClass.isSupported()) {
            hls = new HlsClass({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
          } else {
            video.src = source;
          }
        }
        ready = true;
      }

      if (layer) layer.classList.add("is-hidden");
      const playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(() => {});
      }
    };

    if (layer) layer.addEventListener("click", start);
    video.addEventListener("click", () => {
      if (video.paused) start();
    });
    video.addEventListener("play", () => {
      if (layer) layer.classList.add("is-hidden");
    });
    video.addEventListener("ended", () => {
      if (layer) layer.classList.remove("is-hidden");
    });

    window.addEventListener("beforeunload", () => {
      if (hls && hls.destroy) hls.destroy();
    });
  };

  document.querySelectorAll(".player-wrap").forEach((wrap) => {
    setupPlayer(wrap);
  });
})();
