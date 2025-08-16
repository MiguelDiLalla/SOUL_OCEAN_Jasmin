
document.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const scrolled = window.scrollY > 10;
  nav.classList.toggle('is-scrolled', scrolled);
}, { passive: true });
