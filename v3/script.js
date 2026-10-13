(() => {
  const slider = document.getElementById('slider');
  const stage = document.querySelector('.stage');
  const column = document.querySelector('.column');
  const pages = [...slider.querySelectorAll('.page')];
  const total = pages.length - 1;
  const pad = (n) => String(n).padStart(2, '0');
  const railNow = document.querySelector('.rail-side__now');
  const railName = document.querySelector('.rail-side__name');
  const next = document.querySelector('.nextbtn');
  const nextName = document.querySelector('.nextbtn__name');

  let current = -1;
  const activate = (index) => {
    if (index === current) return;
    current = index;
    const page = pages[index];
    pages.forEach((p) => p.classList.toggle('is-active', p === page));
    column.dataset.tone = page.dataset.tone;
    column.dataset.page = index === 0 ? 'top' : 'p';
    column.classList.toggle('is-last', index === pages.length - 1);
    stage.dataset.bg = page.dataset.bg || 'intro';
    if (nextName) nextName.textContent = page.dataset.next || '';
    if (railNow) railNow.textContent = pad(index);
    if (railName) railName.textContent = page.dataset.label;
    document.dispatchEvent(new CustomEvent('pagechange', { detail: { index, page, total } }));
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) activate(pages.indexOf(e.target));
    });
  }, { root: slider, threshold: 0.6 });
  pages.forEach((p) => io.observe(p));

  const indexFromScroll = () => {
    if (!slider.clientHeight) return null;
    return Math.max(0, Math.min(pages.length - 1, Math.round(slider.scrollTop / slider.clientHeight)));
  };
  let syncing = false;
  slider.addEventListener('scroll', () => {
    if (syncing) return;
    syncing = true;
    requestAnimationFrame(() => {
      syncing = false;
      const i = indexFromScroll();
      if (i !== null) activate(i);
    });
  }, { passive: true });
  window.addEventListener('load', () => {
    const i = indexFromScroll();
    activate(i === null ? 0 : i);
  });
  activate(0);

  const go = (index) => {
    const i = Math.max(0, Math.min(pages.length - 1, index));
    pages[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  let locked = false, lastWheel = 0, lastDy = 0, fresh = true;
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return;
    if (e.target.closest && e.target.closest('textarea')) return;
    e.preventDefault();
    const now = performance.now();
    const dy = e.deltaY, ad = Math.abs(dy), prev = Math.abs(lastDy);
    if (now - lastWheel > 250) fresh = true;
    else if (ad >= 4 && Math.sign(dy) !== Math.sign(lastDy)) fresh = true;
    else if (ad >= 15 && ad > prev * 1.6 + 4) fresh = true;
    lastWheel = now;
    lastDy = dy;
    if (locked) { fresh = false; return; }
    if (!fresh || ad < 4) return;
    fresh = false;
    locked = true;
    go(current + (dy > 0 ? 1 : -1));
    setTimeout(() => { locked = false; }, 600);
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select, button')) return;
    const down = ['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
    const up = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
    if (!down && !up) return;
    e.preventDefault();
    if (e.repeat) return;
    go(current + (down ? 1 : -1));
  });

  if (next) next.addEventListener('click', (e) => { e.preventDefault(); go(current + 1); });

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    if (a === next) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
