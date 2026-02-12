/* =============================================================
   script.js — Luxury Romantic Proposal
   Vanilla JS · No frameworks · GitHub Pages ready
============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------
     DOM REFERENCES
  ------------------------------------------------------- */
  const particleCanvas = document.getElementById('particle-canvas');
  const landing        = document.getElementById('landing');
  const story          = document.getElementById('story');
  const gifts          = document.getElementById('gifts');
  const btnEnter       = document.getElementById('btn-enter');
  const storyLines     = document.querySelectorAll('.story__line');
  const bigQuestion    = document.getElementById('big-question');
  const proposalBtns   = document.getElementById('proposal-buttons');
  const btnYes         = document.getElementById('btn-yes');
  const btnNo          = document.getElementById('btn-no');
  const noExpired      = document.getElementById('no-expired');
  const successOverlay = document.getElementById('success-overlay');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const btnGifts       = document.getElementById('btn-gifts');
  const lightbox       = document.getElementById('lightbox');
  const lightboxImg    = lightbox.querySelector('.lightbox__img');
  const lightboxClose  = lightbox.querySelector('.lightbox__close');
  const btnMusic       = document.getElementById('btn-music');
  const bgMusic        = document.getElementById('bg-music');
  const musicIcon      = document.getElementById('music-icon');

  /* ==========================================================
     1. GOLD FLOATING PARTICLES
  ========================================================== */
  const pCtx = particleCanvas.getContext('2d');
  let particles = [];
  const P_COUNT = 40;

  function resizeParticleCanvas() {
    particleCanvas.width  = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < P_COUNT; i++) {
      particles.push({
        x: Math.random() * particleCanvas.width,
        y: Math.random() * particleCanvas.height,
        r: 0.6 + Math.random() * 1.4,
        vy: -(0.15 + Math.random() * 0.3),
        vx: (Math.random() - 0.5) * 0.2,
        alpha: 0.15 + Math.random() * 0.35,
        flicker: Math.random() * Math.PI * 2   // phase offset for soft flicker
      });
    }
  }

  let tick = 0;
  function drawParticles() {
    pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    tick += 0.01;

    particles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;

      // Wrap around
      if (p.y < -10) { p.y = particleCanvas.height + 10; p.x = Math.random() * particleCanvas.width; }

      // Subtle twinkle
      const flicker = 0.7 + 0.3 * Math.sin(tick * 2 + p.flicker);

      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pCtx.fillStyle = `rgba(212, 175, 55, ${p.alpha * flicker})`;
      pCtx.fill();
    });

    requestAnimationFrame(drawParticles);
  }

  resizeParticleCanvas();
  initParticles();
  drawParticles();
  window.addEventListener('resize', () => { resizeParticleCanvas(); initParticles(); });

  /* ==========================================================
     2. SECTION TRANSITIONS
  ========================================================== */
  function transitionSections(hideEl, showEl, cb) {
    hideEl.style.transition = 'opacity 0.8s ease';
    hideEl.style.opacity = '0';

    setTimeout(() => {
      hideEl.classList.add('hidden');
      hideEl.style.opacity = '';
      hideEl.style.transition = '';
      showEl.classList.remove('hidden');
      showEl.style.opacity = '0';
      showEl.style.transition = 'opacity 0.8s ease';

      // Force reflow
      void showEl.offsetHeight;
      showEl.style.opacity = '1';

      if (cb) setTimeout(cb, 200);
    }, 850);
  }

  /* ==========================================================
     3. LANDING → STORY
  ========================================================== */
  btnEnter.addEventListener('click', () => {
    transitionSections(landing, story, beginStorySequence);
  });

  /* ==========================================================
     4. STORY — LINE-BY-LINE REVEAL
  ========================================================== */
  function beginStorySequence() {
    const baseDelay = 600;   // ms between lines
    const lineDelay = 900;   // ms per line

    storyLines.forEach((line, i) => {
      setTimeout(() => {
        line.classList.add('fade-visible');
      }, baseDelay + i * lineDelay);
    });

    // After all lines, show the big question
    const totalLineTime = baseDelay + storyLines.length * lineDelay + 600;

    setTimeout(() => {
      bigQuestion.classList.remove('hidden');
      // Trigger reflow then animate
      void bigQuestion.offsetHeight;
      bigQuestion.classList.add('fade-visible');
    }, totalLineTime);

    setTimeout(() => {
      proposalBtns.classList.remove('hidden');
      void proposalBtns.offsetHeight;
      proposalBtns.classList.add('fade-visible');
    }, totalLineTime + 700);
  }

  /* ==========================================================
     5. "NO" BUTTON — ELEGANT DODGE
  ========================================================== */
  let noAttempts = 0;
  const MAX_NO = 3;

  function handleNo(e) {
    e.preventDefault();
    noAttempts++;

    if (noAttempts >= MAX_NO) {
      btnNo.classList.add('hidden');
      noExpired.classList.remove('hidden');
      return;
    }

    // Move to a random position on screen
    btnNo.classList.add('dodging');
    const maxX = window.innerWidth  - btnNo.offsetWidth  - 20;
    const maxY = window.innerHeight - btnNo.offsetHeight - 20;
    btnNo.style.left = Math.max(20, Math.random() * maxX) + 'px';
    btnNo.style.top  = Math.max(20, Math.random() * maxY) + 'px';
  }

  btnNo.addEventListener('click', handleNo);
  btnNo.addEventListener('touchstart', handleNo, { passive: false });

  /* ==========================================================
     6. "YES" — SUCCESS OVERLAY + CONFETTI
  ========================================================== */
  btnYes.addEventListener('click', () => {
    successOverlay.classList.remove('hidden');
    launchConfetti();
  });

  btnGifts.addEventListener('click', () => {
    successOverlay.classList.add('hidden');
    transitionSections(story, gifts, activateRevealObserver);
  });

  /* ==========================================================
     7. CONFETTI — Refined gold particles
  ========================================================== */
  function launchConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width  = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const pieces = [];
    const COLORS = [
      '#d4af37',   // gold
      '#e8cc6e',   // light gold
      '#f5e6b8',   // pale gold
      '#c9a84c',   // deep gold
      '#ffffff',   // white accent
      '#b89b3b'    // antique gold
    ];
    const COUNT = 100;

    for (let i = 0; i < COUNT; i++) {
      pieces.push({
        x: confettiCanvas.width / 2 + (Math.random() - 0.5) * 200,
        y: confettiCanvas.height * 0.5,
        w: 3 + Math.random() * 5,
        h: 8 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vy: -(4 + Math.random() * 8),
        vx: (Math.random() - 0.5) * 6,
        rotation: Math.random() * 360,
        rv: (Math.random() - 0.5) * 6,
        gravity: 0.12 + Math.random() * 0.06,
        alpha: 1,
        decay: 0.003 + Math.random() * 0.003
      });
    }

    let frame = 0;
    const MAX_FRAMES = 260;

    function draw() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      frame++;
      let alive = false;

      pieces.forEach(p => {
        if (p.alpha <= 0) return;
        alive = true;

        p.vy += p.gravity;
        p.x  += p.vx;
        p.y  += p.vy;
        p.vx *= 0.99;
        p.rotation += p.rv;

        // Start fading after midpoint
        if (frame > MAX_FRAMES * 0.5) {
          p.alpha = Math.max(0, p.alpha - p.decay * 2);
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (alive && frame < MAX_FRAMES) {
        requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }

    draw();
  }

  /* ==========================================================
     8. INTERSECTION OBSERVER — Fade-in on scroll
  ========================================================== */
  function activateRevealObserver() {
    const els = document.querySelectorAll('#gifts .reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.8s ease ${i * 0.15}s, transform 0.8s ease ${i * 0.15}s`;
      observer.observe(el);
    });
  }

  /* ==========================================================
     9. GIFT CARDS → OPEN MODALS
  ========================================================== */
  document.querySelectorAll('.gift-card[data-modal]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-modal');
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  /* Close modals */
  function closeModal(modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';

    // Pause any YouTube iframes inside this modal to stop playback
    modal.querySelectorAll('iframe').forEach(iframe => {
      const src = iframe.src;
      iframe.src = '';        // clear to stop video
      iframe.src = src;       // re-assign for next open
    });
  }

  document.querySelectorAll('.modal__close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
  });

  document.querySelectorAll('.modal__backdrop').forEach(bd => {
    bd.addEventListener('click', () => closeModal(bd.closest('.modal')));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal:not(.hidden)').forEach(m => closeModal(m));
      if (!lightbox.classList.contains('hidden')) lightbox.classList.add('hidden');
    }
  });

  /* ==========================================================
     10. LIGHTBOX — Gallery image viewer
  ========================================================== */
  document.querySelectorAll('.gallery__img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.remove('hidden');
    });
  });

  lightboxClose.addEventListener('click', () => lightbox.classList.add('hidden'));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.add('hidden');
  });

  /* ==========================================================
     11. AMBIENT MUSIC TOGGLE
  ========================================================== */
  let musicPlaying = false;

  btnMusic.addEventListener('click', () => {
    if (musicPlaying) {
      bgMusic.pause();
      musicIcon.textContent = '♪';
      btnMusic.classList.remove('playing');
    } else {
      bgMusic.play().catch(() => {
        /* Autoplay policy — user will try again */
      });
      musicIcon.textContent = '♫';
      btnMusic.classList.add('playing');
    }
    musicPlaying = !musicPlaying;
  });

});
