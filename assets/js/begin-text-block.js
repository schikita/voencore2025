
(function(){
  const sec   = document.getElementById('begin');
  if(!sec) return;

  const far   = sec.querySelector('.layer--far');
  const near  = sec.querySelector('.layer--near');
  const paras = sec.querySelectorAll('.begin-copy p');


  paras.forEach((p,i)=> p.style.setProperty('--stagger', (140 + i*140) + 'ms'));
  paras.forEach(p=>{
    const t = (p.textContent || '').trim();
    if(t.startsWith('—')) p.classList.add('speech');
  });

  let raf=0;
  function update(){
    const r = sec.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    const enter = Math.max(0, Math.min(1, 1 - (r.top / vh)));
    const within = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));

    const farY  = (within * 40 - 20); 
    const nearY = (within * 90 - 45);   

    far && (far.style.setProperty('--far',  farY.toFixed(1) + 'px'));
    near && (near.style.setProperty('--near', nearY.toFixed(1) + 'px'));

    if(enter > .25) sec.classList.add('in-view');

    raf=0;
  }
  function onScroll(){ if(!raf){ raf=requestAnimationFrame(update); } }

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

