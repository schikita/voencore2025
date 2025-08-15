/* ===== Заголовок: пословное появление ===== */
(function () {
  const h = document.querySelector('#day1 .day-title');
  if (!h) return;
  const text = h.dataset.split || h.textContent;
  const words = text.split(' ');
  h.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
  const spans = h.querySelectorAll('.w');
  spans.forEach((el, i) => {
    el.style.display = 'inline-block';
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = `opacity 500ms ${200 + i * 40}ms ease, transform 500ms ${200 + i * 40}ms ease`;
  });
  const once = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      spans.forEach(el => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
      once.disconnect();
    }
  }, { threshold: .35 });
  once.observe(h);
})();

/* ===== Параллакс видео ===== */
(function () {
  const v = document.querySelector('#day1 .day-bg__video');
  if (!v) return;
  let y = 0, raf = 0;
  const onScroll = () => { y = window.scrollY * 0.08; if (!raf) raf = requestAnimationFrame(update); };
  const update = () => { v.style.transform = `translate3d(0, ${y}px, 0)`; raf = 0; };
  document.addEventListener('scroll', onScroll, { passive: true });
})();

/* ===== Reveal on scroll ===== */
(function () {
  const els = document.querySelectorAll('#day1 .reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    }
  }, { threshold: .2, rootMargin: '0px 0px -5% 0px' });
  els.forEach(el => io.observe(el));
})();

/* ===== 3D tilt ===== */
(function () {
  const tiles = document.querySelectorAll('#vcx-day1-mosaic .vcx-tilt');
  tiles.forEach(tile => {
    let rAF = 0;
    const onMove = (e) => {
      const r = tile.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      if (!rAF) {
        rAF = requestAnimationFrame(() => {
          tile.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(0)`;
          rAF = 0;
        });
      }
    };
    const reset = () => tile.style.transform = '';
    tile.addEventListener('mousemove', onMove);
    tile.addEventListener('mouseleave', reset);
  });
})();

