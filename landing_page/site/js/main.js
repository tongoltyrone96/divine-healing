// Divine Awakening landing page.
//
// Every "Download" button means "get the app", and on a phone the only
// useful answer is that phone's own store. Without this script the buttons
// fall back to the section holding both store badges, which is also what a
// desktop visitor gets, since neither store installs onto a computer.

(function () {
  'use strict';

  var APP_STORE = 'https://apps.apple.com/app/divine-awakening/id6806764325';
  var GOOGLE_PLAY = 'https://play.google.com/store/apps/details?id=com.divinehealing.app';

  function platform() {
    var ua = navigator.userAgent || '';
    if (/android/i.test(ua)) return 'android';
    if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
    // iPadOS reports itself as a Mac. A Mac has no touch screen.
    if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return 'ios';
    return 'other';
  }

  var store = { ios: APP_STORE, android: GOOGLE_PLAY }[platform()];
  if (store) {
    var links = document.querySelectorAll('[data-app-link]');
    for (var i = 0; i < links.length; i++) links[i].href = store;
  }

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
