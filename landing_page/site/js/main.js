// Divine Awakening landing page.
//
// Every download control goes straight to a store; nothing scrolls. On a
// phone the "Download" buttons go to that phone's own store. A computer has
// no store of its own, so there the buttons are hidden by CSS and the two
// badges beside them show instead. The platform comes from the os-* class
// the inline script in <head> puts on <html> before the first paint.

(function () {
  'use strict';

  var APP_STORE = 'https://apps.apple.com/app/divine-awakening/id6806764325';
  var GOOGLE_PLAY = 'https://play.google.com/store/apps/details?id=com.divinehealing.app';

  var root = document.documentElement.className;
  var os = /os-ios/.test(root) ? 'ios' : /os-android/.test(root) ? 'android' : 'other';

  var store = { ios: APP_STORE, android: GOOGLE_PLAY }[os];
  if (store) {
    var links = document.querySelectorAll('[data-app-link]');
    for (var i = 0; i < links.length; i++) links[i].href = store;
  }

  // On a phone a store link hands over to the store app and the page stays
  // put. On a computer it would replace the page before the pixel event
  // below is sent, so there it opens in a new tab.
  if (os === 'other') {
    var storeLinks = document.querySelectorAll(
      'a[href^="' + APP_STORE + '"], a[href^="' + GOOGLE_PLAY + '"]');
    for (var j = 0; j < storeLinks.length; j++) {
      storeLinks[j].target = '_blank';
      storeLinks[j].rel = 'noopener';
    }
  }

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  // Meta Pixel events for the two things the page exists to get people to
  // do. Measured on the click, by where the link goes, so every store badge,
  // Download button and Book button counts whichever section it sits in.
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
