/* =============================================
   A Promise in Pink
   All interactions · vanilla JavaScript
============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------
     Element references
  ------------------------------------------------- */
  const heroSection      = document.getElementById('hero');
  const heroOverlay      = document.querySelector('.hero__overlay');
  const heroTypingEls    = [...document.querySelectorAll('[data-typing]')];
  const enterButton      = document.getElementById('enter-heart');
  const storySection     = document.getElementById('story');
  const storyLines       = [...document.querySelectorAll('[data-story-line]')];
  const storyQuestion    = document.getElementById('story-question');
  const giftsSection     = document.getElementById('gifts');
  const yesButton        = document.getElementById('yes-btn');
  const noButton         = document.getElementById('no-btn');
  const destinyNote      = document.getElementById('destiny-note');
  const proposalActions  = document.getElementById('proposal-actions');

  const successOverlay   = document.getElementById('success-overlay');
  const toGiftsButton    = document.getElementById('to-gifts');
  const confettiCanvas   = document.getElementById('confetti-canvas');

  const heartField       = document.getElementById('heart-field');

  const modalTriggers    = document.querySelectorAll('[data-modal]');
  const closeModalTargets = document.querySelectorAll('[data-close-modal]');
  const modals           = document.querySelectorAll('.modal');

  const lightbox         = document.getElementById('lightbox');
  const lightboxImage    = document.getElementById('lightbox-image');
  const lightboxCloseBtn = document.querySelector('.lightbox__close');
  const carouselTrack    = document.getElementById('carousel-track');
  const carouselSlides   = document.querySelectorAll('.carousel__slide');
  const carouselDots     = document.querySelectorAll('.carousel__dot');
  const carouselPrev     = document.getElementById('carousel-prev');
  const carouselNext     = document.getElementById('carousel-next');

  const ambientToggle    = document.getElementById('ambient-toggle');
  const ambientMusic     = document.getElementById('ambient-music');
  const memoriesModal    = document.getElementById('memories-modal');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------
     Reusable typewriter — types one element at a time
  ------------------------------------------------- */
  function typeText(element, speed) {
    return new Promise((resolve) => {
      if (!element) { resolve(); return; }

      const fullText = element.dataset.fullText || element.textContent.trim();
      const charSpeed = speed || Number(element.dataset.typingSpeed) || 40;
      element.dataset.fullText = fullText;

      if (prefersReducedMotion) {
        element.textContent = fullText;
        element.classList.add('is-typed');
        resolve();
        return;
      }

      element.textContent = '';
      element.classList.add('is-typing');

      let i = 0;
      const timer = setInterval(() => {
        i += 1;
        element.textContent = fullText.slice(0, i);
        if (i >= fullText.length) {
          clearInterval(timer);
          element.classList.remove('is-typing');
          element.classList.add('is-typed');
          resolve();
        }
      }, charSpeed);
    });
  }

  /* -------------------------------------------------
     Hero opening — type eyebrow → title → subtitle → show button
  ------------------------------------------------- */
  async function runHeroTypingSequence() {
    for (const el of heroTypingEls) {
      await typeText(el);
    }
    // After all hero text is typed, reveal the Enter button
    enterButton.classList.add('is-visible');
  }

  runHeroTypingSequence();

  /* -------------------------------------------------
     Story opening — type lines one by one → question → buttons
  ------------------------------------------------- */
  async function runStoryTypingSequence() {
    for (const line of storyLines) {
      await typeText(line, 30);
      // Short pause between lines for dramatic effect
      await new Promise((r) => setTimeout(r, 420));
    }

    // Reveal the big question with a gentle fade
    await new Promise((r) => setTimeout(r, 600));
    storyQuestion.classList.add('is-visible');

    // Reveal proposal buttons
    await new Promise((r) => setTimeout(r, 700));
    proposalActions.classList.add('is-visible');
  }

  /* -------------------------------------------------
     Floating heart particles
  ------------------------------------------------- */
  function createHeartParticle() {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = '❤';

    const size = 10 + Math.random() * 20;
    const left = Math.random() * 100;
    const duration = 8 + Math.random() * 8;
    const delay = Math.random() * 4;

    heart.style.fontSize = size + 'px';
    heart.style.left = left + '%';
    heart.style.bottom = '-8vh';
    heart.style.animationDuration = duration + 's';
    heart.style.animationDelay = delay + 's';

    heartField.appendChild(heart);
    setTimeout(() => heart.remove(), (duration + delay) * 1000);
  }

  setInterval(createHeartParticle, 620);

  /* -------------------------------------------------
     Reveal-on-scroll (for gifts section cards etc.)
  ------------------------------------------------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  document.querySelectorAll('.reveal-on-scroll').forEach((el) => revealObserver.observe(el));

  /* -------------------------------------------------
     Hero parallax
  ------------------------------------------------- */
  window.addEventListener('scroll', () => {
    if (!heroOverlay) return;
    heroSection.style.setProperty('--parallax-y', window.scrollY * 0.16 + 'px');
  });

  /* -------------------------------------------------
     Enter My Heart → start ambient music + show story
  ------------------------------------------------- */
  let isAmbientPlaying = false;

  function startAmbientMusic() {
    if (isAmbientPlaying) return;
    ambientMusic.currentTime = 0;
    ambientMusic.play().catch(() => { /* autoplay blocked — user can toggle */ });
    isAmbientPlaying = true;
    ambientToggle.classList.add('is-playing');
    ambientToggle.textContent = '♬';
  }

  enterButton.addEventListener('click', () => {
    // Fade out hero
    heroSection.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
    heroSection.style.opacity = '0';
    heroSection.style.transform = 'scale(1.02)';

    setTimeout(() => {
      heroSection.classList.add('hidden');
      storySection.classList.remove('hidden');
      storySection.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Begin story typing sequence once section is visible
      setTimeout(runStoryTypingSequence, 500);
    }, 850);
  });

  /* -------------------------------------------------
     No button dodge (3 attempts then removed)
  ------------------------------------------------- */
  let noAttempts = 0;

  function handleNoAttempt(e) {
    e.preventDefault();
    noAttempts += 1;

    if (noAttempts >= 3) {
      noButton.classList.add('hidden');
      destinyNote.classList.remove('hidden');
      return;
    }

    // Shrink the button progressively with each attempt (100% → 65% → 35%)
    const scale = Math.max(0.35, 1 - noAttempts * 0.35);
    noButton.style.transform = 'scale(' + scale + ')';

    // Get positions, avoiding overlap with the Yes button
    const containerRect = proposalActions.getBoundingClientRect();
    const yesRect = yesButton.getBoundingClientRect();
    const btnW = noButton.offsetWidth * scale;
    const btnH = noButton.offsetHeight * scale;
    const maxX = Math.max(0, containerRect.width - btnW);
    const maxY = Math.max(0, containerRect.height - btnH);

    let newX, newY, attempts = 0;
    do {
      newX = Math.random() * maxX;
      newY = Math.random() * maxY;
      attempts++;
      // Convert to page-relative coords to check overlap with Yes
      var absX = containerRect.left + newX;
      var absY = containerRect.top + newY;
    } while (
      attempts < 30 &&
      absX < yesRect.right + 10 &&
      absX + btnW > yesRect.left - 10 &&
      absY < yesRect.bottom + 10 &&
      absY + btnH > yesRect.top - 10
    );

    noButton.style.position = 'absolute';
    noButton.style.transition = 'left 0.38s ease, top 0.38s ease, transform 0.38s ease';
    noButton.style.left = newX + 'px';
    noButton.style.top  = newY + 'px';
  }

  noButton.addEventListener('click', handleNoAttempt);
  noButton.addEventListener('touchstart', handleNoAttempt, { passive: false });

  /* -------------------------------------------------
     Yes → success overlay + confetti
  ------------------------------------------------- */
  yesButton.addEventListener('click', () => {
    startAmbientMusic();
    ambientToggle.classList.add('is-visible');
    successOverlay.classList.remove('hidden');
    launchConfettiBurst();
  });

  toGiftsButton.addEventListener('click', () => {
    successOverlay.classList.add('hidden');
    giftsSection.classList.remove('hidden');
    giftsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    giftsSection.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95) el.classList.add('is-visible');
    });
  });

  function launchConfettiBurst() {
    const ctx = confettiCanvas.getContext('2d');
    const colors = ['#F8C8DC', '#D4AF37', '#ffe8a6', '#f4afc9'];
    const pieces = [];
    const total = 180;

    confettiCanvas.width  = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    for (let i = 0; i < total; i++) {
      pieces.push({
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.42,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 9,
        vy: -Math.random() * 10 - 3,
        g: 0.18 + Math.random() * 0.05,
        rot: Math.random() * 360,
        rv: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    let frame = 0;
    const maxFrames = 220;

    (function render() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      frame++;

      pieces.forEach((p) => {
        p.vy += p.g; p.x += p.vx; p.y += p.vy;
        p.rot += p.rv; p.alpha -= 0.004;
        ctx.save();
        ctx.globalAlpha = Math.max(p.alpha, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.35);
        ctx.restore();
      });

      if (frame < maxFrames) requestAnimationFrame(render);
      else ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    })();
  }

  /* -------------------------------------------------
     Modals
  ------------------------------------------------- */
  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove('hidden');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(m) {
    if (!m) return;
    m.classList.add('hidden');
    m.setAttribute('aria-hidden', 'true');
    if (m.id === 'memories-modal') stopCarouselAutoPlay();
    if ([...modals].every((x) => x.classList.contains('hidden'))) {
      document.body.style.overflow = '';
    }
  }

  modalTriggers.forEach((t) => {
    function handle() {
      openModal(t.dataset.modal);
      if (t.dataset.modal === 'memories-modal') startCarouselAutoPlay();
    }
    t.addEventListener('click', handle);
    t.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handle(); }
    });
  });

  closeModalTargets.forEach((c) => {
    c.addEventListener('click', () => closeModal(c.closest('.modal')));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach((m) => closeModal(m));
      closeLightbox();
    }
  });

  /* -------------------------------------------------
     Lightbox
  ------------------------------------------------- */
  function openLightbox(src, alt) {
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightbox.classList.remove('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
  }

  document.querySelectorAll('.carousel__img').forEach((img) => {
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });

  lightboxCloseBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  /* -------------------------------------------------
     Memories carousel
  ------------------------------------------------- */
  let currentSlide = 0;
  let carouselTimer = null;

  function updateCarousel() {
    if (!carouselTrack || !carouselSlides.length) return;
    carouselTrack.style.transform = 'translateX(-' + currentSlide * 100 + '%)';
    carouselSlides.forEach((s, i) => s.classList.toggle('is-active', i === currentSlide));
    carouselDots.forEach((d, i) => d.classList.toggle('is-active', i === currentSlide));
  }

  function goToSlide(i) {
    if (!carouselSlides.length) return;
    currentSlide = (i + carouselSlides.length) % carouselSlides.length;
    updateCarousel();
  }

  function startCarouselAutoPlay() {
    if (!carouselSlides.length) return;
    stopCarouselAutoPlay();
    carouselTimer = setInterval(() => goToSlide(currentSlide + 1), 2600);
  }

  function stopCarouselAutoPlay() {
    if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null; }
  }

  if (carouselPrev) carouselPrev.addEventListener('click', () => { goToSlide(currentSlide - 1); startCarouselAutoPlay(); });
  if (carouselNext) carouselNext.addEventListener('click', () => { goToSlide(currentSlide + 1); startCarouselAutoPlay(); });

  carouselDots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goToSlide(i); startCarouselAutoPlay(); });
  });

  if (memoriesModal) {
    memoriesModal.addEventListener('mouseenter', stopCarouselAutoPlay);
    memoriesModal.addEventListener('mouseleave', startCarouselAutoPlay);
  }

  updateCarousel();

  /* -------------------------------------------------
     Ambient music toggle button
  ------------------------------------------------- */
  ambientToggle.addEventListener('click', () => {
    if (isAmbientPlaying) {
      ambientMusic.pause();
      isAmbientPlaying = false;
      ambientToggle.classList.remove('is-playing');
      ambientToggle.textContent = '♫';
    } else {
      startAmbientMusic();
    }
  });

});
