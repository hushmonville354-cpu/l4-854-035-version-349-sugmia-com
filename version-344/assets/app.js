(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initNavigation() {
    var button = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = all('[data-hero-slide]');
    var dots = all('[data-hero-dot]');
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');

    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    start();
  }

  function initFilters() {
    var cards = all('.filter-card');
    var search = document.querySelector('[data-filter-search]');
    var selects = all('[data-filter-select]');
    var status = document.querySelector('[data-filter-status]');

    if (!cards.length || (!search && !selects.length)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && search) {
      search.value = q;
    }

    function run() {
      var query = normalize(search ? search.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.category
        ].join(' '));

        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesSelects = selects.every(function (select) {
          var key = select.getAttribute('data-filter-select');
          var value = normalize(select.value);
          var target = normalize(card.dataset[key]);
          return !value || target.indexOf(value) !== -1;
        });

        var show = matchesQuery && matchesSelects;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = visible ? '筛选结果已更新' : '暂未匹配到影片';
      }
    }

    if (search) {
      search.addEventListener('input', run);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', run);
    });

    run();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
