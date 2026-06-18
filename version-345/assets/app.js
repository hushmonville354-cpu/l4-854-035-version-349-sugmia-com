(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initImages();
    initPlayer();
  });

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initSearch() {
    var input = document.querySelector("[data-search-input]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-no-results]");

    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        var matched = !value || text.indexOf(value) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    });
  }

  function initImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.style.opacity = "0";
      }, { once: true });
    });
  }

  function initPlayer() {
    var shell = document.querySelector("[data-player-source]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var button = shell.querySelector(".player-button");
    var sourceUrl = shell.getAttribute("data-player-source");
    var hasLoaded = false;

    function loadSource() {
      if (hasLoaded || !video || !sourceUrl) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        window.addEventListener("beforeunload", function () {
          hls.destroy();
        });
      } else {
        video.src = sourceUrl;
      }
      hasLoaded = true;
    }

    function playVideo() {
      loadSource();
      if (button) {
        button.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (button && video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    });

    video.addEventListener("click", function () {
      if (!hasLoaded || video.paused) {
        playVideo();
      }
    });
  }
})();
