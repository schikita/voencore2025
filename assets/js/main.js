/* main.js — компактный и безопасный */

(() => {
  "use strict";

  /* ===== helpers ===== */
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ===== параллакс курсора (c rAF и respect RRM) ===== */
  (() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let px = 0,
      py = 0,
      needs = false;

    const tick = () => {
      if (!needs) return;
      needs = false;
      const b = document.body;
      const ox = px * 20;
      const oy = py * 20;
      b.style.setProperty("--bg-x", ox + "px");
      b.style.setProperty("--bg-y", oy + "px");
      b.style.setProperty("--bg2-x", -ox * 0.6 + "px");
      b.style.setProperty("--bg2-y", -oy * 0.6 + "px");
      b.style.setProperty("--bg-rot", px * 2 + "deg");
      b.style.setProperty(
        "--bg-scale",
        1 + Math.abs(px) * 0.01 + Math.abs(py) * 0.01
      );
      b.style.setProperty("--bg-blur", Math.abs(px) + Math.abs(py) + "px");
      requestAnimationFrame(tick);
    };

    addEventListener(
      "pointermove",
      (e) => {
        px = (e.clientX / innerWidth - 0.5) * 2;
        py = (e.clientY / innerHeight - 0.5) * 2;
        if (!needs) {
          needs = true;
          requestAnimationFrame(tick);
        }
      },
      { passive: true }
    );
  })();

  /* ===== полоска прогресса прокрутки ===== */
  (() => {
    const bar = qs(".progress");
    if (!bar) return;
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const s = scrollY;
        const h = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${Math.max(
          0,
          Math.min(1, s / (h || 1))
        )})`;
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  /* ===== reveal по IntersectionObserver ===== */
  (() => {
    const io = new IntersectionObserver(
      (ents) =>
        ents.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.18 }
    );
    qsa(".reveal").forEach((el) => io.observe(el));
  })();

  /* ===== Carousel ===== */
  class Carousel {
    constructor(root) {
      this.root = root;
      this.track = root.querySelector(".carousel-track");
      this.slides = Array.from(root.querySelectorAll(".slide"));
      if (!this.track || !this.slides.length) return; // защита

      this.idx = 0;
      this.timer = null;
      this.autoplayMs = 4200;
      this.buildNav();
      this.bind();
      this.go(0);
      this.play();
    }
    buildNav() {
      const nav = document.createElement("div");
      nav.className = "nav";
      this.dots = this.slides.map((_, i) => {
        const d = document.createElement("button");
        d.className = "dot";
        d.ariaLabel = `Слайд ${i + 1}`;
        d.addEventListener("click", () => this.go(i));
        nav.appendChild(d);
        return d;
      });
      const prev = document.createElement("button");
      prev.className = "arrow prev";
      prev.innerHTML = "&#10094;";
      prev.addEventListener("click", () => this.prev());

      const next = document.createElement("button");
      next.className = "arrow next";
      next.innerHTML = "&#10095;";
      next.addEventListener("click", () => this.next());

      this.root.append(nav, prev, next);
    }
    bind() {
      let startX = 0,
        delta = 0;
      this.root.addEventListener("pointerdown", (e) => {
        startX = e.clientX;
        delta = 0;
        this.root.setPointerCapture?.(e.pointerId);
        clearInterval(this.timer);
      });
      this.root.addEventListener("pointermove", (e) => {
        if (!startX) return;
        delta = e.clientX - startX;
        this.track.style.transform = `translateX(${
          -this.idx * 100 + (delta / innerWidth) * 100
        }%)`;
      });
      const end = () => {
        if (!startX) return;
        if (Math.abs(delta) > 50) delta < 0 ? this.next() : this.prev();
        else this.go(this.idx);
        startX = 0;
        this.play();
      };
      this.root.addEventListener("pointerup", end);
      this.root.addEventListener("pointercancel", end);
    }
    go(i) {
      this.idx = (i + this.slides.length) % this.slides.length;
      this.track.style.transform = `translateX(-${this.idx * 100}%)`;
      this.dots.forEach((d, k) => d.classList.toggle("active", k === this.idx));
    }
    next() {
      this.go(this.idx + 1);
    }
    prev() {
      this.go(this.idx - 1);
    }
    play() {
      this.timer = setInterval(() => this.next(), this.autoplayMs);
    }
  }
  window.Carousel = Carousel;

  /* ===== хедер-табы активный раздел ===== */
  (() => {
    const links = qsa(".tabs a");
    if (!links.length) return;
    const secs = qsa("section[id]");
    const io = new IntersectionObserver(
      (ents) => {
        ents.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = e.target.id;
          links.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + id)
          );
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    secs.forEach((s) => io.observe(s));
  })();

  /* ===== горизонтальная прокрутка колесиком ===== */
  function bindHorizontalScroll() {
    qsa(".hscroll").forEach((scroller) => {
      scroller.addEventListener(
        "wheel",
        (e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            scroller.scrollLeft += e.deltaY;
            e.preventDefault();
          }
        },
        { passive: false }
      );
    });
  }

  /* ===== DOM ready ===== */
  document.addEventListener("DOMContentLoaded", () => {
    /* карусели */
    try {
      qsa(".carousel").forEach((el) => new Carousel(el));
    } catch (e) {
      console.debug("Carousel init skipped:", e);
    }

    /* hscroll */
    try {
      bindHorizontalScroll();
    } catch (e) {
      console.debug("bindHorizontalScroll skipped:", e);
    }

    /* кнопка «наверх» */
    const topBtn = qs("#to-top");
    if (topBtn) {
      const showTop = () => {
        topBtn.classList.toggle(
          "show",
          (window.scrollY || document.documentElement.scrollTop) > 600
        );
      };
      addEventListener("scroll", showTop, { passive: true });
      showTop();
      topBtn.addEventListener("click", () =>
        window.scrollTo({ top: 0, behavior: "smooth" })
      );
    }

    /* фоновая музыка */
    (() => {
      const audio = /** @type {HTMLAudioElement|null} */ (qs("#bg-audio"));
      const btn = qs("#audio-toggle");
      const label = qs("#audio-label");
      if (!audio || !btn) {
        console.warn("[audio] Не найден(ы):", { btn: !!btn, audio: !!audio });
        return;
      }
      if (!audio.src && audio.dataset.src) audio.src = audio.dataset.src;

      const setUI = (isOn) => {
        btn.dataset.state = isOn ? "on" : "off";
        if (label) label.textContent = isOn ? "Музыка: вкл" : "Музыка: выкл";
        btn.setAttribute("aria-pressed", String(isOn));
      };

      const tryPlay = async () => {
        try {
          if (isNaN(audio.duration)) {
            await new Promise((res) => {
              const ready = () => {
                audio.removeEventListener("loadedmetadata", ready);
                res();
              };
              audio.addEventListener("loadedmetadata", ready, { once: true });
              setTimeout(res, 300);
            });
          }
          await audio.play();
          setUI(true);
        } catch (err) {
          console.warn("[audio] play() отклонён:", err);
          if (label) label.textContent = "Нажмите, чтобы включить";
          setUI(false);
        }
      };

      btn.addEventListener("click", async () => {
        if (audio.paused) await tryPlay();
        else {
          audio.pause();
          setUI(false);
        }
      });
      audio.addEventListener("play", () => setUI(true));
      audio.addEventListener("pause", () => setUI(false));
      audio.addEventListener("ended", () => setUI(false));

      addEventListener(
        "pointerdown",
        () => {
          tryPlay();
        },
        { once: true }
      );

      if (audio.dataset.volume)
        audio.volume = Math.min(1, Math.max(0, Number(audio.dataset.volume)));
      if (audio.dataset.muted === "true") audio.muted = true;
      setUI(!audio.paused);
    })();

    /* ===== unified mil-lightbox ===== */
    (() => {
      const modal =
        document.getElementById("global-mil-lightbox") || qs(".mil-lightbox");
      if (!modal) return;

      const full = qs(".mil-full", modal);
      const btnClose = qs(".mil-close", modal);
      const btnPrev = qs(".mil-prev", modal);
      const btnNext = qs(".mil-next", modal);
      if (!full || !btnClose || !btnPrev || !btnNext) {
        console.warn("[lightbox] required controls missing");
        return;
      }

      const isDesktop = () => matchMedia("(min-width: 821px)").matches;

      let list = [];
      let idx = 0;
      let lastFocus = null;

      function collectFrom(trigger) {
        const gallery = trigger.closest(".military-gallery") || document;
        const items = qsa(
          ".mil-card .mil-open, .mil-card [data-full]",
          gallery
        );
        return items.length ? items : qsa(".mil-card img", gallery);
      }

      function srcOf(el) {
        const fig = el.closest("figure");
        return (
          el?.dataset?.full ||
          qs("img", fig)?.getAttribute("data-full") ||
          qs("img", fig)?.src ||
          ""
        );
      }

      function openAt(i) {
        if (!list.length) return;
        lastFocus = document.activeElement;

        idx = (i + list.length) % list.length;
        const src = srcOf(list[idx]);
        if (!src) return;

        full.src = src;
        modal.classList.add("open");
        modal.removeAttribute("aria-hidden");
        document.documentElement.classList.add("modal-open");
        document.body.classList.add("modal-open");
        (btnClose || modal).focus();
      }

      function close() {
        // уводим фокус прежде, чем скрывать (чтобы не было warning об aria-hidden)
        if (modal.contains(document.activeElement)) {
          if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
          else document.body.focus?.();
        }
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        full.src = "";
        document.documentElement.classList.remove("modal-open");
        document.body.classList.remove("modal-open");
        lastFocus = null;
      }

      const prev = () => openAt(idx - 1);
      const next = () => openAt(idx + 1);

      // делегированное открытие
      document.addEventListener("click", (e) => {
        const trigger = e.target.closest(".mil-open,[data-full]");
        if (!trigger) return;
        if (!isDesktop()) return;

        list = collectFrom(trigger);
        const start = list.indexOf(trigger);
        openAt(start >= 0 ? start : 0);
      });

      btnClose.addEventListener("click", close);
      btnPrev.addEventListener("click", prev);
      btnNext.addEventListener("click", next);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
      });
      document.addEventListener("keydown", (e) => {
        if (modal.getAttribute("aria-hidden") === "true") return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      });

      // экспорт по желанию
      window.milLightbox = { openAt, close, next, prev };
    })();

    /* запрет кликов по «фото на столе» (как в исходнике) */
    (() => {
      const block = qs(".bear-desk-photos");
      if (!block) return;
      const stop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
      };
      block.addEventListener("click", stop, { capture: true });
      block.addEventListener("pointerup", stop, { capture: true });
      block.addEventListener("pointerdown", stop, { capture: true });
    })();
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const imgs = document.querySelectorAll("img");
  imgs.forEach((img) => {
    if (
      img.classList.contains("eager") ||
      img.getAttribute("loading") === "eager" ||
      img.getAttribute("fetchpriority") === "high"
    )
      return;
    if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
    if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
  });
});


(() => {
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const isPlaying = (m) => m && m.currentTime > 0 && !m.paused && !m.ended && m.readyState > 2;
  const isAudible = (m) => !m.muted && m.volume > 0 && getComputedStyle(m).visibility !== 'hidden';

  
  const isExempt = (m) => m.hasAttribute('data-solo-exempt');

  const pauseOthers = (except) => {
    $$('audio, video').forEach((m) => {
      if (m === except) return;
      if (isExempt(m)) return;     
      if (!isAudible(m)) return;
      if (!isPlaying(m)) return;
      try { m.pause(); } catch {}
    });
  };

  const onPlay = (e) => {
    const el = e.target;
    if (!(el instanceof HTMLMediaElement)) return;
    if (isExempt(el)) return;    
    if (isAudible(el)) pauseOthers(el);
  };

  
  const onVolumeChange = (e) => {
    const el = e.target;
    if (!(el instanceof HTMLMediaElement)) return;
    if (isExempt(el)) return;
    if (!isPlaying(el)) return;
    if (isAudible(el)) pauseOthers(el);
  };

  const attach = (m) => {
    m.addEventListener('play', onPlay);
    m.addEventListener('volumechange', onVolumeChange);
  };

  document.addEventListener('DOMContentLoaded', () => {
    $$('audio, video').forEach(attach);
    
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes && m.addedNodes.forEach((node) => {
          if (node instanceof HTMLMediaElement) attach(node);
          else if (node && node.querySelectorAll) {
            node.querySelectorAll('audio, video').forEach(attach);
          }
        });
      });
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  });
})();

