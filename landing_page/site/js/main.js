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

  // Meta Pixel events for the two things the page exists to get people to
  // do. Measured on the click, by where the link goes, so every Download and
  // Book button counts whichever section it sits in. A Download button on a
  // computer only scrolls to the badges, so it is the badge click that
  // counts there, not the button.
  //
  //   DownloadApp (custom)  store: 'app_store' | 'google_play'
  //   Lead (standard)       a click through to the Calendly booking page
  //
  // Neither is a completed install or booking: those happen in the stores
  // and on Calendly, which the pixel cannot see.
  document.addEventListener('click', function (event) {
    if (typeof window.fbq !== 'function') return;
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var href = link.href;
    var where = link.closest('section');
    var section = where ? where.id : '';
    if (href.indexOf(APP_STORE) === 0 || href.indexOf(GOOGLE_PLAY) === 0) {
      window.fbq('trackCustom', 'DownloadApp', {
        store: href.indexOf(APP_STORE) === 0 ? 'app_store' : 'google_play',
        section: section,
      });
    } else if (href.indexOf('https://calendly.com/') === 0) {
      window.fbq('track', 'Lead', {
        content_name: 'Remote Reiki session',
        section: section,
      });
    }
  });
})();
