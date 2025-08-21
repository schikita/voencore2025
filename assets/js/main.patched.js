/* main.patched.js — единая версия лайтбокса (доступность OK) */
(function () {
  const qs  = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  document.addEventListener('DOMContentLoaded', () => {
    // Ищем модалку (оставлена обратная совместимость по id)
    const modal =
      document.getElementById('global-mil-lightbox') ||
      document.getElementById('globalLightbox') ||
      qs('.mil-lightbox');

    if (!modal) { console.warn('[lightbox] container not found'); return; }

    const full     = qs('.mil-full',  modal);
    const btnClose = qs('.mil-close', modal);
    const btnPrev  = qs('.mil-prev',  modal);
    const btnNext  = qs('.mil-next',  modal);

    if (!full || !btnClose || !btnPrev || !btnNext) {
      console.warn('[lightbox] required controls missing');
      return;
    }

    // Фокус-якорь вне модалки, чтобы не получать warning при aria-hidden
    function ensureFocusSink() {
      let sink = document.getElementById('focus-sink');
      if (!sink) {
        sink = document.createElement('span');
        sink.id = 'focus-sink';
        sink.tabIndex = -1;
        sink.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;';
        document.body.prepend(sink);
      }
      return sink;
    }

    const isDesktop = () => matchMedia('(min-width: 821px)').matches;

    let list = [];
    let idx  = 0;
    let lastFocus = null;

    function collectFrom(trigger) {
      const gallery = trigger.closest('.military-gallery') || document;
      const items = qsa('.mil-card .mil-open, .mil-card [data-full]', gallery);
      return items.length ? items : qsa('.mil-card img', gallery);
    }

    function srcOf(el) {
      const fig = el.closest('figure');
      return el?.dataset?.full
        || qs('img', fig)?.getAttribute('data-full')
        || qs('img', fig)?.src
        || '';
    }

    function openAt(i) {
      if (!list.length) return;
      lastFocus = document.activeElement;

      idx = (i + list.length) % list.length;
      const src = srcOf(list[idx]);
      if (!src) return;

      full.src = src;
      modal.classList.add('open');
      modal.removeAttribute('aria-hidden'); // показать для AT
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      (btnClose || modal).focus();
    }

    function close() {
      const sink = ensureFocusSink();

      // 1) уводим фокус наружу ДО aria-hidden (устраняет warning)
      if (modal.contains(document.activeElement)) {
        (qs(':focus', modal) || btnClose)?.blur?.();
        sink.focus();
      }

      // 2) скрываем модалку
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      full.src = '';
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');

      // 3) возвращаем фокус туда, откуда открывали
      requestAnimationFrame(() => {
        if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
        lastFocus = null;
      });
    }

    const prev = () => openAt(idx - 1);
    const next = () => openAt(idx + 1);

    // Делегированное открытие по .mil-open или [data-full]
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.mil-open,[data-full]');
      if (!trigger) return;
      if (!isDesktop()) return;

      list = collectFrom(trigger);
      const start = list.indexOf(trigger);
      openAt(start >= 0 ? start : 0);
    });

    // Управление
    btnClose.addEventListener('click', close);
    btnPrev .addEventListener('click', prev);
    btnNext .addEventListener('click', next);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    });

    // Экспорт при необходимости
    window.milLightbox = { openAt, close, next, prev };
  });
})();
