(function(){
  const burger = document.getElementById('nav-burger');
  const menu = document.getElementById('nav-menu');
  const navbar = document.querySelector('.navbar');
  if (!burger || !menu) return;
  const close = () => {
    burger.setAttribute('aria-expanded','false');
    navbar.classList.remove('open');
    menu.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };
  const open = () => {
    burger.setAttribute('aria-expanded','true');
    navbar.classList.add('open');
    menu.classList.add('open');
    document.body.classList.add('no-scroll');
  };
  burger.addEventListener('click', (e)=>{
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    expanded ? close() : open();
  });
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click', close));
  window.addEventListener('keydown', (e)=>{
    if(e.key==='Escape') close();
  });

  // Reveal on scroll
  const io = new IntersectionObserver(entries=>{
    for (const en of entries){
      if (en.isIntersecting){
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    }
  }, {threshold: 0.1});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();
