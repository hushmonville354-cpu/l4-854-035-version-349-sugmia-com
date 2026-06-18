(function() {
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function() {
      var opened = nav.hasAttribute('hidden');
      if (opened) {
        nav.removeAttribute('hidden');
      } else {
        nav.setAttribute('hidden', '');
      }
      button.setAttribute('aria-expanded', String(opened));
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        show(index);
        start();
      });
    });
    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function(scope) {
      var input = scope.querySelector('[data-filter-input]');
      var year = scope.querySelector('[data-filter-year]');
      var type = scope.querySelector('[data-filter-type]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
      var empty = scope.querySelector('[data-empty-state]');
      if (!cards.length) {
        return;
      }
      var queryName = scope.getAttribute('data-url-query');
      if (queryName && input) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get(queryName);
        if (initial) {
          input.value = initial;
        }
      }
      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }
      function apply() {
        var keyword = normalize(input ? input.value : '');
        var selectedYear = normalize(year ? year.value : '');
        var selectedType = normalize(type ? type.value : '');
        var visible = 0;
        cards.forEach(function(card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardType = normalize(card.getAttribute('data-type'));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !selectedYear || cardYear === selectedYear;
          var matchType = !selectedType || cardType.indexOf(selectedType) !== -1;
          var matched = matchKeyword && matchYear && matchType;
          card.classList.toggle('is-filtered-out', !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (type) {
        type.addEventListener('change', apply);
      }
      apply();
    });
  }

  window.initMoviePlayer = function(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var overlay = document.getElementById(options.overlayId);
    var streamUrl = options.streamUrl;
    var activated = false;
    var hls = null;
    if (!video || !button || !overlay || !streamUrl) {
      return;
    }
    function startPlayback() {
      if (!activated) {
        activated = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', function() {
            video.play().catch(function() {});
          }, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
            video.play().catch(function() {});
          });
        } else {
          video.src = streamUrl;
          video.play().catch(function() {});
        }
      } else {
        video.play().catch(function() {});
      }
      overlay.classList.add('is-hidden');
      video.controls = true;
      video.focus();
    }
    button.addEventListener('click', startPlayback);
    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', function() {
      if (!activated || video.paused) {
        startPlayback();
      }
    });
    window.addEventListener('pagehide', function() {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };

  onReady(function() {
    initMenu();
    initHero();
    initFilters();
  });
})();
