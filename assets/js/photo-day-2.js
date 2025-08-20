class Day2Slider {
  constructor(root) {
    this.root  = typeof root === 'string' ? document.querySelector(root) : root;
    if (!this.root) { console.warn('[Day2Slider] контейнер не найден'); return; }

    this.track = this.root.querySelector('.carousel-track');
    this.slides = Array.from(this.root.querySelectorAll('.slide'));
    if (!this.track || !this.slides.length) {
      console.warn('[Day2Slider] нет .carousel-track или .slide'); return;
    }

    this.idx = 0; this.timer = null; this.autoplayMs = 4200;
    this.buildNav(); this.bindEvents(); this.go(0); this.play();
  }

  buildNav() {
    const nav = document.createElement('div'); nav.className = 'nav';
    this.dots = this.slides.map((_, i) => {
      const d = document.createElement('button');
      d.className = 'dot'; d.ariaLabel = `Слайд ${i+1}`;
      d.addEventListener('click', () => this.go(i));
      return d;
    });
    this.dots.forEach(d => nav.appendChild(d));

    this.prevBtn = document.createElement('button');
    this.prevBtn.className = 'arrow prev'; this.prevBtn.innerHTML = '&#10094;';

    this.nextBtn = document.createElement('button');
    this.nextBtn.className = 'arrow next'; this.nextBtn.innerHTML = '&#10095;';

    this.root.append(nav, this.prevBtn, this.nextBtn);
  }

  bindEvents() {  
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());

    let startX = 0, delta = 0;
    this.root.addEventListener('pointerdown', (e) => {
      startX = e.clientX; delta = 0; this.root.setPointerCapture(e.pointerId); clearInterval(this.timer);
    });
    this.root.addEventListener('pointermove', (e) => {
      if (!startX) return;
      delta = e.clientX - startX;
      this.track.style.transform = `translateX(${ -this.idx*100 + (delta/innerWidth*100)}%)`;
    });
    const end = () => {
      if (!startX) return;
      if (Math.abs(delta) > 50) (delta < 0 ? this.next() : this.prev()); else this.go(this.idx);
      startX = 0; this.play();
    };
    this.root.addEventListener('pointerup', end);
    this.root.addEventListener('pointercancel', end);
  }

  go(i){ this.idx=(i+this.slides.length)%this.slides.length;
    this.track.style.transform=`translateX(-${this.idx*100}%)`;
    this.dots?.forEach((d,k)=>d.classList.toggle('active',k===this.idx));
  }
  next(){ this.go(this.idx+1); }
  prev(){ this.go(this.idx-1); }
  play(){ this.timer=setInterval(()=>this.next(), this.autoplayMs); }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.carousel').forEach(el => new Day2Slider(el));
});
