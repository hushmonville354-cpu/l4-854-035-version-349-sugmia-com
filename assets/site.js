(function () {
  var navButton = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navButton && navLinks) {
    navButton.addEventListener('click', function () {
      var opened = navLinks.classList.toggle('open');
      navButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
      dot.setAttribute('aria-current', dotIndex === currentSlide ? 'true' : 'false');
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function createResultItem(item) {
    var link = document.createElement('a');
    link.className = 'search-result';
    link.href = item.url;

    var image = document.createElement('img');
    image.src = item.image;
    image.alt = item.title;
    image.loading = 'lazy';

    var body = document.createElement('div');
    var title = document.createElement('h2');
    title.textContent = item.title;
    var text = document.createElement('p');
    text.textContent = item.region + ' · ' + item.type + ' · ' + item.genre;

    body.appendChild(title);
    body.appendChild(text);
    link.appendChild(image);
    link.appendChild(body);

    return link;
  }

  function renderGlobalSearch(input) {
    var targetSelector = input.getAttribute('data-target');
    var target = targetSelector ? document.querySelector(targetSelector) : null;

    if (!target || !Array.isArray(window.MovieSearchData)) {
      return;
    }

    var keyword = normalize(input.value);
    target.innerHTML = '';

    if (!keyword) {
      target.innerHTML = '<div class="empty-state">输入片名、类型、地区或标签即可搜索。</div>';
      return;
    }

    var result = window.MovieSearchData.filter(function (item) {
      return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.tags).indexOf(keyword) !== -1;
    }).slice(0, 24);

    if (!result.length) {
      target.innerHTML = '<div class="empty-state">没有找到相关影片。</div>';
      return;
    }

    result.forEach(function (item) {
      target.appendChild(createResultItem(item));
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.js-global-search')).forEach(function (input) {
    input.addEventListener('input', function () {
      renderGlobalSearch(input);
    });
    renderGlobalSearch(input);
  });

  var filterInput = document.querySelector('.js-filter-input');
  var filterSelect = document.querySelector('.js-filter-category');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function applyCardFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(filterInput ? filterInput.value : '');
    var selected = filterSelect ? filterSelect.value : '';

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-year'));
      var category = card.getAttribute('data-category') || '';
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedCategory = !selected || category === selected;
      card.style.display = matchedKeyword && matchedCategory ? '' : 'none';
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyCardFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyCardFilter);
  }

  applyCardFilter();
})();
