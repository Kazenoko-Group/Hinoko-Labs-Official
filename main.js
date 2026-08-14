/* Hinoko Labs — main.js */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  function playVideos(scope) {
    (scope || document).querySelectorAll("video").forEach(function (video) {
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* poster remains */ });
    });
  }

  /* Wrap manifesto lines in an inner span so they can slide up from a mask. */
  function wrapManifestoLines() {
    document.querySelectorAll(".manifesto .reveal-line").forEach(function (line, i) {
      if (line.querySelector(".rl-inner")) return;
      var inner = document.createElement("span");
      inner.className = "rl-inner";
      inner.style.setProperty("--rl-delay", (i * 0.14) + "s");
      while (line.firstChild) inner.appendChild(line.firstChild);
      line.appendChild(inner);
    });
  }

  wrapManifestoLines();

  /* ---------- Header state on scroll ---------- */
  var header = document.getElementById("siteHeader");
  var ticking = false;

  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn && mobileMenu) {
    function closeMenu() {
      mobileMenu.setAttribute("hidden", "");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    menuBtn.addEventListener("click", function () {
      var open = mobileMenu.hasAttribute("hidden");
      if (open) {
        mobileMenu.removeAttribute("hidden");
        menuBtn.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
      } else {
        closeMenu();
      }
    });
    mobileMenu.addEventListener("click", function (ev) {
      if (ev.target.closest("a")) closeMenu();
    });
  }

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Staggered reveal on scroll ---------- */
  /* Siblings that reveal together cascade with a small delay. */
  var parentMap = new Map();
  document.querySelectorAll(".reveal").forEach(function (el) {
    var p = el.parentElement;
    if (!parentMap.has(p)) parentMap.set(p, 0);
    var idx = parentMap.get(p);
    el.style.setProperty("--reveal-delay", (idx * 0.1) + "s");
    parentMap.set(p, idx + 1);
  });

  var revealEls = document.querySelectorAll(".reveal, .manifesto");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Keep videos playing ---------- */
  playVideos();
})();
