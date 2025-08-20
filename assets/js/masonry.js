// ===== Masonry Gallery: reveal + lightbox =====
    (function(){
      const root = document.querySelector('.masonry-gallery');
      if(!root) return;

      const io = new IntersectionObserver((entries)=>{
        for(const e of entries){
          if(e.isIntersecting){ 
            e.target.classList.add('in'); 
            io.unobserve(e.target); 
          }
        }
      }, {threshold:0.12});
      
      root.querySelectorAll('.reveal').forEach(n=>io.observe(n));

      // Lightbox
      const items = Array.from(root.querySelectorAll('.mg-card'));
      const lb = root.querySelector('.mg-lightbox');
      const img = root.querySelector('.mg-full');
      const btnPrev = root.querySelector('.mg-prev');
      const btnNext = root.querySelector('.mg-next');
      const btnClose = root.querySelector('.mg-close');

      let index = 0;
      
      const open = (i)=>{
        index = i;
        const full = items[index].querySelector('.mg-open').dataset.full || items[index].querySelector('img').src;
        img.src = full;
        lb.classList.add('open');
        lb.setAttribute('aria-hidden','false');
        document.body.style.overflow='hidden';
      };
      
      const close = ()=>{
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden','true');
        document.body.style.overflow='';
        img.src = '';
      };
      
      const prev = ()=> open((index - 1 + items.length) % items.length);
      const next = ()=> open((index + 1) % items.length);

      items.forEach((it, i)=> it.querySelector('.mg-open').addEventListener('click', ()=>open(i)));
      btnClose.addEventListener('click', close);
      btnPrev.addEventListener('click', prev);
      btnNext.addEventListener('click', next);
      lb.addEventListener('click', (e)=>{ if(e.target === lb) close(); });

      window.addEventListener('keydown', (e)=>{
        if(!lb.classList.contains('open')) return;
        if(e.key==='Escape') close();
        if(e.key==='ArrowLeft') prev();
        if(e.key==='ArrowRight') next();
      });
    })();