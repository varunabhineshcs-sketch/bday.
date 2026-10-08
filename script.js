/* ===== BIRTHDAY LOVE SITE - INTERACTIVE MAGIC ===== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const entryOverlay = document.getElementById('entryOverlay');
  const enterBtn = document.getElementById('enterBtn');
  const mainContent = document.getElementById('mainContent');
  const musicBtn = document.getElementById('musicBtn');
  const bgMusic = document.getElementById('bgMusic');
  const musicStatus = document.querySelector('.music-status');
  const surpriseBtn = document.getElementById('surpriseBtn');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  let musicPlaying = false;
  let hearts = [];
  let confettiParticles = [];
  let animationId;

  // ===== ENTRY SCREEN =====
  enterBtn.addEventListener('click', () => {
    entryOverlay.classList.add('hidden');
    mainContent.classList.remove('hidden');
    
    // Start background hearts
    initHearts();
    
    // Try to play music (browsers require user interaction)
    tryPlayMusic();
    
    // Trigger initial animations
    setTimeout(() => {
      observeElements();
    }, 300);
  });

  // ===== MUSIC =====
  function tryPlayMusic() {
    bgMusic.volume = 0.4;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          musicPlaying = true;
          musicBtn.classList.add('playing');
          musicStatus.textContent = 'Now Playing';
        })
        .catch(() => {
          // Autoplay blocked — user can click the button
          musicStatus.textContent = 'Tap to Play';
        });
    }
  }

  musicBtn.addEventListener('click', () => {
    if (musicPlaying) {
      bgMusic.pause();
      musicPlaying = false;
      musicBtn.classList.remove('playing');
      musicStatus.textContent = 'Play Our Song';
    } else {
      bgMusic.play()
        .then(() => {
          musicPlaying = true;
          musicBtn.classList.add('playing');
          musicStatus.textContent = 'Now Playing';
        })
        .catch(err => {
          console.log('Music play failed:', err);
          musicStatus.textContent = 'Add song.mp3';
        });
    }
  });

  // ===== FLOATING HEARTS CANVAS =====
  const heartsCanvas = document.getElementById('heartsCanvas');
  const heartsCtx = heartsCanvas.getContext('2d');

  function resizeHeartsCanvas() {
    heartsCanvas.width = window.innerWidth;
    heartsCanvas.height = window.innerHeight;
  }
  resizeHeartsCanvas();
  window.addEventListener('resize', resizeHeartsCanvas);

  class Heart {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * heartsCanvas.width;
      this.y = initial ? Math.random() * heartsCanvas.height : heartsCanvas.height + 20;
      this.size = Math.random() * 12 + 6;
      this.speedY = Math.random() * 0.8 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.03 + 0.01;
      this.color = Math.random() > 0.5 ? '#ff6b9d' : '#a18cd1';
    }

    update() {
      this.y -= this.speedY;
      this.wobble += this.wobbleSpeed;
      this.x += Math.sin(this.wobble) * 0.5 + this.speedX;

      if (this.y < -30) {
        this.reset();
      }
    }

    draw() {
      heartsCtx.save();
      heartsCtx.translate(this.x, this.y);
      heartsCtx.globalAlpha = this.opacity;
      heartsCtx.fillStyle = this.color;
      heartsCtx.beginPath();
      const s = this.size / 2;
      heartsCtx.moveTo(0, s * 0.3);
      heartsCtx.bezierCurveTo(-s, -s * 0.5, -s * 1.5, s * 0.3, 0, s * 1.4);
      heartsCtx.bezierCurveTo(s * 1.5, s * 0.3, s, -s * 0.5, 0, s * 0.3);
      heartsCtx.fill();
      heartsCtx.restore();
    }
  }

  function initHearts() {
    hearts = [];
    const count = Math.min(Math.floor(window.innerWidth / 25), 40);
    for (let i = 0; i < count; i++) {
      hearts.push(new Heart());
    }
    animateHearts();
  }

  function animateHearts() {
    heartsCtx.clearRect(0, 0, heartsCanvas.width, heartsCanvas.height);
    hearts.forEach(h => {
      h.update();
      h.draw();
    });
    animationId = requestAnimationFrame(animateHearts);
  }

  // ===== SCROLL REVEAL =====
  function observeElements() {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay || 0;
          setTimeout(() => {
            el.classList.add('visible');
          }, delay);
          observer.unobserve(el);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reason-card, .gallery-item, .letter-paper, .promise-item').forEach(el => {
      observer.observe(el);
    });
  }

  // ===== GALLERY LIGHTBOX =====
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.dataset.caption || '';
      lightboxImg.src = img.src;
      lightboxCaption.textContent = caption;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // ===== CONFETTI =====
  const confettiCanvas = document.getElementById('confettiCanvas');
  const confettiCtx = confettiCanvas.getContext('2d');

  function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  resizeConfetti();
  window.addEventListener('resize', resizeConfetti);

  class Confetti {
    constructor() {
      this.x = Math.random() * confettiCanvas.width;
      this.y = -20;
      this.size = Math.random() * 10 + 5;
      this.speedY = Math.random() * 4 + 2;
      this.speedX = (Math.random() - 0.5) * 4;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 10;
      this.color = ['#ff6b9d', '#a18cd1', '#ff9a9e', '#fbc2eb', '#fad0c4', '#ffd700'][
        Math.floor(Math.random() * 6)
      ];
      this.opacity = 1;
      this.shape = Math.random() > 0.5 ? 'rect' : 'heart';
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;
      this.speedY += 0.05; // gravity
      if (this.y > confettiCanvas.height) {
        this.opacity = 0;
      }
    }

    draw() {
      confettiCtx.save();
      confettiCtx.translate(this.x, this.y);
      confettiCtx.rotate((this.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = this.opacity;
      confettiCtx.fillStyle = this.color;

      if (this.shape === 'heart') {
        const s = this.size / 2;
        confettiCtx.beginPath();
        confettiCtx.moveTo(0, s * 0.3);
        confettiCtx.bezierCurveTo(-s, -s * 0.5, -s * 1.5, s * 0.3, 0, s * 1.4);
        confettiCtx.bezierCurveTo(s * 1.5, s * 0.3, s, -s * 0.5, 0, s * 0.3);
        confettiCtx.fill();
      } else {
        confettiCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
      }
      confettiCtx.restore();
    }
  }

  let confettiAnimating = false;

  function launchConfetti() {
    confettiParticles = [];
    for (let i = 0; i < 120; i++) {
      confettiParticles.push(new Confetti());
    }
    if (!confettiAnimating) {
      confettiAnimating = true;
      animateConfetti();
    }
  }

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles = confettiParticles.filter(p => p.opacity > 0);
    confettiParticles.forEach(p => {
      p.update();
      p.draw();
    });

    if (confettiParticles.length > 0) {
      requestAnimationFrame(animateConfetti);
    } else {
      confettiAnimating = false;
    }
  }

  // ===== SURPRISE BUTTON =====
  surpriseBtn.addEventListener('click', () => {
    launchConfetti();
    
    // Change button text temporarily
    const original = surpriseBtn.textContent;
    surpriseBtn.textContent = 'I love you endlessly 💕';
    surpriseBtn.disabled = true;
    
    setTimeout(() => {
      surpriseBtn.textContent = original;
      surpriseBtn.disabled = false;
    }, 3000);
  });

  // ===== CLICK HEART BURST (extra magic) =====
  document.addEventListener('click', (e) => {
    // Don't trigger on buttons or interactive elements
    if (e.target.closest('button') || e.target.closest('.gallery-item') || e.target.closest('.music-control')) {
      return;
    }
    
    // Small heart burst at click position (only on main content)
    if (!mainContent.classList.contains('hidden') && entryOverlay.classList.contains('hidden')) {
      createClickHeart(e.clientX, e.clientY);
    }
  });

  function createClickHeart(x, y) {
    const heart = document.createElement('div');
    heart.textContent = ['💕', '💖', '💗', '💓', '✨'][Math.floor(Math.random() * 5)];
    heart.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-size: ${Math.random() * 16 + 18}px;
      pointer-events: none;
      z-index: 9998;
      transform: translate(-50%, -50%);
      animation: clickHeart 0.9s ease-out forwards;
    `;
    document.body.appendChild(heart);
    
    setTimeout(() => heart.remove(), 900);
  }

  // Inject click heart animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes clickHeart {
      0% { opacity: 1; transform: translate(-50%, -50%) scale(0.3); }
      50% { opacity: 1; transform: translate(-50%, -80%) scale(1.2); }
      100% { opacity: 0; transform: translate(-50%, -120%) scale(0.8); }
    }
  `;
  document.head.appendChild(style);

  // ===== PREVENT CONTEXT MENU ON IMAGES (optional nicety) =====
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', e => e.preventDefault());
  });
});
