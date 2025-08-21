/* ===== MediaHub v3: одно активное медиа; музыка пауза — железно ===== */
(function(){
  class MediaHub {
    constructor(){
      this.stack = [];
      this.programmaticPaused = new WeakSet();
      this.noResumeOnce = null;           // не возобновлять «предыдущее» один раз
      this.onPlay  = e => this._onPlay(e.target);
      this.onPause = e => this._onPause(e.target);
      this.onEnded = e => this._onEnded(e.target);
    }

    init(){
      document.querySelectorAll('audio[data-media], video[data-media]')
        .forEach(el => this._attach(el));

      const mo = new MutationObserver(muts=>{
        muts.forEach(m=>{
          m.addedNodes && m.addedNodes.forEach(n=>{
            if (n.nodeType!==1) return;
            if (n.matches?.('audio[data-media], video[data-media]')) this._attach(n);
            n.querySelectorAll?.('audio[data-media], video[data-media]').forEach(el=>this._attach(el));
          });
        });
      });
      mo.observe(document.documentElement, {childList:true, subtree:true});
      this.mo = mo;
    }

    _attach(el){
      if (el.__mediaHubAttached) return;
      el.__mediaHubAttached = true;
      el.addEventListener('play',  this.onPlay);
      el.addEventListener('pause', this.onPause);
      el.addEventListener('ended', this.onEnded);
      if (!el.paused && !el.ended) this._onPlay(el);
    }

    _onPlay(el){
      /* ГЛАВНАЯ ЗАЩИТА: если элемент вручную заглушён — тут же ставим паузу */
      if (el.__manualMute === true) {
        this.programmaticPaused.add(el);
        try { el.pause(); } catch(e){}
        return;
      }

      const top = this.stack.at(-1)?.el;
      if (top && top !== el && !top.paused && !top.ended) {
        this.programmaticPaused.add(top);
        try { top.pause(); } catch(e){}
      }
      const i = this.stack.findIndex(x=>x.el===el);
      if (i !== -1) this.stack.splice(i,1);
      this.stack.push({ el, type: el.dataset.media || el.tagName.toLowerCase() });
    }

    _onPause(el){
      if (this.programmaticPaused.has(el)) {
        this.programmaticPaused.delete(el);
        return;
      }
      const top = this.stack.at(-1)?.el;

      // Нажали «Музыка: выкл» — ничего не возобновляем
      if (this.noResumeOnce === el) {
        this.noResumeOnce = null;
        if (top === el) this.stack.pop();
        return;
      }

      if (top === el) {
        this.stack.pop();
        this._resumePrev();
      } else {
        const i = this.stack.findIndex(x=>x.el===el);
        if (i !== -1) this.stack.splice(i,1);
      }
    }

    _onEnded(el){
      const top = this.stack.at(-1)?.el;
      if (top === el) {
        this.stack.pop();
        this._resumePrev();
      } else {
        const i = this.stack.findIndex(x=>x.el===el);
        if (i !== -1) this.stack.splice(i,1);
      }
    }

    _resumePrev(){
      const prev = this.stack.at(-1)?.el;
      if (!prev) return;
      // если предыдущий вручную заглушён — не возобновляем
      if (prev.__manualMute === true) return;
      try { prev.play(); } catch(e){}
    }
  }

  // Синглтон
  window.MediaHub = new MediaHub();

  document.addEventListener('DOMContentLoaded', () => {
    const hub   = window.MediaHub;
    hub.init();

    const music = document.getElementById('bg-audio');
    const btn   = document.getElementById('audio-toggle');
    const label = document.getElementById('audio-label');

    // пометки типов на всякий случай
    if (music) music.dataset.media = music.dataset.media || 'music';
    document.querySelectorAll('video[controls]:not([data-media])')
      .forEach(v => v.dataset.media = 'video');
    document.querySelectorAll('audio.mil-audio__el:not([data-media])')
      .forEach(a => a.dataset.media = 'story');

    // «ленивый» src для музыки
    function ensureSrc(){
      if (!music) return;
      if (!music.src) {
        const lazy = music.getAttribute('data-src');
        if (lazy) music.src = lazy;
      }
    }

    // ОБЁРТКА НА ЗАПУСК: любые play() при manualMute гасим
    function applyPlayGuard(el){
      if (!el || el.__playGuardApplied) return;
      const origPlay = el.play.bind(el);
      el.play = function(...args){
        if (el.__manualMute === true) return Promise.resolve(); // запрещаем автозапуск
        return origPlay(...args);
      };
      el.__playGuardApplied = true;
    }
    applyPlayGuard(music);

    function syncBtn(){
      const on = music && !music.paused && !music.ended && music.__manualMute !== true;
      btn?.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (label) label.textContent = on ? 'Музыка: вкл' : 'Музыка: выкл';
    }

    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation(); // на всякий — гасим чужие хендлеры
      if (!music) return;
      ensureSrc();
      if (music.paused || music.__manualMute === true) {
        // включаем музыку вручную
        music.__manualMute = false;
        music.play().catch(()=>{});
      } else {
        // выключаем музыку вручную
        hub.noResumeOnce = music;   // не возобновлять «предыдущее»
        music.__manualMute = true;  // ставим ручной mute
        music.pause();
      }
      syncBtn();
    });

    // если кто-то попытается запустить музыку «в обход» — сразу пауза
    music?.addEventListener('play', () => {
      if (music.__manualMute === true) {
        hub.programmaticPaused.add(music);
        music.pause();
      }
      syncBtn();
    });
    music?.addEventListener('pause', syncBtn);
    music?.addEventListener('ended', syncBtn);

    syncBtn();
  });
})();

