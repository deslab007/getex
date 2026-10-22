/* Getex — phone menu
 *
 * Below 768px the header links are hidden, so this adds a menu button that
 * opens them as a full-width panel under the header. Services gets its own
 * expand button so the Services link itself still goes to the Services page.
 * Desktop is untouched (the buttons are hidden by CSS above 768px).
 */
(function () {
  'use strict';
  var nav = document.querySelector('body > nav');
  var menu = nav && nav.querySelector('ul');
  if (!menu) return;
  menu.id = menu.id || 'site-menu';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-menu-btn';
  btn.setAttribute('aria-controls', menu.id);
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Open menu');
  btn.innerHTML = '<span></span><span></span><span></span>';
  var search = nav.querySelector('.nav-search-btn');
  nav.insertBefore(btn, search ? search.nextSibling : nav.querySelector('.nav-cta'));

  var services = menu.querySelector('.nav-services');
  var sub = services && services.querySelector('.dropdown');
  if (sub) {
    sub.id = sub.id || 'services-submenu';
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-sub-toggle';
    toggle.setAttribute('aria-controls', sub.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Show services');
    toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
    services.insertBefore(toggle, sub);
    toggle.addEventListener('click', function () {
      var open = services.classList.toggle('sub-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Hide services' : 'Show services');
    });
  }

  function setOpen(open) {
    nav.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  // On the smallest phones the header CTA moves into the menu
  var cta = nav.querySelector('.nav-cta');
  if (cta) {
    var li = document.createElement('li');
    li.className = 'nav-menu-cta';
    var copy = cta.cloneNode(true);
    li.appendChild(copy);
    menu.appendChild(li);
  }

  btn.addEventListener('click', function () { setOpen(!nav.classList.contains('menu-open')); });
  // following a link (including a #section on the same page) closes the menu
  menu.addEventListener('click', function (ev) { if (ev.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && nav.classList.contains('menu-open')) { setOpen(false); btn.focus(); }
  });
  document.addEventListener('click', function (ev) {
    if (nav.classList.contains('menu-open') && !nav.contains(ev.target)) setOpen(false);
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 768) setOpen(false); });
})();
