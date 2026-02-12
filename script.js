/* =============================================
   A Promise in Pink
   All interactions in vanilla JavaScript
============================================= */

document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------
     Element references
  ------------------------------------------------- */
  const heroSection = document.getElementById('hero');
  const heroOverlay = document.querySelector('.hero__overlay');
  const typingElements = [...document.querySelectorAll('[data-typing]')];
  const enterButton = document.getElementById('enter-heart');
  const storySection = document.getElementById('story');
  const giftsSection = document.getElementById('gifts');
  const yesButton = document.getElementById('yes-btn');
  const noButton = document.getElementById('no-btn');
  const destinyNote = document.getElementById('destiny-note');
  const proposalActions = document.getElementById('proposal-actions');

  const successOverlay = document.getElementById('success-overlay');
  const toGiftsButton = document.getElementById('to-gifts');
  const confettiCanvas = document.getElementById('confetti-canvas');

  const heartField = document.getElementById('heart-field');

  const modalTriggers = document.querySelectorAll('[data-modal]');
  const closeModalTargets = document.querySelectorAll('[data-close-modal]');
  const modals = document.querySelectorAll('.modal');

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCloseButton = document.querySelector('.lightbox__close');
  const carouselTrack = document.getElementById('carousel-track');
  const carouselSlides = document.querySelectorAll('.carousel__slide');
  const carouselDots = document.querySelectorAll('.carousel__dot');
  const carouselPrev = document.getElementById('carousel-prev');
  const carouselNext = document.getElementById('carousel-next');

  const ambientToggle = document.getElementById('ambient-toggle');
  const ambientMusic = document.getElementById('ambient-music');

  const memoriesModal = document.getElementById('memories-modal');

  /* -------------------------------------------------
     Opening typing animation for hero text
  ------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function typeText(element) {
    return new Promise((resolve) => {
      if (!element) {
        resolve();
        return;
      }

      const fullText = element.dataset.fullText || element.textContent.trim();
      const speed = Number(element.dataset.typingSpeed) || 40;
      const delay = Number(element.dataset.typingDelay) || 0;
      element.dataset.fullText = fullText;

      if (prefersReducedMotion) {
        element.textContent = fullText;
        element.classList.add('is-typed');
        resolve();
        return;
      }

      element.textContent = '';

      setTimeout(() => {
        let index = 0;
        element.classList.add('is-typing');

        const timer = setInterval(() => {
          index += 1;
          element.textContent = fullText.slice(0, index);

          if (index >= fullText.length) {
            clearInterval(timer);
            element.classList.remove('is-typing');
            element.classList.add('is-typed');
            resolve();
          }
        }, speed);
      }, delay);
    });
  }

  async function runTypingSequence() {
    for (const element of typingElements) {
      await typeText(element);
    }
  }

  runTypingSequence();

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

    heart.style.fontSize = `${size}px`;
    heart.style.left = `${left}%`;
    heart.style.bottom = '-8vh';
    heart.style.animationDuration = `${duration}s`;
    heart.style.animationDelay = `${delay}s`;

    heartField.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, (duration + delay) * 1000);
  }

  // Keep the quantity subtle for elegance and performance.
  setInterval(createHeartParticle, 620);

  /* -------------------------------------------------
     Reveal animations on scroll
  ------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
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

  revealElements.forEach((element) => revealObserver.observe(element));

  /* -------------------------------------------------
     Hero parallax movement
  ------------------------------------------------- */
  window.addEventListener('scroll', () => {
    if (!heroOverlay) return;
    const offset = window.scrollY * 0.16;
    heroSection.style.setProperty('--parallax-y', `${offset}px`);
  });

  /* -------------------------------------------------
     Enter transition: Hero -> Story
  ------------------------------------------------- */
  enterButton.addEventListener('click', () => {
    heroSection.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
    heroSection.style.opacity = '0';
    heroSection.style.transform = 'scale(1.02)';

    setTimeout(() => {
      heroSection.classList.add('hidden');
      storySection.classList.remove('hidden');

      // Ensure smooth movement to story section.
      storySection.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Trigger visibility if user already at top with reduced movement.
      storySection.querySelectorAll('.reveal-on-scroll').forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          element.classList.add('is-visible');
        }
      });
    }, 820);
  });

  /* -------------------------------------------------
     No button dodge logic (3 attempts)
  ------------------------------------------------- */
  let noAttempts = 0;

  function getSafeNoButtonPosition() {
    const containerRect = proposalActions.getBoundingClientRect();
    const buttonWidth = noButton.offsetWidth;
    const buttonHeight = noButton.offsetHeight;

    const maxX = Math.max(0, containerRect.width - buttonWidth);
    const maxY = Math.max(0, containerRect.height - buttonHeight);

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    return {
      x: randomX,
      y: randomY
    };
  }

  function handleNoAttempt(event) {
    event.preventDefault();

    noAttempts += 1;

    if (noAttempts >= 3) {
      noButton.classList.add('hidden');
      destinyNote.classList.remove('hidden');
      return;
    }

    // Move the button gently within proposal container bounds.
    noButton.style.position = 'absolute';
    const nextPosition = getSafeNoButtonPosition();
    noButton.style.left = `${nextPosition.x}px`;
    noButton.style.top = `${nextPosition.y}px`;
    noButton.style.transition = 'left 0.38s ease, top 0.38s ease';
  }

  noButton.addEventListener('click', handleNoAttempt);
  noButton.addEventListener('touchstart', handleNoAttempt, { passive: false });

  /* -------------------------------------------------
     Yes button: success overlay + confetti
  ------------------------------------------------- */
  yesButton.addEventListener('click', () => {
    successOverlay.classList.remove('hidden');
    launchConfettiBurst();
  });

  toGiftsButton.addEventListener('click', () => {
    successOverlay.classList.add('hidden');
    giftsSection.classList.remove('hidden');
    giftsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    giftsSection.querySelectorAll('.reveal-on-scroll').forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        element.classList.add('is-visible');
      }
    });
  });

  function launchConfettiBurst() {
    const context = confettiCanvas.getContext('2d');
    const confettiPieces = [];
    const colors = ['#F8C8DC', '#D4AF37', '#ffe8a6', '#f4afc9'];
    const totalPieces = 180;

    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    for (let i = 0; i < totalPieces; i += 1) {
      confettiPieces.push({
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.42,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocityX: (Math.random() - 0.5) * 9,
        velocityY: -Math.random() * 10 - 3,
        gravity: 0.18 + Math.random() * 0.05,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let frame = 0;
    const maxFrames = 220;

    function renderConfetti() {
      context.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      frame += 1;

      confettiPieces.forEach((piece) => {
        piece.velocityY += piece.gravity;
        piece.x += piece.velocityX;
        piece.y += piece.velocityY;
        piece.rotation += piece.rotationSpeed;
        piece.opacity -= 0.004;

        context.save();
        context.globalAlpha = Math.max(piece.opacity, 0);
        context.translate(piece.x, piece.y);
        context.rotate((piece.rotation * Math.PI) / 180);
        context.fillStyle = piece.color;
        context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 1.35);
        context.restore();
      });

      if (frame < maxFrames) {
        requestAnimationFrame(renderConfetti);
      } else {
        context.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }

    renderConfetti();
  }

  /* -------------------------------------------------
     Modals
  ------------------------------------------------- */
  function openModal(modalId) {
    const targetModal = document.getElementById(modalId);
    if (!targetModal) return;

    targetModal.classList.remove('hidden');
    targetModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalElement) {
    if (!modalElement) return;

    modalElement.classList.add('hidden');
    modalElement.setAttribute('aria-hidden', 'true');

    if (modalElement.id === 'memories-modal') {
      stopCarouselAutoPlay();
    }

    if ([...modals].every((modal) => modal.classList.contains('hidden'))) {
      document.body.style.overflow = '';
    }
  }

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      openModal(trigger.dataset.modal);

      if (trigger.dataset.modal === 'memories-modal') {
        startCarouselAutoPlay();
      }
    });
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(trigger.dataset.modal);

        if (trigger.dataset.modal === 'memories-modal') {
          startCarouselAutoPlay();
        }
      }
    });
  });

  closeModalTargets.forEach((closer) => {
    closer.addEventListener('click', () => closeModal(closer.closest('.modal')));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      modals.forEach((modal) => closeModal(modal));
      closeLightbox();
    }
  });

  /* -------------------------------------------------
     Memories lightbox
  ------------------------------------------------- */
  function openLightbox(source, altText) {
    lightboxImage.src = source;
    lightboxImage.alt = altText;
    lightbox.classList.remove('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
  }

  document.querySelectorAll('.carousel__img').forEach((image) => {
    image.addEventListener('click', () => openLightbox(image.src, image.alt));
  });

  lightboxCloseButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  /* -------------------------------------------------
     Memories carousel (8 images + auto change)
  ------------------------------------------------- */
  let currentSlide = 0;
  let carouselTimer = null;

  function updateCarousel() {
    if (!carouselTrack || carouselSlides.length === 0) return;

    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    carouselSlides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === currentSlide);
    });

    carouselDots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === currentSlide);
    });
  }

  function goToSlide(index) {
    if (carouselSlides.length === 0) return;
    const total = carouselSlides.length;
    currentSlide = (index + total) % total;
    updateCarousel();
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startCarouselAutoPlay() {
    if (carouselSlides.length === 0) return;
    stopCarouselAutoPlay();
    carouselTimer = setInterval(nextSlide, 2600);
  }

  function stopCarouselAutoPlay() {
    if (carouselTimer) {
      clearInterval(carouselTimer);
      carouselTimer = null;
    }
  }

  if (carouselPrev && carouselNext) {
    carouselPrev.addEventListener('click', () => {
      prevSlide();
      startCarouselAutoPlay();
    });

    carouselNext.addEventListener('click', () => {
      nextSlide();
      startCarouselAutoPlay();
    });
  }

  carouselDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      startCarouselAutoPlay();
    });
  });

  if (memoriesModal) {
    memoriesModal.addEventListener('mouseenter', stopCarouselAutoPlay);
    memoriesModal.addEventListener('mouseleave', startCarouselAutoPlay);
  }

  updateCarousel();

  /* -------------------------------------------------
     Ambient background music toggle
  ------------------------------------------------- */
  let isAmbientPlaying = false;

  ambientToggle.addEventListener('click', () => {
    if (!isAmbientPlaying) {
      ambientMusic.muted = false;
      ambientMusic.play().catch(() => {
        // Browser may require another user gesture.
      });
      ambientToggle.classList.add('is-playing');
      ambientToggle.textContent = '♬';
    } else {
      ambientMusic.pause();
      ambientMusic.muted = true;
      ambientToggle.classList.remove('is-playing');
      ambientToggle.textContent = '♫';
    }

    isAmbientPlaying = !isAmbientPlaying;
  });
});
