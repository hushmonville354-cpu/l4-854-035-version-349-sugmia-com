(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const next = hero.querySelector("[data-hero-next]");
    const prev = hero.querySelector("[data-hero-prev]");
    let index = 0;
    let timer = null;

    const show = (target) => {
      if (!slides.length) return;
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach((dot) => {
        dot.classList.toggle("is-active", Number(dot.dataset.heroDot) === index);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.heroDot));
        start();
      });
    });

    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  const scopes = document.querySelectorAll(".filter-scope");
  scopes.forEach((scope) => {
    const input = scope.querySelector("[data-filter-input]");
    const region = scope.querySelector("[data-filter-region]");
    const type = scope.querySelector("[data-filter-type]");
    const items = Array.from(scope.querySelectorAll(".filter-item"));

    const normalize = (value) => String(value || "").trim().toLowerCase();

    const apply = () => {
      const query = normalize(input ? input.value : "");
      const selectedRegion = region ? region.value : "";
      const selectedType = type ? type.value : "";

      items.forEach((item) => {
        const text = normalize(item.dataset.title || item.textContent);
        const itemRegion = item.dataset.region || "";
        const itemType = item.dataset.type || "";
        const matchesQuery = !query || text.includes(query);
        const matchesRegion = !selectedRegion || itemRegion === selectedRegion;
        const matchesType = !selectedType || itemType === selectedType;
        item.hidden = !(matchesQuery && matchesRegion && matchesType);
      });
    };

    if (input) input.addEventListener("input", apply);
    if (region) region.addEventListener("change", apply);
    if (type) type.addEventListener("change", apply);

    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && input) {
      input.value = q;
      apply();
    }
  });
})();
