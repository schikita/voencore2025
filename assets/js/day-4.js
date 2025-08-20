(function(){
  function fmt(t){ if(!isFinite(t)) return '0:00'; const m=Math.floor(t/60), s=Math.floor(t%60); return m+':' + String(s).padStart(2,'0'); }

  document.querySelectorAll('.mil-audio').forEach((root)=>{
    const el = root.querySelector('.mil-audio__el') || (()=> {
      const a = document.createElement('audio'); a.className='mil-audio__el'; a.preload='metadata';
      const src = root.dataset.src || ''; if(src){ const s=document.createElement('source'); s.src=src; s.type='audio/mpeg'; a.appendChild(s); }
      root.appendChild(a); return a;
    })();

    const btn = root.querySelector('.mil-audio__btn');
    const muteBtn = root.querySelector('.mil-audio__mute');
    const vol = root.querySelector('.mil-audio__volume');
    const progress = root.querySelector('.mil-audio__progress');
    const fill = root.querySelector('.mil-audio__progress-fill');
    const head = root.querySelector('.mil-audio__progress-head');
    const cur = root.querySelector('.mil-audio__cur');
    const dur = root.querySelector('.mil-audio__dur');

    function syncPlayState(){
      const playIcon = btn.querySelector('.mil-ic:not(.is-pause)');
      const pauseIcon = btn.querySelector('.is-pause');
      if (el.paused){ playIcon.style.display='block'; pauseIcon.style.display='none'; btn.dataset.state='play'; }
      else { playIcon.style.display='none'; pauseIcon.style.display='block'; btn.dataset.state='pause'; }
    }

    btn.addEventListener('click', ()=>{ el.paused ? el.play() : el.pause(); });

    el.addEventListener('play', syncPlayState);
    el.addEventListener('pause', syncPlayState);

    el.addEventListener('loadedmetadata', ()=>{ dur.textContent = fmt(el.duration); });

    el.addEventListener('timeupdate', ()=>{
      const p = el.currentTime / (el.duration || 1);
      const pct = Math.max(0, Math.min(1, p)) * 100;
      fill.style.width = pct + '%';
      head.style.left = pct + '%';
      progress.setAttribute('aria-valuenow', Math.round(pct));
      cur.textContent = fmt(el.currentTime);
    });

    const seek = (clientX)=>{
      const rect = progress.getBoundingClientRect();
      const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
      const pct = x / rect.width;
      el.currentTime = (el.duration || 0) * pct;
    };
    let dragging = false;
    progress.addEventListener('pointerdown', (e)=>{ dragging=true; progress.setPointerCapture(e.pointerId); seek(e.clientX); });
    progress.addEventListener('pointermove', (e)=>{ if(dragging) seek(e.clientX); });
    progress.addEventListener('pointerup',   (e)=>{ dragging=false; progress.releasePointerCapture(e.pointerId); });
    progress.addEventListener('keydown', (e)=>{
      if(e.key==='ArrowRight'){ el.currentTime = Math.min((el.currentTime||0) + 5, el.duration||0); }
      if(e.key==='ArrowLeft'){  el.currentTime = Math.max((el.currentTime||0) - 5, 0); }
      if(e.key==='Home'){ el.currentTime = 0; }
      if(e.key==='End'){  el.currentTime = el.duration||0; }
    });

    if (vol){
      vol.addEventListener('input', ()=>{ el.volume = Number(vol.value); if (el.volume===0) setMuted(true); else setMuted(false); });
      el.volume = Number(vol.value || 0.9);
    }
    function setMuted(v){
      el.muted = v;
      const ic1 = muteBtn.querySelector('.mil-ic:not(.is-muted)');
      const ic2 = muteBtn.querySelector('.is-muted');
      if (v){ ic1.style.display='none'; ic2.style.display='block'; muteBtn.dataset.muted='true'; }
      else  { ic1.style.display='block'; ic2.style.display='none';  muteBtn.dataset.muted='false'; }
    }
    muteBtn.addEventListener('click', ()=> setMuted(!el.muted));

    root.addEventListener('keydown', (e)=>{
      if (e.code==='Space'){ e.preventDefault(); el.paused ? el.play() : el.pause(); }
      if (e.key.toLowerCase()==='m'){ setMuted(!el.muted); }
    });

    const unlock = ()=>{ el.play().then(()=>{ el.pause(); syncPlayState(); }).catch(()=>{}); document.removeEventListener('click', unlock, {once:true}); };
    document.addEventListener('click', unlock, {once:true});
  });
})();