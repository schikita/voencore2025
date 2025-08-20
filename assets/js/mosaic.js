(function(){
  const h = document.querySelector('#day1 .day-title');
  if(!h) return;
  if(h.dataset.splitted === '1') return; // защита от повторного сплита
  const text = (h.dataset.split && h.dataset.split.trim()) || h.textContent.trim();
  const words = text.split(/\s+/);
  h.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
  h.dataset.splitted = '1';
  const spans = h.querySelectorAll('.w');
  spans.forEach((el,i)=>{
    el.style.display='inline-block';
    el.style.opacity='0';
    el.style.transform='translateY(12px)';
    el.style.transition=`opacity 520ms ${200+i*40}ms ease, transform 520ms ${200+i*40}ms ease`;
  });
  const io = new IntersectionObserver(([e])=>{
    if(e.isIntersecting){
      spans.forEach(el=>{ el.style.opacity='1'; el.style.transform='translateY(0)'; });
      io.disconnect();
    }
  }, {threshold:.35});
  io.observe(h);
})();

(function(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const v = document.querySelector('#day1 .day-bg__video');
  if(!v) return;
  let y=0, raf=0;
  const onScroll=()=>{ y = window.scrollY * 0.08; if(!raf) raf=requestAnimationFrame(()=>{ v.style.transform=`translate3d(0, ${y}px, 0)`; raf=0; }); };
  document.addEventListener('scroll', onScroll, {passive:true});
})();

(function(){
  const els = document.querySelectorAll('#day1 .reveal');
  if(!els.length) return;
  const io = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); }
    }
  }, {threshold:.2, rootMargin:'0px 0px -5% 0px'});
  els.forEach(el=>io.observe(el));
})();