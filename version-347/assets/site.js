(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });
    if (slides.length > 1) {
      startTimer();
    }
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var search = scope.querySelector("[data-search]");
    var year = scope.querySelector("[data-year-filter]");
    var type = scope.querySelector("[data-type-filter]");
    var empty = scope.querySelector("[data-empty]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

    function applyFilter() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute("data-title") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        if (typeValue && cardType !== typeValue) {
          matched = false;
        }
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [search, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });
})();

function initMoviePlayer(source) {
  var video = document.getElementById("movieVideo");
  var overlay = document.getElementById("playerOverlay");
  var playButton = document.getElementById("playerPlay");
  if (!video || !source) {
    return;
  }

  var started = false;
  var hlsInstance = null;

  function attachSource() {
    if (started) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
    started = true;
  }

  function startPlay() {
    attachSource();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", startPlay);
  }
  if (playButton) {
    playButton.addEventListener("click", function (event) {
      event.stopPropagation();
      startPlay();
    });
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlay();
    }
  });
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
