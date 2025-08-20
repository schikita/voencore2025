 class Day2Slider {
            constructor() {
                this.currentSlide = 0;
                this.slides = document.querySelectorAll('.day2-card');
                this.totalSlides = this.slides.length;
                this.prevBtn = document.querySelector('.day2-prev');
                this.nextBtn = document.querySelector('.day2-next');
                this.dotsContainer = document.querySelector('.day2-dots');
                this.progress = document.querySelector('.day2-progress');
                this.isAutoPlaying = true;
                
                this.init();
            }

            init() {
                this.createDots();
                this.bindEvents();
                this.updateProgress();
                this.startAutoPlay();
            }

            createDots() {
                for (let i = 0; i < this.totalSlides; i++) {
                    const dot = document.createElement('button');
                    dot.className = `day2-dot ${i === 0 ? 'active' : ''}`;
                    dot.setAttribute('aria-label', `Слайд ${i + 1}`);
                    dot.setAttribute('role', 'tab');
                    dot.addEventListener('click', () => this.goToSlide(i));
                    this.dotsContainer.appendChild(dot);
                }
            }

            bindEvents() {
                this.prevBtn.addEventListener('click', () => this.prevSlide());
                this.nextBtn.addEventListener('click', () => this.nextSlide());
                
                // Keyboard navigation
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowLeft') this.prevSlide();
                    if (e.key === 'ArrowRight') this.nextSlide();
                    if (e.key === ' ') {
                        e.preventDefault();
                        this.toggleAutoPlay();
                    }
                });
           
                let startX, startY, distX, distY;
                const slider = document.querySelector('.day2-slider');
                
                slider.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                    this.pauseAutoPlay();
                });

                slider.addEventListener('touchmove', (e) => {
                    if (!startX || !startY) return;
                    distX = e.touches[0].clientX - startX;
                    distY = e.touches[0].clientY - startY;
                });

                slider.addEventListener('touchend', () => {
                    if (!startX || !startY) return;
                    
                    if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > 50) {
                        if (distX > 0) {
                            this.prevSlide();
                        } else {
                            this.nextSlide();
                        }
                    }
                    
                    startX = startY = distX = distY = null;
                    this.resumeAutoPlay();
                });

        
                slider.addEventListener('mouseenter', () => this.pauseAutoPlay());
                slider.addEventListener('mouseleave', () => this.resumeAutoPlay());
            }

            goToSlide(index) {
            
                this.slides[this.currentSlide].classList.remove('active');
                document.querySelectorAll('.day2-dot')[this.currentSlide].classList.remove('active');                
                
                this.currentSlide = index;                
               
                this.slides[this.currentSlide].classList.add('active');
                document.querySelectorAll('.day2-dot')[this.currentSlide].classList.add('active');
                
                this.updateProgress();
                this.restartAutoPlay();
            }

            nextSlide() {
                const nextIndex = (this.currentSlide + 1) % this.totalSlides;
                this.goToSlide(nextIndex);
            }

            prevSlide() {
                const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
                this.goToSlide(prevIndex);
            }

            updateProgress() {
                const progressPercent = ((this.currentSlide + 1) / this.totalSlides) * 100;
                this.progress.style.width = `${progressPercent}%`;
            }

            startAutoPlay() {
                if (!this.isAutoPlaying) return;
                this.autoPlayInterval = setInterval(() => {
                    this.nextSlide();
                }, 8000);
            }

            pauseAutoPlay() {
                this.isAutoPlaying = false;
                clearInterval(this.autoPlayInterval);
            }

            resumeAutoPlay() {
                this.isAutoPlaying = true;
                this.startAutoPlay();
            }

            toggleAutoPlay() {
                if (this.isAutoPlaying) {
                    this.pauseAutoPlay();
                } else {
                    this.resumeAutoPlay();
                }
            }

            restartAutoPlay() {
                if (this.isAutoPlaying) {
                    clearInterval(this.autoPlayInterval);
                    this.startAutoPlay();
                }
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
 
            new Day2Slider();            

            const video = document.querySelector('.day-bg__video');
            
            if (video) {      
                const playVideo = () => {
                    video.play().catch(e => {
                        console.log('Autoplay blocked:', e);
                    });
                };

                video.addEventListener('loadedmetadata', playVideo);
                video.addEventListener('canplay', playVideo);

      
                document.addEventListener('click', playVideo, { once: true });


                let ticking = false;
                const updateParallax = () => {
                    const scrolled = window.pageYOffset;
                    video.style.transform = `translateY(${scrolled * 0.3}px) translateZ(0)`;
                    ticking = false;
                };

                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        requestAnimationFrame(updateParallax);
                        ticking = true;
                    }
                });
            }
   
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.day2-card').forEach(card => {
                observer.observe(card);
            });
        });