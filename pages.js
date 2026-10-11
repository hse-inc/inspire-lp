(() => {
  document.querySelectorAll('.req').forEach((req) => {
    const tabs = [...req.querySelectorAll('.req__tab')];
    tabs.forEach((b) => b.addEventListener('click', () => {
      req.dataset.tab = b.dataset.t;
      tabs.forEach((x) => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); });
    }));
  });

  const form = document.querySelector('.entry');
  if (!form) return;
  const msg = form.querySelector('.entry__msg');
  form.querySelector('.entry__send').addEventListener('click', () => {
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    if (!name || !email) { msg.textContent = '名前とメールアドレスをご入力ください。'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'メールアドレスの形式をご確認ください。'; return; }
    msg.textContent = 'ありがとうございます。送信機能は公開時に設定します（初稿のため送信されません）。';
  });
})();
