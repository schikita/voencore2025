
(function(){
  const modal = document.getElementById('global-mil-lightbox');
  const closeBtn = modal.querySelector('.mil-close');
  const focusableSel = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';
  let lastFocus = null;

  function openModal(){
    lastFocus = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');     // сначала показать
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    (modal.querySelector(focusableSel) || modal).focus();
  }
  function closeModal(){
    (lastFocus || document.body).focus();           // сначала увести фокус
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');      // затем скрыть
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
  }

  // Привяжите openModal к вашему коду (не на мобилке!)
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{ if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  // Экспорт при необходимости:
  window.__openMilLightbox = openModal;
  window.__closeMilLightbox = closeModal;
})
 function show(i){
    if (!urls.length) return;
    idx = ((i % urls.length) + urls.length) % urls.length;
    imgEl.src = urls[idx];
  }
  function focusTrap(e){
    if (e.key !== 'Tab') return;
    const focusables = modal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(startIndex){
    if (!openAllowed) return;            // на мобилке не открываем
    lastFocus = document.activeElement;  // запоминаем, куда вернуть фокус
    show(startIndex);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');     // 1) показать для AT
    freeze.forEach(el => el.inert = true);          // 2) блокируем фон
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    (btnClose || modal).focus();                    // 3) переводим фокус внутрь
    modal.addEventListener('keydown', focusTrap);
  }

  function close(){
    (lastFocus || document.body).focus();           // 1) уводим фокус
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');      // 2) скрываем
    freeze.forEach(el => el.inert = false);         // 3) разблокируем фон
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    modal.removeEventListener('keydown', focusTrap);
  }

  function prev(){ show(idx - 1); }
  function next(){ show(idx + 1); }

  // привязки
  thumbs.forEach((b, i) => {
    b.addEventListener('click', (e) => {
      // если остался мобильный сценарий «показать подпись», просто выходим
      if (!openAllowed) { e.preventDefault(); return; }
      e.preventDefault();
      open(i);
    });
  });
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click',  prev);
  btnNext.addEventListener('click',  next);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  window.addEventListener('keydown', (e) => {
    if (modal.getAttribute('aria-hidden') === 'true') return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  // экспорт при желании
  window.milLightbox = { open, close, next, prev };
;



