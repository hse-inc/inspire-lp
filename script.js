(() => {
  const slider = document.getElementById('slider');
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
  window.__go = go;

  let locked = false, acc = 0, accTimer = null;
  const insideScroll = (target, dy) => {
    const pg = target.closest && target.closest('.page--scroll');
    const box = pg && pg.querySelector('.page__inner');
    if (!box) return null;
    const now = performance.now();
    const can = dy > 0 ? box.scrollTop + box.clientHeight < box.scrollHeight - 1 : box.scrollTop > 0;
    if (can) { box.__t = now; return 'scroll'; }
    if (box.__t && now - box.__t < 450) { box.__t = now; return 'hold'; }
    return null;
  };
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return;
    const inside = insideScroll(e.target, e.deltaY);
    if (inside === 'scroll') return;
    e.preventDefault();
    if (inside === 'hold' || locked) return;
    acc += e.deltaY;
    clearTimeout(accTimer);
    accTimer = setTimeout(() => { acc = 0; }, 220);
    if (Math.abs(acc) < 12) return;
    locked = true;
    go(current + (acc > 0 ? 1 : -1));
    acc = 0;
    setTimeout(() => { locked = false; }, 950);
  }, { passive: false });

  let tY = null, tAtEnd = false, tAtTop = false, tBox = null;
  window.addEventListener('touchstart', (e) => {
    const pg = e.target.closest && e.target.closest('.page--scroll');
    tBox = pg && pg.querySelector('.page__inner');
    if (!tBox) { tY = null; return; }
    tY = e.touches[0].clientY;
    tAtEnd = tBox.scrollTop + tBox.clientHeight >= tBox.scrollHeight - 2;
    tAtTop = tBox.scrollTop <= 1;
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (tY === null || !tBox) return;
    const dy = e.changedTouches[0].clientY - tY;
    if (dy < -50 && tAtEnd && tBox.scrollTop + tBox.clientHeight >= tBox.scrollHeight - 2) go(current + 1);
    else if (dy > 50 && tAtTop && tBox.scrollTop <= 1) go(current - 1);
    tY = null;
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if (['ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); go(current + 1); }
    if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(current - 1); }
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
