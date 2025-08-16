
document.addEventListener('DOMContentLoaded', () => {
  const panel = document.querySelector('#intro .intro-panel');
  if (!panel) return;
  panel.dataset.state = panel.dataset.state || 'collapsed';
  const header = panel.querySelector('.intro-header');
  const body = panel.querySelector('.intro-body');
  const btn = header;
  const bodyId = body.id || 'intro-body';
  body.id = bodyId;
  btn.setAttribute('role', 'button');
  btn.setAttribute('aria-controls', bodyId);
  btn.setAttribute('tabindex', '0');
  btn.setAttribute('aria-expanded', String(panel.dataset.state === 'expanded'));
  const toggle = () => {
    const expanded = panel.dataset.state === 'expanded';
    panel.dataset.state = expanded ? 'collapsed' : 'expanded';
    btn.setAttribute('aria-expanded', String(!expanded));
  };
  header.addEventListener('click', (e) => {
    if (e.target.closest('.cta-link')) return;
    toggle();
  });
  header.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
});
