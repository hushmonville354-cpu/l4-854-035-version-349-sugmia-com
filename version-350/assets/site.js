(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', mobilePanel.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
        dot.setAttribute('aria-pressed', dotIndex === activeIndex ? 'true' : 'false');
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  var filterRoots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));

  filterRoots.forEach(function (root) {
    var input = root.querySelector('[data-search-input]');
    var chips = Array.prototype.slice.call(root.querySelectorAll('[data-filter-chip]'));
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-filter-item]'));
    var empty = root.querySelector('[data-empty-state]');
    var activeChip = 'all';

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-filter-text'));
        var tagText = normalize(card.getAttribute('data-tags'));
        var matchesQuery = !query || text.indexOf(query) !== -1 || tagText.indexOf(query) !== -1;
        var matchesChip = activeChip === 'all' || tagText.indexOf(normalize(activeChip)) !== -1 || text.indexOf(normalize(activeChip)) !== -1;
        var visible = matchesQuery && matchesChip;

        card.classList.toggle('hidden-by-filter', !visible);

        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeChip = chip.getAttribute('data-filter-chip') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        applyFilter();
      });
    });

    applyFilter();
  });

  var player = document.querySelector('[data-stream]');
  var playButton = document.querySelector('[data-play-button]');

  if (player) {
    var stream = player.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
      if (!stream || loaded) {
        return;
      }

      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(player);
      } else {
        player.src = stream;
      }

      loaded = true;
    }

    function playStream() {
      loadStream();

      if (playButton) {
        playButton.classList.add('is-hidden');
      }

      var promise = player.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (playButton) {
      playButton.addEventListener('click', playStream);
    }

    player.addEventListener('click', function () {
      if (player.paused) {
        playStream();
      }
    });

    player.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
