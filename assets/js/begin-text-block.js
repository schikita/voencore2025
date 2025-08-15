
(function(){
  const sec   = document.getElementById('begin');
  if(!sec) return;

  const far   = sec.querySelector('.layer--far');
  const near  = sec.querySelector('.layer--near');
  const paras = sec.querySelectorAll('.begin-copy p');

  // 1) стэггер для появления абзацев
  paras.forEach((p,i)=> p.style.setProperty('--stagger', (140 + i*140) + 'ms'));
  // авто-маркировка прямой речи
  paras.forEach(p=>{
    const t = (p.textContent || '').trim();
    if(t.startsWith('—')) p.classList.add('speech');
  });

  // 2) локальный параллакс: считаем прогресс видимости секции
  let raf=0;
  function update(){
    const r = sec.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    // Нормированный прогресс: 0..1 когда секция в области видимости
    const enter = Math.max(0, Math.min(1, 1 - (r.top / vh)));
    const within = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));

    // Смещения (чем ближе слой — тем больше амплитуда)
    const farY  = (within * 40 - 20);   // -20..20px
    const nearY = (within * 90 - 45);   // -45..45px

    far && (far.style.setProperty('--far',  farY.toFixed(1) + 'px'));
    near && (near.style.setProperty('--near', nearY.toFixed(1) + 'px'));

    // триггер появления текста
    if(enter > .25) sec.classList.add('in-view');

    raf=0;
  }
  function onScroll(){ if(!raf){ raf=requestAnimationFrame(update); } }

  // наблюдатель чтобы не считать вне экрана
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        update();
        window.addEventListener('scroll', onScroll, {passive:true});
      }else{
        window.removeEventListener('scroll', onScroll);
      }
    });
  }, {threshold:.05});
  io.observe(sec);
  update();
})();

