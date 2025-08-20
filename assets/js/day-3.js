(() => {
  const revealIO = new IntersectionObserver(
    (ents) => ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.military-gallery .reveal').forEach(n => revealIO.observe(n));

  const ensureLightbox = () => {
    let lb = document.getElementById('global-mil-lightbox');
    if (lb) return lb;

    lb = document.createElement('div');
    lb.id = 'global-mil-lightbox';
    lb.className = 'mil-lightbox';
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML = `
      <img class="mil-full" alt="Увеличенное фото" />
      <button class="mil-close" aria-label="Закрыть">✕</button>
      <button class="mil-prev" aria-label="Предыдущее">‹</button>
      <button class="mil-next" aria-label="Следующее">›</button>
    `;
    document.body.appendChild(lb);
    return lb;
  };

  const lb = ensureLightbox();
  const img = lb.querySelector('.mil-full');
  const btnClose = lb.querySelector('.mil-close');
  const btnPrev  = lb.querySelector('.mil-prev');
  const btnNext  = lb.querySelector('.mil-next');

  // Текущее состояние
  let currentItems = [];
  let currentIndex = 0;

  const open = (root, idx) => {
    currentItems = Array.from(root.querySelectorAll('.mil-card'));
    currentIndex = idx;

    const card = currentItems[currentIndex];
    if (!card) return;

    const src = card.querySelector('.mil-open')?.dataset.full
             || card.querySelector('img')?.src
             || '';
    if (!src) return;

    img.src = src;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    img.src = '';
    currentItems = [];
    currentIndex = 0;
  };

  const show = (i) => {
    if (!currentItems.length) return;
    currentIndex = (i + currentItems.length) % currentItems.length;
    const card = currentItems[currentIndex];
    const src = card.querySelector('.mil-open')?.dataset.full
             || card.querySelector('img')?.src
             || '';
    if (src) img.src = src;
  };

  const prev = () => show(currentIndex - 1);
  const next = () => show(currentIndex + 1);

  // 3) Делегирование кликов: открытие по .mil-open в любой галерее
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.mil-open');
    if (!btn) return;

    const card = btn.closest('.mil-card');
    const root = btn.closest('.military-gallery');
    if (!card || !root) return;

    const cards = Array.from(root.querySelectorAll('.mil-card'));
    const idx = Math.max(0, cards.indexOf(card));
    open(root, idx);
  });

  // 4) Контролы лайтбокса
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

  window.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
})();
