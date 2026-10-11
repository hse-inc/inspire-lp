(() => {
  const STEPS = 12;
  const RISE = [0, 0.06, 0.13, 0.16, 0.27, 0.31, 0.43, 0.48, 0.6, 0.67, 0.79, 0.86, 1];
  const lane = document.querySelector('.lane');
  const svg = lane.querySelector('.lane__svg');
  const track = lane.querySelector('.lane__track');
  const line = lane.querySelector('.lane__line');
  const head = lane.querySelector('.lane__head');
  const now = lane.querySelector('.lane__now');
  const pad = (n) => String(n).padStart(2, '0');
  head.querySelector('path').setAttribute('d', 'M-8 -6L0 0L-8 6');

  let pts = [], lens = [], total = 0, step = 1;
  const build = () => {
    const w = lane.clientWidth, h = lane.clientHeight;
    const x0 = 23, x1 = w - 30, yb = h - 7, yt = 9;
    pts = RISE.map((r, i) => [x0 + (x1 - x0) * i / STEPS, yb - (yb - yt) * r]);
    const d = 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join('L');
    track.setAttribute('d', d);
    line.setAttribute('d', d);
    lens = [0]; total = 0;
    for (let i = 1; i < pts.length; i++) { total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(total); }
    line.style.strokeDasharray = `${total} ${total}`;
    draw(step, true);
  };
  const draw = (k, instant) => {
    step = Math.max(1, Math.min(STEPS, k));
    if (instant) { line.style.transition = 'none'; head.style.transition = 'none'; }
    line.style.strokeDashoffset = String(total - lens[step]);
    const [x, y] = pts[step], [px, py] = pts[step - 1];
    head.style.transform = `translate(${x}px, ${y}px) rotate(${Math.atan2(y - py, x - px)}rad)`;
    now.textContent = pad(step);
    if (instant) requestAnimationFrame(() => { line.style.transition = ''; head.style.transition = ''; });
  };
  window.addEventListener('resize', build);

  let timers = [];
  const play = (page) => {
    timers.forEach(clearTimeout); timers = [];
    let t = 250;
    const items = [...page.querySelectorAll('.rv')];
    const at = new Map();
    items.forEach((el) => {
      const parent = el.parentElement.closest('.rv');
      if (parent && at.has(parent)) {
        at.set(el, at.get(parent) + 520);
      } else {
        at.set(el, t);
        t += el.classList.contains('ln') ? 120 : 170;
      }
    });
    items.forEach((el) => timers.push(setTimeout(() => el.classList.add('is-on'), at.get(el))));
  };
  const reset = (except) => {
    document.querySelectorAll('.page').forEach((p) => {
      if (p !== except) p.querySelectorAll('.rv.is-on').forEach((el) => el.classList.remove('is-on'));
    });
  };

  let resetTimer = null;
  const onChange = ({ index, page }) => {
    if (index > 0) draw(index);
    play(page);
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => reset(page), 700);
  };
  document.addEventListener('pagechange', (e) => onChange(e.detail));

  build();
  const active = document.querySelector('.page.is-active');
  if (active) onChange({ index: [...document.querySelectorAll('.page')].indexOf(active), page: active });
})();

(() => {
  const num = document.querySelector('.fv__num');
  if (!num) return;
  let timer = null;
  document.addEventListener('pagechange', (e) => {
    clearInterval(timer);
    num.textContent = '0';
    if (e.detail.page.id !== 'p1') return;
    const t0 = performance.now() + 700;
    timer = setInterval(() => {
      const k = Math.max(0, Math.min(1, (performance.now() - t0) / 1600));
      num.textContent = String(Math.round(100 * (1 - Math.pow(1 - k, 3))));
      if (k >= 1) clearInterval(timer);
    }, 40);
  });
})();
