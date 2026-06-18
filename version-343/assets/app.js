(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var heroTimer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      setSlide(currentSlide + 1);
    }, 5600);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var target = Number(dot.getAttribute('data-hero-dot')) || 0;
      window.clearInterval(heroTimer);
      setSlide(target);
      startHero();
    });
  });

  setSlide(0);
  startHero();

  function bindFilterPanel(panel) {
    var root = panel.closest('section') || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
    var input = panel.querySelector('[data-search-input]');
    var year = panel.querySelector('[data-year-filter]');
    var type = panel.querySelector('[data-type-filter]');
    var region = panel.querySelector('[data-region-filter]');
    var empty = root.querySelector('[data-empty-state]');

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var selectedRegion = region ? region.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
        var matchRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
        var matched = matchKeyword && matchYear && matchType && matchRegion;

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(bindFilterPanel);

  function attachStream(video, stream, shell) {
    if (video.dataset.ready === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hlsPlayer = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsPlayer.loadSource(stream);
      hlsPlayer.attachMedia(video);
      shell.hlsPlayer = hlsPlayer;
    } else {
      video.src = stream;
    }

    video.dataset.ready = 'true';
  }

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var stream = shell.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    attachStream(video, stream, shell);
    shell.classList.add('is-playing');

    if (button) {
      button.hidden = true;
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (button) {
          button.hidden = false;
        }
        shell.classList.remove('is-playing');
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
    var button = shell.querySelector('[data-play-button]');
    var video = shell.querySelector('video');

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayer(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.dataset.ready !== 'true') {
          startPlayer(shell);
        }
      });
    }
  });
})();
