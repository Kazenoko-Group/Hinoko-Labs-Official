(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-button');
  const menu = document.getElementById('mobileMenu');

  const setMenu = (open, restoreFocus = false) => {
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    if (!open && restoreFocus) menuButton.focus();
  };
  menuButton.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !header.contains(event.target)) setMenu(false);
  });
  matchMedia('(min-width: 821px)').addEventListener('change', () => setMenu(false));

  let scheduled = false;
  const updateHeader = () => {
    header.classList.toggle('scrolled', window.scrollY > 4);
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateHeader);
  }, { passive: true });
  updateHeader();

  // The film plays only while visible, and never when reduced motion is requested.
  const film = document.getElementById('heroFilm');
  const toggle = document.getElementById('filmToggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = reduced.matches;
  let inView = false;
  const sync = () => {
    if (!userPaused && inView) film.play().catch(() => {});
    else film.pause();
    toggle.textContent = userPaused ? '再生' : '一時停止';
    toggle.setAttribute('aria-pressed', String(userPaused));
  };
  toggle.hidden = false;
  toggle.addEventListener('click', () => { userPaused = !userPaused; sync(); });
  reduced.addEventListener('change', () => { userPaused = reduced.matches; sync(); });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(film);
})();
