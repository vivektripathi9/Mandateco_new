(function () {
  const header = document.getElementById("site-header");
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("mobile-menu");
  const hero = document.querySelector(".hero");
  const menuLinks = menu ? menu.querySelectorAll("a") : [];

  function setMenu(open) {
    if (!toggle || !menu) return;

    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
    if (header) header.classList.toggle("is-menu-open", open);
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setMenu(open);
    });
  }

  menuLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  const navCta = document.querySelector(".nav__cta");
  if (navCta) {
    navCta.addEventListener("click", function () {
      setMenu(false);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setMenu(false);
  });

  let scrollTick = false;
  function onScroll() {
    if (scrollTick) return;
    scrollTick = true;
    window.requestAnimationFrame(function () {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
      scrollTick = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (hero) {
    window.requestAnimationFrame(function () {
      hero.classList.add("is-ready");
    });
    startHeroSlideshow();
  }

  const system = document.querySelector(".system");
  const founder = document.querySelector(".founder");
  const journey = document.querySelector(".journey");
  const offer = document.querySelector(".offer");
  const why = document.querySelector(".why");
  const voices = document.querySelector(".voices");
  const quotes = document.querySelector(".quotes");
  const projects = document.querySelector(".projects");
  const blog = document.querySelector(".blog");
  const closer = document.querySelector(".closer");
  const compare = document.querySelector(".compare");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function observeReveal(el, onEnter, opts) {
    if (!el) return;

    function enter() {
      const first = !el.classList.contains("is-in");
      el.classList.add("is-in");
      if (first && typeof onEnter === "function") onEnter();
    }

    if (reduceMotion) {
      enter();
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          enter();
          observer.disconnect();
        });
      },
      opts || { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
    );
    observer.observe(el);
  }

  function pauseOffscreen(el) {
    if (!el) return;
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          el.classList.toggle("is-away", !entry.isIntersecting);
        });
      },
      { rootMargin: "12% 0px" }
    );
    io.observe(el);
  }

  document.addEventListener("click", function (event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target || target.hasAttribute("hidden")) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    });
    if (history.replaceState) history.replaceState(null, "", id);
  });

  observeReveal(system);
  observeReveal(founder);
  observeReveal(journey);
  observeReveal(offer);
  const startWhy = initWhy(why);
  observeReveal(why, function () {
    if (voices) voices.classList.add("is-in");
    if (typeof startWhy === "function") startWhy();
  }, {
    threshold: 0.04,
    rootMargin: "0px 0px -8% 0px"
  });
  pauseOffscreen(hero);
  pauseOffscreen(journey);
  observeReveal(quotes);
  observeReveal(projects, null, {
    threshold: 0.04,
    rootMargin: "0px 0px -8% 0px",
  });
  observeReveal(blog);
  observeReveal(closer);
  observeReveal(compare);
  document.querySelectorAll(".compare__intro, .compare__table, .compare__feats, .compare__action").forEach(function (el) {
    observeReveal(el, null, {
      threshold: 0.16,
      rootMargin: "0px 0px -10% 0px"
    });
  });
  document.querySelectorAll(".post-block, .post-beliefs, .svc-row, .svc-cta, .blog-article, .care-track, .care-why, .care-tracks, .care-roles, .care-culture, .care-apply, .care-role, .flow, .flow-card, .flow__head, .flow__steps, .believe, .case, .cases-cta").forEach(function (el) {
    observeReveal(el);
  });
  observeReveal(document.querySelector(".flow-stats"), function () {
    animateFlowStats(document.querySelector(".flow-stats"));
  });
  observeReveal(document.querySelector(".cases-hero"), function () {
    animateFlowStats(document.querySelector(".cases-hero"));
  });
  initCasesFilter(document.querySelector(".cases"));
  initCareHire(document.querySelector(".care-tracks"));

  const svcHero = document.querySelector(".svc-hero");
  if (svcHero) {
    window.requestAnimationFrame(function () {
      svcHero.classList.add("is-ready");
    });
  }
  initOffer(offer);
  initWhyNet(why);
  initWhyNet(compare);
  initVoicesSlider(voices);
  initQuotesSlider(quotes);
  initContactForm(document.getElementById("enquire-form"));
  initPostQa(document.getElementById("post-qa"));

  if (projects && location.hash === "#projects") {
    window.requestAnimationFrame(function () {
      projects.classList.add("is-in");
    });
  }

  function initOffer(section) {
    if (!section) return;

    const tabs = section.querySelectorAll(".offer__select button");
    const panel = section.querySelector(".offer__panel");
    const panelIndex = panel.querySelector(".offer__panel-index");
    const panelName = panel.querySelector(".offer__panel-name");
    const panelLead = panel.querySelector(".offer__panel-lead");
    const panelText = panel.querySelector(".offer__panel-text");
    const panelMore = panel.querySelector(".offer__panel-more");
    const mark = section.querySelector(".offer__mark");
    if (!tabs.length || !panel || !panelText || !panelName || !panelIndex || !panelLead || !panelMore) return;

    let swapTimer;

    function labelFrom(button) {
      const indexEl = button.querySelector(".label");
      const index = indexEl ? indexEl.textContent.trim() : "";
      const name = button.textContent.replace(index, "").replace(/\s+/g, " ").trim();
      return {
        index: index,
        name: name,
        lead: button.getAttribute("data-lead") || "",
        copy: button.getAttribute("data-copy") || "",
        more: button.getAttribute("data-more") || ""
      };
    }

    function paint(button) {
      const next = labelFrom(button);
      panelIndex.textContent = next.index;
      panelName.textContent = next.name;
      panelLead.textContent = next.lead;
      panelText.textContent = next.copy;
      panelMore.textContent = next.more;
      if (mark) mark.textContent = next.index;
    }

    function setActive(button) {
      if (!button || button.classList.contains("is-active")) return;

      tabs.forEach(function (tab) {
        const on = tab === button;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
      });

      panel.setAttribute("aria-labelledby", button.id);

      if (reduceMotion) {
        paint(button);
        return;
      }

      window.clearTimeout(swapTimer);
      panel.classList.add("is-swap");
      swapTimer = window.setTimeout(function () {
        paint(button);
        panel.classList.remove("is-swap");
      }, 160);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("mouseenter", function () {
        setActive(tab);
      });
      tab.addEventListener("click", function () {
        setActive(tab);
      });
      tab.addEventListener("keydown", function (event) {
        const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
        const dir = keys[event.key];
        if (!dir) return;
        event.preventDefault();
        const index = Array.prototype.indexOf.call(tabs, tab);
        const next = tabs[(index + dir + tabs.length) % tabs.length];
        next.focus();
        setActive(next);
      });
    });
  }

  function initWhy(section) {
    if (!section) return;

    const points = section.querySelectorAll(".why__points .why__point");
    if (!points.length) return;

    let index = 0;
    let started = false;
    let timer;
    const dwell = 4300;
    const swapMs = reduceMotion ? 0 : 480;

    function setActive(nextIndex, animate) {
      points.forEach(function (point, i) {
        const on = i === nextIndex;
        point.classList.toggle("is-active", on);
        point.setAttribute("aria-hidden", on ? "false" : "true");
        if (!on) point.classList.remove("is-in");
        if (!animate && on) point.classList.add("is-in");
      });
      index = nextIndex;
    }

    function reveal(point) {
      window.requestAnimationFrame(function () {
        void point.offsetWidth;
        point.classList.add("is-in");
      });
    }

    function next() {
      if (document.body.classList.contains("menu-open")) return;
      if (document.hidden) return;

      const upcoming = (index + 1) % points.length;
      if (reduceMotion) {
        setActive(upcoming, false);
        return;
      }

      const current = points[index];
      current.classList.remove("is-in");

      window.setTimeout(function () {
        current.classList.remove("is-active");
        current.setAttribute("aria-hidden", "true");
        points[upcoming].classList.add("is-active");
        points[upcoming].setAttribute("aria-hidden", "false");
        reveal(points[upcoming]);
        index = upcoming;
      }, swapMs);
    }

    function start() {
      if (started) return;
      started = true;
      setActive(0, false);
      if (!reduceMotion) {
        points[0].classList.remove("is-in");
        window.setTimeout(function () {
          reveal(points[0]);
        }, 280);
      }
      timer = window.setInterval(next, dwell);
    }

    setActive(0, false);
    points[0].classList.remove("is-in");
    return start;
  }

  function initWhyNet(section) {
    const canvas = section ? section.querySelector(".why__net") : null;
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let nodes = [];
    let width = 0;
    let height = 0;
    let running = false;
    let raf = 0;

    function count() {
      if (width < 640) return 22;
      if (width * height > 1400000) return 48;
      return 36;
    }

    function seed() {
      const total = count();
      nodes = [];
      for (let i = 0; i < total; i += 1) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.26,
          vy: (Math.random() - 0.5) * 0.26,
          r: Math.random() * 1.4 + 1.05
        });
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = section.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nodes.length !== count()) seed();
    }

    function range() {
      return Math.min(230, Math.max(140, width * 0.16));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const max = range();
      const max2 = max * max;

      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 > max2) continue;
          const fade = 1 - Math.sqrt(dist2) / max;
          ctx.strokeStyle = "rgba(11, 11, 11," + (0.28 * fade).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        ctx.fillStyle = "rgba(11, 11, 11, 0.52)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step() {
      if (!running) return;
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -24) node.x = width + 24;
        else if (node.x > width + 24) node.x = -24;
        if (node.y < -24) node.y = height + 24;
        else if (node.y > height + 24) node.y = -24;
      }
      draw();
      raf = window.requestAnimationFrame(step);
    }

    function start() {
      if (reduce) {
        draw();
        return;
      }
      if (running) return;
      running = true;
      raf = window.requestAnimationFrame(step);
    }

    function stop() {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    }

    resize();
    draw();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(function () {
        resize();
        if (!running) draw();
      });
      ro.observe(section);
    }

    let visible = false;
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible = entry.isIntersecting;
          if (visible) start();
          else stop();
        });
      },
      { rootMargin: "10% 0px" }
    );
    io.observe(section);

    let scrollIdle;
    window.addEventListener(
      "scroll",
      function () {
        if (!visible) return;
        stop();
        window.clearTimeout(scrollIdle);
        scrollIdle = window.setTimeout(function () {
          if (visible && !document.hidden) start();
        }, 160);
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (visible) start();
    });
  }

  function startHeroSlideshow() {
    const slides = hero.querySelectorAll(".hero__media img");
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let index = 0;

    function showSlide(nextIndex) {
      slides.forEach(function (slide, i) {
        const active = i === nextIndex;
        slide.classList.toggle("is-active", active);
        slide.style.opacity = active ? "1" : "0";
      });
      index = nextIndex;
    }

    showSlide(0);

    window.setInterval(function () {
      if (document.body.classList.contains("menu-open")) return;
      showSlide((index + 1) % slides.length);
    }, 6500);
  }

  function initVoicesSlider(section) {
    if (!section) return;

    const viewport = section.querySelector(".voices__viewport");
    const prev = section.querySelector(".voices__nav--prev");
    const next = section.querySelector(".voices__nav--next");
    const cards = section.querySelectorAll(".voices__card");
    if (!viewport || !prev || !next || !cards.length) return;

    let index = 0;

    function cardStep() {
      const grid = cards[0].parentElement;
      const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
      return cards[0].offsetWidth + gap;
    }

    function maxScroll() {
      return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function maxIndex() {
      const step = cardStep();
      if (!step) return 0;
      return Math.max(0, Math.round(maxScroll() / step));
    }

    function update() {
      prev.disabled = index <= 0;
      next.disabled = index >= maxIndex();
    }

    function go(dir) {
      const step = cardStep();
      if (!step) return;
      index = Math.max(0, Math.min(maxIndex(), index + dir));
      viewport.scrollTo({
        left: index * step,
        behavior: reduceMotion ? "auto" : "smooth"
      });
      update();
    }

    prev.addEventListener("click", function () {
      go(-1);
    });

    next.addEventListener("click", function () {
      go(1);
    });

    viewport.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          go(1);
        }
      }
    );

    viewport.addEventListener("scroll", function () {
      const step = cardStep();
      if (!step) return;
      index = Math.round(viewport.scrollLeft / step);
      update();
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function initQuotesSlider(section) {
    if (!section) return;

    const viewport = section.querySelector(".quotes__viewport");
    const prev = section.querySelector(".quotes__nav--prev");
    const next = section.querySelector(".quotes__nav--next");
    const cards = section.querySelectorAll(".quotes__card");
    if (!viewport || !prev || !next || !cards.length) return;

    const grid = cards[0].parentElement;
    let index = 0;
    let timer = 0;
    let hovering = false;

    function cardStep() {
      const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
      return cards[0].offsetWidth + gap;
    }

    function visibleCount() {
      const step = cardStep();
      if (!step) return 1;
      return Math.max(1, Math.round(viewport.clientWidth / step));
    }

    function maxIndex() {
      return Math.max(0, cards.length - visibleCount());
    }

    function render() {
      const step = cardStep();
      const max = maxIndex();
      index = Math.max(0, Math.min(max, index));
      grid.style.transform = "translate3d(" + (-index * step) + "px, 0, 0)";
    }

    function go(dir, fromUser) {
      const max = maxIndex();
      if (max <= 0) return;
      index += dir;
      if (index > max) index = 0;
      if (index < 0) index = max;
      render();
      if (fromUser) play();
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = 0;
    }

    function play() {
      stop();
      if (reduceMotion || hovering) return;
      timer = window.setInterval(function () {
        if (document.body.classList.contains("menu-open")) return;
        if (document.hidden) return;
        go(1, false);
      }, 5000);
    }

    prev.addEventListener("click", function () {
      go(-1, true);
    });

    next.addEventListener("click", function () {
      go(1, true);
    });

    viewport.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1, true);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1, true);
      }
    });

    section.addEventListener("mouseenter", function () {
      hovering = true;
      stop();
    });

    section.addEventListener("mouseleave", function () {
      hovering = false;
      play();
    });

    window.addEventListener("resize", render);

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) play();
          else stop();
        });
      },
      { threshold: 0.2 }
    );
    io.observe(section);
  }

  function initContactForm(form) {
    if (!form) return;

    const error = document.getElementById("enquire-error");
    const done = form.querySelector(".enquire__done");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        if (error) error.hidden = false;
        form.reportValidity();
        return;
      }

      if (error) error.hidden = true;
      form.classList.add("is-sent");
      if (done) done.hidden = false;
    });
  }

  function initPostQa(root) {
    if (!root) return;

    const items = root.querySelectorAll(".post-qa__item");

    items.forEach(function (item) {
      const toggle = item.querySelector(".post-qa__toggle");
      if (!toggle) return;

      toggle.addEventListener("click", function () {
        const open = item.classList.contains("is-open");

        items.forEach(function (other) {
          const otherToggle = other.querySelector(".post-qa__toggle");
          other.classList.remove("is-open");
          if (otherToggle) otherToggle.setAttribute("aria-expanded", "false");
        });

        if (!open) {
          item.classList.add("is-open");
          toggle.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function initCareHire(root) {
    if (!root) return;

    const panel = root.querySelector(".care-hire");
    const buttons = root.querySelectorAll(".care-track__more[data-track]");
    const roles = root.querySelectorAll(".care-role[data-track]");
    const roleSelect = document.querySelector('#enquire-form select[name="role"]');
    if (!panel || !buttons.length || !roles.length) return;

    function showRoles(track) {
      roles.forEach(function (role) {
        const match = role.getAttribute("data-track") === track;
        role.classList.toggle("is-filtered", !match);
        role.classList.toggle("is-in", match);
      });
    }

    function open(track) {
      const wasOpen = panel.classList.contains("is-open");
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      buttons.forEach(function (button) {
        const on = button.getAttribute("data-track") === track;
        button.setAttribute("aria-expanded", on ? "true" : "false");
        const card = button.closest(".care-track");
        if (card) card.classList.toggle("is-active", on);
      });
      showRoles(track);
      window.requestAnimationFrame(function () {
        panel.scrollIntoView({
          behavior: reduceMotion || wasOpen ? "auto" : "smooth",
          block: "start"
        });
      });
    }

    function close() {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      buttons.forEach(function (button) {
        button.setAttribute("aria-expanded", "false");
        const card = button.closest(".care-track");
        if (card) card.classList.remove("is-active");
      });
      roles.forEach(function (role) {
        role.classList.remove("is-in");
        role.classList.add("is-filtered");
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        const track = button.getAttribute("data-track");
        const openAlready =
          button.getAttribute("aria-expanded") === "true" &&
          panel.classList.contains("is-open");
        if (openAlready) {
          close();
          return;
        }
        open(track);
      });
    });

    panel.querySelectorAll(".care-role__cta[data-role]").forEach(function (link) {
      link.addEventListener("click", function () {
        if (!roleSelect) return;
        const value = link.getAttribute("data-role");
        if (value) roleSelect.value = value;
      });
    });
  }

  function initCasesFilter(root) {
    if (!root) return;

    const bar = root.querySelector(".cases__filters");
    const cards = root.querySelectorAll(".case");
    const empty = root.querySelector(".cases__empty");
    if (!bar || !cards.length) return;

    function apply(filter) {
      let shown = 0;

      cards.forEach(function (card) {
        const tags = (card.getAttribute("data-tags") || "").split(/\s+/);
        const match = filter === "all" || tags.indexOf(filter) !== -1;
        card.classList.toggle("is-filtered", !match);
        if (match) shown += 1;
      });

      if (empty) empty.hidden = shown > 0;
    }

    bar.addEventListener("click", function (event) {
      const button = event.target.closest("[data-filter]");
      if (!button || !bar.contains(button)) return;

      bar.querySelectorAll("[data-filter]").forEach(function (item) {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });

      apply(button.getAttribute("data-filter"));
    });
  }

  function animateFlowStats(root) {
    if (!root) return;
    const nodes = root.querySelectorAll(".flow-stats__value[data-count], .cases-hero__value[data-count]");
    nodes.forEach(function (el) {
      const target = parseFloat(el.getAttribute("data-count"));
      if (isNaN(target)) return;
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const start = performance.now();
      const duration = 1100;

      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (t < 1) window.requestAnimationFrame(tick);
      }

      window.requestAnimationFrame(tick);
    });
  }
})();
