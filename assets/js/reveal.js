(function(){
  const io = new IntersectionObserver((entries, obs)=>{
    for(const e of entries){
      if(e.isIntersecting){
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    }
  }, {threshold: 0.12});
  document.querySelectorAll('.reveal, .reveal-media').forEach(n=>io.observe(n));
})();