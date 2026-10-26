// 柴田健一 ポートフォリオ：動きと操作だけを受け持つ。本文は HTML に書いてあり、ここでは足さない。
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // スクロールで現れる節（1 回だけ）
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce.matches) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // いま読んでいる節をナビに示す
  const navLinks = new Map([...document.querySelectorAll('[data-nav-link]')].map((a) => [a.dataset.navLink, a]));
  if ('IntersectionObserver' in window && navLinks.size) {
    const current = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const a = navLinks.get(e.target.id);
        if (!a) continue;
        if (e.isIntersecting) {
          navLinks.forEach((l) => l.removeAttribute('aria-current'));
          a.setAttribute('aria-current', 'true');
        } else if (a.getAttribute('aria-current')) {
          a.removeAttribute('aria-current');
        }
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('[data-section]').forEach((s) => current.observe(s));
  }

  // モバイルの全画面メニュー
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (toggle && menu) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? toggle.dataset.labelClose : toggle.dataset.labelOpen);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      } else {
        menu.classList.remove('is-open');
        const done = () => { if (!menu.classList.contains('is-open')) menu.hidden = true; };
        reduce.matches ? done() : setTimeout(done, 300);
      }
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
  }

  // 三つの拍：四分音符が 1 拍 1 秒で 1・2・3 拍目へ進み、その拍の番号が灯る。画面外では止める
  const beats = document.querySelector('[data-beats]');
  if (beats && !reduce.matches) {
    const staff = beats.querySelector('.staff');
    const note = beats.querySelector('.staff__note');
    const sig = beats.querySelector('.staff__sig');
    const nums = [...beats.querySelectorAll('.beat__no')];
    let xs = [];
    const place = () => {
      const s = staff.getBoundingClientRect();
      const sigW = sig.getBoundingClientRect().width;
      const stacked = nums.length > 1 && Math.abs(nums[0].getBoundingClientRect().left - nums[1].getBoundingClientRect().left) < 4;
      xs = nums.map((n, i) => stacked
        ? sigW + 32 + ((s.width - sigW - 48) / 3) * i
        : n.getBoundingClientRect().left - s.left + 4);
      note.style.setProperty('--x', `${xs[(Number(beats.dataset.beat) || 1) - 1]}px`);
    };
    // 「拍を鳴らす」：押したときだけ、1 拍目に低音、2・3 拍目に和音を小さく鳴らす（ワルツの「ズン・チャッ・チャッ」）
    const soundBtn = beats.querySelector('[data-sound]');
    const AC = window.AudioContext || window.webkitAudioContext;
    let audio = null;
    let soundOn = false;
    const play = (b) => {
      if (!soundOn || !audio) return;
      const t = audio.currentTime;
      const freqs = b === 1 ? [130.81] : [329.63, 392.0];
      for (const f of freqs) {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'triangle';
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(b === 1 ? 0.22 : 0.08, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + (b === 1 ? 0.9 : 0.45));
        osc.connect(gain).connect(audio.destination);
        osc.start(t);
        osc.stop(t + 1);
      }
    };
    if (soundBtn && AC) {
      soundBtn.hidden = false;
      soundBtn.addEventListener('click', () => {
        audio = audio || new AC();
        if (audio.state === 'suspended') audio.resume();
        soundOn = !soundOn;
        soundBtn.setAttribute('aria-pressed', String(soundOn));
      });
    }

    let beat = 0;
    let timer = null;
    const tick = () => {
      beat = beat % 3 + 1;
      beats.dataset.beat = String(beat);
      note.style.setProperty('--x', `${xs[beat - 1]}px`);
      play(beat);
    };
    const start = () => { if (!timer) { place(); tick(); timer = setInterval(tick, 1000); } };
    const stop = () => { clearInterval(timer); timer = null; };
    window.addEventListener('resize', place, { passive: true });
    document.fonts && document.fonts.ready.then(place);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(beats);
    } else {
      start();
    }
  }

  // 研究室が目指す社会：画面の判定線を越えた文節から順に濃くする（rAF で間引く）
  const tagline = document.querySelector('[data-tagline]');
  if (tagline && !reduce.matches) {
    const words = [...tagline.querySelectorAll('[data-word]')];
    let ticking = false;
    const update = () => {
      ticking = false;
      const line = window.innerHeight * 0.75;
      for (const w of words) w.classList.toggle('is-on', w.getBoundingClientRect().top < line);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { window.addEventListener('scroll', onScroll, { passive: true }); update(); }
        else window.removeEventListener('scroll', onScroll);
      }).observe(tagline);
    } else {
      words.forEach((w) => w.classList.add('is-on'));
    }
  }

})();
