/* =========================================================
   أحمد وهبة · An Enchanted Evening — interaction engine
   ========================================================= */
(function () {
  'use strict';

  const CONFIG = {
    RSVP_ENDPOINT: 'https://script.google.com/macros/s/AKfycbz8NijSLqsiW-AeZfxlmQhCpyCysh9-btzxD8uxnJ7nVt9mw0flikRmPEas_byC_luC/exec',
    WHATSAPP_AHMAD: '962795183834',
    WHATSAPP_HIBA: '962777632663',
    EVENT_DATE: new Date('2026-07-25T17:00:00+03:00'),
    RSVP_KEY: 'ahmad-hiba-rsvp-2026',
    LANG_KEY: 'ahmad-hiba-lang'
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const isTouch      = ('ontouchstart' in window) || window.matchMedia('(pointer:coarse)').matches;

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp  = (a, b, t) => a + (b - a) * t;

  function hexToRgb(hex) {
    hex = (hex || '#000').trim().replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mixColor(c1, c2, t) {
    const a = hexToRgb(c1), b = hexToRgb(c2);
    return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
  }
  const arabicDigits = s => String(s).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

  /* ---------------- LANGUAGE ---------------- */
  const LANGS = ['ar', 'en', 'both'];
  let curLang = localStorage.getItem(CONFIG.LANG_KEY) || 'ar';
  if (LANGS.indexOf(curLang) === -1) curLang = 'ar';

  function applyLang(l) {
    curLang = l;
    document.body.dataset.lang = l;
    document.documentElement.lang = (l === 'en') ? 'en' : 'ar';
    document.documentElement.dir = (l === 'en') ? 'ltr' : 'rtl';
    $$('.nav__links a').forEach(a => {
      a.textContent = l === 'en' ? a.dataset.en : l === 'ar' ? a.dataset.ar : (a.dataset.ar + ' · ' + a.dataset.en);
    });
    const next = LANGS[(LANGS.indexOf(l) + 1) % LANGS.length];
    const lab = $('#langToggle .pill__txt');
    if (lab) lab.textContent = next === 'ar' ? 'ع' : next === 'en' ? 'EN' : 'ع/EN';
    localStorage.setItem(CONFIG.LANG_KEY, l);
    if (typeof tickCountdown === 'function') tickCountdown();
    setTimeout(() => { measureScenes(); setupTale(); update(); }, 70);
  }
  const langBtn = $('#langToggle');
  if (langBtn) langBtn.addEventListener('click', () => applyLang(LANGS[(LANGS.indexOf(curLang) + 1) % LANGS.length]));

  /* ---------------- MUSIC ---------------- */
  const audio = $('#bgMusic');
  const musicBtn = $('#musicToggle');
  const musicHint = $('#musicHint');
  let musicOn = true;
  const TARGET_VOL = 0.55;

  function fadeTo(target, done) {
    if (!audio) return;
    let v = audio.volume;
    const step = (target > v ? 1 : -1) * 0.05;
    const id = setInterval(() => {
      v = clamp(v + step, 0, TARGET_VOL);
      audio.volume = v;
      if ((step > 0 && v >= target) || (step < 0 && v <= target)) { clearInterval(id); if (done) done(); }
    }, 80);
  }
  function hideHint() { if (musicHint) musicHint.classList.remove('is-visible'); }
  function setMusic(on) {
    musicOn = on;
    if (musicBtn) musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (!audio) return;
    if (on) { audio.play().then(() => { fadeTo(TARGET_VOL); hideHint(); }).catch(() => {}); }
    else { fadeTo(0, () => audio.pause()); }
  }
  if (musicBtn) musicBtn.addEventListener('click', () => setMusic(!musicOn));
  if (musicHint) musicHint.addEventListener('click', () => { if (audio) audio.volume = 0; setMusic(true); });

  function tryAutoplay() {
    if (!audio) return;
    audio.volume = 0;
    audio.play().then(() => {
      musicOn = true;
      if (musicBtn) musicBtn.setAttribute('aria-pressed', 'true');
      fadeTo(TARGET_VOL);
    }).catch(() => {
      if (musicHint) musicHint.classList.add('is-visible');
      const start = () => { if (audio) audio.volume = 0; setMusic(true); hideHint(); clean(); };
      const evs = ['pointerdown', 'touchstart', 'keydown', 'wheel'];
      const clean = () => evs.forEach(e => window.removeEventListener(e, start));
      evs.forEach(e => window.addEventListener(e, start, { once: true, passive: true }));
    });
  }

  /* ---------------- STARFIELD ---------------- */
  const starsCanvas = $('#stars');
  function initStars() {
    if (!starsCanvas) return;
    const ctx = starsCanvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const COLORS = ['255,255,255', '245,201,126', '236,150,200', '170,190,255', '205,175,255'];
    let stars = [];
    function resize() {
      starsCanvas.width = window.innerWidth * dpr;
      starsCanvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(170, Math.floor(window.innerWidth * window.innerHeight / 8500));
      stars = [];
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random(), y: Math.random() * 0.94,
          r: Math.random() * 1.4 + 0.3,
          c: COLORS[(Math.random() * COLORS.length) | 0],
          tw: Math.random() * Math.PI * 2,
          sp: Math.random() * 0.0016 + 0.0005
        });
      }
    }
    function draw(time) {
      const W = window.innerWidth, H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const a = reduceMotion ? 0.85 : (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * s.sp + s.tw)));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + s.c + ',' + a + ')';
        ctx.shadowBlur = 5; ctx.shadowColor = 'rgba(' + s.c + ',' + a + ')';
        ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener('resize', resize);
    if (reduceMotion) draw(0); else requestAnimationFrame(draw);
  }

  /* ---------------- PETALS ---------------- */
  function initPetals() {
    const box = $('#petals');
    if (!box || reduceMotion) return;
    const grads = [
      'radial-gradient(ellipse at 50% 0%, rgba(246,198,221,.9), rgba(217,106,168,.4) 60%, transparent)',
      'radial-gradient(ellipse at 50% 0%, rgba(214,196,248,.85), rgba(150,110,220,.35) 60%, transparent)',
      'radial-gradient(ellipse at 50% 0%, rgba(190,215,255,.8), rgba(110,160,255,.3) 60%, transparent)',
      'radial-gradient(ellipse at 50% 0%, rgba(248,214,158,.85), rgba(224,168,94,.35) 60%, transparent)'
    ];
    for (let i = 0; i < 26; i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.background = grads[i % grads.length];
      const dur = Math.random() * 11 + 11;
      p.style.animationDuration = dur + 's';
      p.style.animationDelay = (-Math.random() * dur) + 's';
      const sc = Math.random() * 0.7 + 0.55;
      p.style.width = (14 * sc) + 'px';
      p.style.height = (18 * sc) + 'px';
      p.style.setProperty('--dx', (Math.random() * 170 - 85) + 'px');
      box.appendChild(p);
    }
  }

  /* ---------------- REVEALS ---------------- */
  function initReveals() {
    const els = $$('[data-rise]');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          const d = parseInt(el.dataset.riseD || '0', 10);
          setTimeout(() => el.classList.add('in'), d * 95);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ---------------- COUNTDOWN ---------------- */
  let tickCountdown = function () {
    const diff = Math.max(0, CONFIG.EVENT_DATE - new Date());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000) % 24;
    const m = Math.floor(diff / 60000) % 60;
    const s = Math.floor(diff / 1000) % 60;
    const loc = (curLang === 'en') ? (x => x) : arabicDigits;
    const set = (id, val, pad) => {
      const el = document.getElementById(id);
      if (el) el.textContent = loc(String(val).padStart(pad, '0'));
    };
    set('cd-days', d, 1); set('cd-hours', h, 2); set('cd-minutes', m, 2); set('cd-seconds', s, 2);
  };

  /* ---------------- LIGHTBOX ---------------- */
  function initLightbox() {
    const lb = $('#lightbox'), img = $('#lightboxImg'), x = $('#lightboxClose');
    if (!lb) return;
    const open = src => { img.src = src; lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); };
    const close = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); };
    $$('[data-lightbox]').forEach(b => b.addEventListener('click', () => open(b.dataset.lightbox)));
    if (x) x.addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---------------- WHATSAPP ---------------- */
  function initWhatsApp() {
    const msg = encodeURIComponent('السلام عليكم 🌸 بخصوص دعوة خطوبة أحمد وهبة بتاريخ ٢٥ تموز ٢٠٢٦ في قصر خلدا');
    const a = $('#whatsappAhmad'), h = $('#whatsappHiba');
    if (a) a.href = `https://wa.me/${CONFIG.WHATSAPP_AHMAD}?text=${msg}`;
    if (h) h.href = `https://wa.me/${CONFIG.WHATSAPP_HIBA}?text=${msg}`;
  }

  /* ---------------- RSVP ---------------- */
  function initRSVP() {
    const form = $('#rsvpForm'), success = $('#rsvpSuccess');
    if (!form) return;
    const showSuccess = () => {
      form.classList.add('is-hidden');
      success.classList.add('is-visible');
      success.setAttribute('aria-hidden', 'false');
    };
    if (localStorage.getItem(CONFIG.RSVP_KEY)) showSuccess();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('#rsvpName').value.trim();
      const phone = $('#rsvpPhone').value.trim();
      if (!name || !phone) {
        [$('#rsvpName'), $('#rsvpPhone')].forEach(inp => {
          if (!inp.value.trim()) {
            inp.style.borderColor = '#e85fa0';
            inp.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 280 });
          }
        });
        return;
      }
      const btn = $('#rsvpSubmit');
      btn.disabled = true;
      const checked = form.querySelector('input[name="attending"]:checked');
      const body = new URLSearchParams();
      body.append('name', name);
      body.append('phone', phone);
      body.append('guests', $('#rsvpGuests').value || '1');
      body.append('attending', checked ? checked.value : 'yes');
      body.append('timestamp', new Date().toISOString());
      try {
        await fetch(CONFIG.RSVP_ENDPOINT, { method: 'POST', mode: 'no-cors', body });
      } catch (err) { /* no-cors: response opaque, assume delivered */ }
      try { localStorage.setItem(CONFIG.RSVP_KEY, JSON.stringify({ name, when: Date.now() })); } catch (e) {}
      showSuccess();
    });
  }

  /* ---------------- STORY VIDEO ---------------- */
  function initVideo() {
    const v = document.getElementById('storyVideo');
    if (!v) return;
    v.muted = true;
    const tryPlay = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    tryPlay();
    // retry on first interaction in case autoplay was blocked
    const once = () => { tryPlay(); window.removeEventListener('pointerdown', once); window.removeEventListener('touchstart', once); };
    window.addEventListener('pointerdown', once, { once: true, passive: true });
    window.addEventListener('touchstart', once, { once: true, passive: true });
    // play when it scrolls into view
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) tryPlay(); }), { threshold: 0.25 }).observe(v);
    }
  }

  /* ---------------- SMOOTH ANCHORS ---------------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (!id || id.length < 2) return;
        const t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        const y = t.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------------- MAGNETIC BUTTONS ---------------- */
  function initMagnetic() {
    if (!finePointer || reduceMotion) return;
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${mx * 0.22}px, ${my * 0.3}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------- CURSOR GLOW ---------------- */
  function initCursor() {
    if (!finePointer || reduceMotion) return;
    const cg = $('#cursorGlow');
    if (!cg) return;
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy;
    window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cg.style.opacity = '1'; }, { passive: true });
    document.addEventListener('mouseleave', () => { cg.style.opacity = '0'; });
    (function loop() {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      cg.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- MARQUEE ---------------- */
  function initMarquee() {
    const track = $('#marqueeTrack');
    if (!track || reduceMotion) return;
    track.innerHTML += track.innerHTML;
    let x = 0;
    const speed = 0.4;
    (function m() {
      x -= speed;
      const half = track.scrollWidth / 2;
      if (half > 0 && -x >= half) x = 0;
      track.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(m);
    })();
  }

  /* ---------------- TALE (horizontal reel) ---------------- */
  const taleSection = $('.tale');
  const taleScroller = $('#taleScroller');
  const taleTrack = $('#taleTrack');
  const taleEnabled = !isTouch && !reduceMotion;
  let panDistance = 0;

  function setupTale() {
    if (!taleScroller || !taleTrack || !taleSection) return;
    if (!taleEnabled) {
      taleSection.classList.add('tale--native');
      taleScroller.style.height = '';
      taleTrack.style.transform = '';
      panDistance = 0;
      return;
    }
    taleSection.classList.remove('tale--native');
    const trackWidth = taleTrack.scrollWidth;
    panDistance = Math.max(0, trackWidth - window.innerWidth);
    taleScroller.style.height = (panDistance + window.innerHeight) + 'px';
  }

  /* ---------------- SCROLL ENGINE ---------------- */
  const skyEl = $('#sky');
  const orbEl = $('#orb');
  const progressEl = $('#progress');
  const navEl = $('#nav');
  const parallaxEls = $$('[data-parallax]');
  const sceneEls = $$('[data-sky]');
  let scenes = [];

  function measureScenes() {
    scenes = sceneEls.map(el => ({
      el,
      top: el.getBoundingClientRect().top + window.scrollY,
      height: el.offsetHeight,
      skyTop: el.dataset.skyTop || '#ffd7a4',
      skyBot: el.dataset.skyBot || '#f3b9c2',
      dark: el.dataset.dark === 'true',
      stars: parseFloat(el.dataset.stars || '0'),
      orb: parseFloat(el.dataset.orb || '0.5')
    }));
    scenes.sort((a, b) => a.top - b.top);
  }

  function setOrb(warmth, op) {
    if (!orbEl) return;
    // warmth: 1 = golden sun, 0 = silver moon
    const core = mixColor('#cfe2ff', '#f8d49a', warmth);
    const glow = warmth > 0.5
      ? `rgba(245,201,126,${(0.22 + 0.28 * warmth).toFixed(3)})`
      : `rgba(190,205,255,${(0.3 + 0.1 * (1 - warmth)).toFixed(3)})`;
    orbEl.style.setProperty('--orb-c', core);
    orbEl.style.setProperty('--orb-glow', glow);
    const xPct = lerp(12, 88, op);
    const yPct = lerp(20, 7, Math.sin(op * Math.PI)); // rises to top mid-journey
    orbEl.style.left = xPct + '%';
    orbEl.style.top = yPct + '%';
  }

  function update() {
    if (!scenes.length) return;
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight;
    const center = scrollY + vh * 0.5;

    let idx = 0;
    for (let i = 0; i < scenes.length; i++) if (center >= scenes[i].top) idx = i;
    const cur = scenes[idx];
    const nxt = scenes[Math.min(idx + 1, scenes.length - 1)];
    let t = 0;
    if (nxt !== cur && nxt.top !== cur.top) t = clamp((center - cur.top) / (nxt.top - cur.top), 0, 1);

    if (skyEl) {
      skyEl.style.setProperty('--sky-top', mixColor(cur.skyTop, nxt.skyTop, t));
      skyEl.style.setProperty('--sky-bot', mixColor(cur.skyBot, nxt.skyBot, t));
    }
    if (starsCanvas) starsCanvas.style.opacity = lerp(cur.stars, nxt.stars, t).toFixed(3);

    const op = clamp(scrollY / Math.max(1, docH - vh), 0, 1);
    setOrb(lerp(cur.orb, nxt.orb, t), op);

    document.body.classList.toggle('is-dark', (t < 0.5 ? cur.dark : nxt.dark));

    if (progressEl) progressEl.style.width = (op * 100) + '%';
    if (navEl) navEl.classList.toggle('is-scrolled', scrollY > 40);

    if (!reduceMotion && scrollY < vh * 1.4) {
      parallaxEls.forEach(el => {
        const sp = parseFloat(el.dataset.parallax) || 0;
        el.style.transform = `translateY(${scrollY * sp}px)`;
      });
    }

    if (taleEnabled && panDistance > 0 && taleScroller) {
      const scrollerTop = taleScroller.getBoundingClientRect().top + window.scrollY;
      const within = clamp(window.scrollY - scrollerTop, 0, panDistance);
      const rtl = document.documentElement.getAttribute('dir') === 'rtl';
      taleTrack.style.transform = `translateX(${rtl ? within : -within}px)`;
    }
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }
  }

  /* ---------------- BOOT ---------------- */
  function boot() {
    applyLang(curLang);
    initStars();
    initPetals();
    initReveals();
    initLightbox();
    initWhatsApp();
    initRSVP();
    initVideo();
    initAnchors();
    initMagnetic();
    initCursor();
    initMarquee();

    tickCountdown();
    setInterval(tickCountdown, 1000);

    measureScenes();
    setupTale();
    update();

    window.addEventListener('scroll', onScroll, { passive: true });
    let rT;
    window.addEventListener('resize', () => {
      clearTimeout(rT);
      rT = setTimeout(() => { measureScenes(); setupTale(); update(); }, 150);
    });

    // re-measure once fonts/images settle
    setTimeout(() => { measureScenes(); setupTale(); update(); }, 600);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { measureScenes(); setupTale(); update(); });
    }
  }

  window.addEventListener('load', () => {
    const loader = $('#loader');
    if (loader) {
      setTimeout(() => loader.classList.add('is-done'), 600);
      setTimeout(() => { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 1600);
    }
    boot();
    tryAutoplay();
  });
})();
