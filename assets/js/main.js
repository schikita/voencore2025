(function () {
  const onMove = (e) => {
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    const b = document.body,
      ox = x * 20,
      oy = y * 20;
    b.style.setProperty("--bg-x", ox + "px");
    b.style.setProperty("--bg-y", oy + "px");
    b.style.setProperty("--bg2-x", -ox * 0.6 + "px");
    b.style.setProperty("--bg2-y", -oy * 0.6 + "px");
    b.style.setProperty("--bg-rot", x * 2 + "deg");
    b.style.setProperty(
      "--bg-scale",
      1 + Math.abs(x) * 0.01 + Math.abs(y) * 0.01
    );
    b.style.setProperty("--bg-blur", Math.abs(x) + Math.abs(y) + "px");
  };
  addEventListener("pointermove", onMove, { passive: true });
})();

(function () {
  const bar = document.querySelector(".progress");
  if (!bar) return;
  const onScroll = () => {
    const s = scrollY;
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${Math.max(0, Math.min(1, s / (h || 1)))})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

(function () {
  const io = new IntersectionObserver(
    (ents) =>
      ents.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.18 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();

class Carousel {
  constructor(root) {
    this.root = root;
    this.track = root.querySelector(".carousel-track");
    this.slides = Array.from(root.querySelectorAll(".slide"));
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
      return d;
    });
    this.dots.forEach((d) => nav.appendChild(d));
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
      this.root.setPointerCapture(e.pointerId);
      clearInterval(this.timer);
    });
    this.root.addEventListener("pointermove", (e) => {
      if (startX) {
        delta = e.clientX - startX;
        this.track.style.transform = `translateX(${
          -this.idx * 100 + (delta / innerWidth) * 100
        }%)`;
      }
    });
    const end = () => {
      if (startX) {
        if (Math.abs(delta) > 50) delta < 0 ? this.next() : this.prev();
        else this.go(this.idx);
        startX = 0;
        this.play();
      }
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

(function () {
  const links = Array.from(document.querySelectorAll(".tabs a"));
  if (!links.length) return;
  const secs = Array.from(document.querySelectorAll("section[id]"));
  const io = new IntersectionObserver(
    (ents) => {
      ents.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id;
          links.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + id)
          );
        }
      });
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );
  secs.forEach((s) => io.observe(s));
})();

function bindHorizontalScroll() {
  document.querySelectorAll(".hscroll").forEach((scroller) => {
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

document.addEventListener("DOMContentLoaded", () => {
  try {
    document
      .querySelectorAll(".carousel")
      .forEach((el) => window.Carousel && new Carousel(el));
  } catch (e) {
    console.debug("Carousel init skipped:", e);
  }
  try {
    typeof bindHorizontalScroll === "function" && bindHorizontalScroll();
  } catch (e) {
    console.debug("bindHorizontalScroll skipped:", e);
  }

  const topBtn = document.getElementById("to-top");
  const showTop = () => {
    if (!topBtn) return;
    topBtn.classList.toggle(
      "show",
      (window.scrollY || document.documentElement.scrollTop) > 600
    );
  };
  window.addEventListener("scroll", showTop, { passive: true });
  showTop();
  topBtn?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  const audio = /** @type {HTMLAudioElement|null} */ (
    document.getElementById("bg-audio")
  );
  const btn = document.getElementById("audio-toggle");
  const label = document.getElementById("audio-label");

  if (!btn || !audio) {
    console.warn("[audio] Не найден(ы):", { btn: !!btn, audio: !!audio });
    return;
  }

  if (!audio.src && audio.dataset.src) {
    audio.src = audio.dataset.src;
  }

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
    if (audio.paused) {
      await tryPlay();
    } else {
      audio.pause();
      setUI(false);
    }
  });

  audio.addEventListener("play", () => setUI(true));
  audio.addEventListener("pause", () => setUI(false));
  audio.addEventListener("ended", () => setUI(false));

  window.addEventListener(
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
});


(function () {
  const items = document.querySelectorAll(".desk-photo");
  const modal = document.getElementById("bearModal");
  if (!items.length || !modal) return;

  const img = document.getElementById("bearModalImg");
  const cap = document.getElementById("bearModalCap");
  const closeBtn = modal.querySelector(".bear-modal-close");

  function open(src, caption) {
    img.src = src;
    img.alt = caption || "";
    cap.textContent = caption || "";
    modal.classList.add("open");
    modal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
  }
  function close() {
    modal.classList.remove("open");
    setTimeout(() => {
      modal.setAttribute("hidden", "");
      img.src = "";
      document.body.style.overflow = "";
    }, 200);
  }

  items.forEach((el) => {
    el.addEventListener("click", () => {
      if (window.innerWidth <= 820) return; 
      const src = el.getAttribute("data-full") || el.querySelector("img")?.src;
      const caption =
        el.getAttribute("data-caption") ||
        el.querySelector("figcaption")?.textContent ||
        "";
      if (src) open(src, caption);
    });
  });

  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) close();
  });
})();


(function () {
  const box = document.getElementById("bearModal");
  const img = document.getElementById("bearModalImg");
  const cap = document.getElementById("bearModalCap");
  if (!box || !img) return;

  document.querySelectorAll("#day1 .media-grid .ph").forEach((fig) => {
    fig.addEventListener("click", () => {
      const src =
        fig.getAttribute("data-full") || fig.querySelector("img")?.src;
      const c = fig.querySelector("figcaption")?.textContent || "";
      if (!src) return;
      img.src = src;
      img.alt = c;
      cap.textContent = c;
      box.classList.add("open");
      box.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
    });
  });

  box.addEventListener("click", (e) => {
    if (e.target === box || e.target.closest(".bear-modal-close")) {
      box.classList.remove("open");
      setTimeout(() => {
        box.setAttribute("hidden", "");
        img.src = "";
        document.body.style.overflow = "";
      }, 200);
    }
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const lb = document.getElementById("globalLightbox");
  const full = lb.querySelector(".mil-full");
  const btnPrev = lb.querySelector(".mil-prev");
  const btnNext = lb.querySelector(".mil-next");
  const btnClose = lb.querySelector(".mil-close");

  let currentList = [];
  let currentIdx = 0;

  function collectFrom(el) {
    const gallery = el.closest(".military-gallery") || document;
    const items = [
      ...gallery.querySelectorAll(".mil-card .mil-open, .mil-card [data-full]"),
    ];
    return items.length
      ? items
      : [...gallery.querySelectorAll(".mil-card img")];
  }

  function srcOf(item) {
    const fig = item.closest("figure");
    return (
      item.dataset.full ||
      fig?.querySelector("img")?.getAttribute("data-full") ||
      fig?.querySelector("img")?.src
    );
  }

  function openAt(index) {
    currentIdx = (index + currentList.length) % currentList.length;
    const src = srcOf(currentList[currentIdx]);
    if (!src) return;
    full.src = src;
    lb.classList.add("open");
    lb.removeAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    full.src = "";
    document.body.style.overflow = "";
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".mil-open,[data-full]");
    if (!trigger) return;

    currentList = collectFrom(trigger);
    currentIdx = Math.max(0, currentList.indexOf(trigger));
    if (currentIdx === -1) currentIdx = 0;

    openAt(currentIdx);
  });

  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", () => openAt(currentIdx - 1));
  btnNext.addEventListener("click", () => openAt(currentIdx + 1));
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") openAt(currentIdx - 1);
    if (e.key === "ArrowRight") openAt(currentIdx + 1);
  });
});

(function(){
  const block = document.querySelector('.bear-desk-photos');
  if (!block) return;

  const isMobile = window.matchMedia('(max-width: 820px)').matches;

  const stop = (e) => { 

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
  };

  block.addEventListener('click', stop, { capture: true });
  block.addEventListener('pointerup', stop, { capture: true });
  block.addEventListener('pointerdown', stop, { capture: true });
})();

