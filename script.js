/* =========================================================
   جاهة وخطبة أحمد وهبة · Ahmad & Hiba Engagement
   Behavior v3 — bright romance · warm petals & sparkles
   ========================================================= */

(function () {
  'use strict';

  /* ============================================================
     CONFIG
     ============================================================ */
  const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz8NijSLqsiW-AeZfxlmQhCpyCysh9-btzxD8uxnJ7nVt9mw0flikRmPEas_byC_luC/exec';
  const WHATSAPP_AHMAD = '962795183834';
  const WHATSAPP_HIBA  = '962777632663';
  const EVENT_DATE = new Date('2026-07-25T17:00:00+03:00');
  const RSVP_STORAGE_KEY = 'ahmad-hiba-rsvp-2026';
  const LANG_STORAGE_KEY = 'ahmad-hiba-lang';

  /* ============================================================
     LOADER
     ============================================================ */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) loader.classList.add('is-done');
      initParticles();
      initPetals();
    }, 900);
  });

  /* ============================================================
     NAV scroll state
     ============================================================ */
  const nav = document.getElementById('nav');
  const updateNav = () => {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
          setTimeout(() => el.classList.add('is-in'), delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ============================================================
     COUNTDOWN
     ============================================================ */
  const cdDays    = document.getElementById('cd-days');
  const cdHours   = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');
  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

  function tickCountdown() {
    const diff = EVENT_DATE.getTime() - Date.now();
    if (diff <= 0) {
      [cdDays, cdHours, cdMinutes, cdSeconds].forEach((el) => { if (el) el.textContent = '00'; });
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (cdDays)    cdDays.textContent    = pad(d);
    if (cdHours)   cdHours.textContent   = pad(h);
    if (cdMinutes) cdMinutes.textContent = pad(m);
    if (cdSeconds) cdSeconds.textContent = pad(s);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ============================================================
     LANGUAGE TOGGLE — default Arabic
     ============================================================ */
  const langBtn = document.getElementById('langToggle');
  const langTxt = langBtn ? langBtn.querySelector('.lang-btn__txt') : null;
  const navLinks = document.querySelectorAll('.nav__links a');

  let lang = 'ar';
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && ['ar', 'en', 'both'].includes(saved)) lang = saved;
  } catch (e) { /* ignore */ }

  function applyLang(state) {
    document.body.setAttribute('data-lang', state);
    document.documentElement.setAttribute('dir', state === 'en' ? 'ltr' : 'rtl');
    document.documentElement.setAttribute('lang', state === 'en' ? 'en' : 'ar');

    navLinks.forEach((a) => {
      const ar = a.getAttribute('data-ar');
      const en = a.getAttribute('data-en');
      if (state === 'en') a.textContent = en || a.textContent;
      else if (state === 'ar') a.textContent = ar || a.textContent;
      else a.textContent = (ar || '') + ' · ' + (en || '');
    });

    if (langTxt) {
      if (state === 'ar') langTxt.textContent = 'EN';
      else if (state === 'en') langTxt.textContent = 'AR/EN';
      else langTxt.textContent = 'AR';
    }

    try { localStorage.setItem(LANG_STORAGE_KEY, state); } catch (e) { /* ignore */ }
  }

  applyLang(lang);

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      lang = lang === 'ar' ? 'en' : lang === 'en' ? 'both' : 'ar';
      applyLang(lang);
    });
  }

  /* ============================================================
     MUSIC — autoplay + first-interaction fallback
     ============================================================ */
  const musicBtn = document.getElementById('musicToggle');
  const musicHint = document.getElementById('musicHint');
  const audio = document.getElementById('bgMusic');
  let musicArmed = false;

  function showHint() {
    if (musicHint && !musicArmed) musicHint.classList.add('is-visible');
  }
  function hideHint() {
    if (musicHint) musicHint.classList.remove('is-visible');
  }
  function setMusicState(on) {
    if (musicBtn) musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function tryPlay() {
    if (!audio) return Promise.reject();
    audio.volume = 0.45;
    const p = audio.play();
    if (p && typeof p.then === 'function') return p;
    return Promise.resolve();
  }
  function armMusic() {
    if (musicArmed) return;
    tryPlay().then(() => {
      musicArmed = true;
      setMusicState(true);
      hideHint();
    }).catch(() => { /* still need interaction */ });
  }

  setMusicState(true);

  if (audio) {
    audio.addEventListener('error', () => {
      console.info('Background audio not available.');
      setMusicState(false);
      hideHint();
    }, { once: true });

    tryPlay().then(() => {
      musicArmed = true;
      setMusicState(true);
      hideHint();
    }).catch(() => {
      setMusicState(false);
      setTimeout(showHint, 1500);

      const events = ['click', 'touchstart', 'keydown', 'scroll', 'wheel'];
      const onInteract = () => {
        armMusic();
        events.forEach((ev) => document.removeEventListener(ev, onInteract));
      };
      events.forEach((ev) => document.addEventListener(ev, onInteract, { passive: true }));
    });
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!audio) return;
      hideHint();
      if (audio.paused) {
        tryPlay().then(() => {
          musicArmed = true;
          setMusicState(true);
        }).catch(() => setMusicState(false));
      } else {
        audio.pause();
        setMusicState(false);
      }
    });
  }

  if (musicHint) {
    musicHint.addEventListener('click', () => {
      armMusic();
      hideHint();
    });
  }

  /* ============================================================
     PARTICLES — warm rose & gold sparkles
     ============================================================ */
  function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w = 0, h = 0;
    const count = window.innerWidth < 600 ? 30 : 55;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Warm sparkle palette: rose, blush, gold
    const palette = [
      { core: '255, 235, 225', glow: '244, 208, 196' }, // blush
      { core: '255, 220, 200', glow: '232, 167, 150' }, // rose-soft
      { core: '255, 240, 200', glow: '201, 169, 97' }   // gold
    ];

    for (let i = 0; i < count; i++) {
      const tone = palette[Math.floor(Math.random() * palette.length)];
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.4,
        vy: -(Math.random() * 0.25 + 0.04),
        vx: (Math.random() - 0.5) * 0.1,
        opacity: Math.random() * 0.4 + 0.2,
        flicker: Math.random() * 0.02 + 0.005,
        tone
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += (Math.random() - 0.5) * p.flicker;
        if (p.opacity < 0.12) p.opacity = 0.12;
        if (p.opacity > 0.7) p.opacity = 0.7;

        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        grd.addColorStop(0, `rgba(${p.tone.core}, ${p.opacity})`);
        grd.addColorStop(0.4, `rgba(${p.tone.glow}, ${p.opacity * 0.5})`);
        grd.addColorStop(1, `rgba(${p.tone.glow}, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${p.tone.core}, ${p.opacity * 0.9})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ============================================================
     PETALS — soft blush + sage drifting petals
     ============================================================ */
  function initPetals() {
    const layer = document.getElementById('petals');
    if (!layer) return;
    const count = window.innerWidth < 600 ? 16 : 28;
    // Warm petal palette
    const palette = [
      'radial-gradient(ellipse at 50% 0%, rgba(244, 208, 196, 0.85), rgba(232, 167, 150, 0.4) 60%, transparent)',  // blush
      'radial-gradient(ellipse at 50% 0%, rgba(255, 220, 210, 0.85), rgba(201, 123, 99, 0.35) 60%, transparent)',  // rose
      'radial-gradient(ellipse at 50% 0%, rgba(214, 223, 201, 0.75), rgba(168, 184, 154, 0.35) 60%, transparent)', // sage
      'radial-gradient(ellipse at 50% 0%, rgba(236, 217, 165, 0.8),  rgba(201, 169, 97, 0.35) 60%, transparent)'   // gold
    ];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      const left = Math.random() * 100;
      const dur = 20 + Math.random() * 20;
      const delay = -Math.random() * dur;
      const drift = (Math.random() - 0.5) * 240;
      const scale = 0.7 + Math.random() * 0.8;
      const bg = palette[Math.floor(Math.random() * palette.length)];
      p.style.left = left + '%';
      p.style.animationDuration = dur + 's';
      p.style.animationDelay = delay + 's';
      p.style.setProperty('--drift', drift + 'px');
      p.style.transform = 'scale(' + scale + ')';
      p.style.background = bg;
      layer.appendChild(p);
    }
  }

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('[data-lightbox]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const src = trigger.getAttribute('data-lightbox');
      if (src && lightbox && lightboxImg) {
        lightboxImg.src = src;
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
      }
    });
  });

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
    }
  }
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* ============================================================
     WHATSAPP LINKS
     ============================================================ */
  const msg = encodeURIComponent('السلام عليكم، بخصوص دعوة خطبة أحمد وهبة 💍');
  const waAhmad = document.getElementById('whatsappAhmad');
  const waHiba  = document.getElementById('whatsappHiba');
  if (waAhmad && WHATSAPP_AHMAD) waAhmad.href = `https://wa.me/${WHATSAPP_AHMAD}?text=${msg}`;
  if (waHiba  && WHATSAPP_HIBA)  waHiba.href  = `https://wa.me/${WHATSAPP_HIBA}?text=${msg}`;

  /* ============================================================
     RSVP FORM
     ============================================================ */
  const form = document.getElementById('rsvpForm');
  const successBox = document.getElementById('rsvpSuccess');

  function hasAlreadySubmitted() {
    try { return !!localStorage.getItem(RSVP_STORAGE_KEY); }
    catch (e) { return false; }
  }
  function markSubmitted(payload) {
    try { localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(payload)); }
    catch (e) { /* ignore */ }
  }
  function showSuccess() {
    if (form) form.classList.add('is-hidden');
    if (successBox) {
      successBox.classList.add('is-visible');
      successBox.setAttribute('aria-hidden', 'false');
      setTimeout(() => successBox.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }

  async function postRSVP(data) {
    if (!RSVP_ENDPOINT) return { ok: true, local: true };
    try {
      await fetch(RSVP_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      });
      return { ok: true };
    } catch (err) {
      console.warn('RSVP submission failed:', err);
      return { ok: false, error: err };
    }
  }

  if (hasAlreadySubmitted() && form && successBox) {
    form.classList.add('is-hidden');
    successBox.classList.add('is-visible');
    successBox.setAttribute('aria-hidden', 'false');
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('rsvpSubmit');
      const name    = form.elements['name'].value.trim();
      const phone   = form.elements['phone'].value.trim();
      const guests  = form.elements['guests'].value.trim();
      const attendingNode = form.querySelector('input[name="attending"]:checked');
      const attending = attendingNode ? attendingNode.value : '';

      if (!name || !phone || !guests || !attending) {
        alert('الرجاء تعبئة جميع الحقول · Please fill all fields');
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      const payload = {
        timestamp: new Date().toISOString(),
        name, phone, guests, attending
      };

      await postRSVP(payload);
      markSubmitted(payload);
      showSuccess();

      if (submitBtn) submitBtn.disabled = false;
    });
  }

  /* ============================================================
     SMOOTH SCROLL
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============================================================
     PARALLAX — subtle background drift on hero
     ============================================================ */
  const heroBg = document.querySelector('.hero__bg');
  let ticking = false;
  function onScrollParallax() {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (heroBg) {
          const rect = heroBg.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            const offset = (rect.top * 0.25 * -1).toFixed(1);
            heroBg.style.transform = `scale(1.08) translate3d(0, ${offset}px, 0)`;
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', onScrollParallax, { passive: true });
    onScrollParallax();
  }

})();
