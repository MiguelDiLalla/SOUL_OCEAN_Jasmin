/**
 * Implements the animated quote typing effect in the promise section.
 * Restarts the animation whenever the language changes.
 */
(function() {
  let typing = false;
  let lastTypedLang = null;

  function typeQuote() {
    const section = document.getElementById('promise');
    if (!section) return;
    const quoteEl = section.querySelector('.quote');
    if (!quoteEl) return;

    const currentLang = document.documentElement.lang || 'es';
    if (typing && lastTypedLang === currentLang) return;

    const fullText = (quoteEl.getAttribute('data-i18n') ? quoteEl.textContent : quoteEl.textContent) || "";
    if (!fullText.trim()) return;

    quoteEl.innerHTML = '<span class="typewriter"></span>';
    const span = quoteEl.querySelector('.typewriter');
    typing = true;
    lastTypedLang = currentLang;

    const base = 18;
    const speed = Math.max(10, base - Math.min(6, Math.floor(fullText.length / 120)));
    let i = 0;

    function step() {
      if (i <= fullText.length) {
        span.textContent = fullText.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else {
        typing = false;
      }
    }
    step();
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(typeQuote, 200);
  });

  const w = window;
  const originalSwitch = w.switchLanguage;
  if (typeof originalSwitch === 'function') {
    w.switchLanguage = function(lang) {
      const result = originalSwitch.call(this, lang);
      setTimeout(typeQuote, 50);
      return result;
    };
  }
})();
