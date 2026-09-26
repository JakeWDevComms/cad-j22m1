/* Preserve the reader's position when the same page is refreshed after an update. */
(() => {
  const pageKey = `j22_scroll_${location.pathname}${location.search}`;
  const navigation = performance.getEntriesByType?.('navigation')?.[0];
  const isReload = navigation?.type === 'reload';

  let saveTimer;
  const savePosition = () => {
    sessionStorage.setItem(pageKey, String(window.scrollY || window.pageYOffset || 0));
  };

  window.addEventListener('scroll', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(savePosition, 80);
  }, { passive: true });

  window.addEventListener('pagehide', savePosition);
  window.addEventListener('beforeunload', savePosition);

  if (isReload) {
    const saved = Number(sessionStorage.getItem(pageKey));
    if (Number.isFinite(saved) && saved > 0) {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      const restore = () => window.scrollTo({ top: saved, left: 0, behavior: 'auto' });
      requestAnimationFrame(restore);
      window.addEventListener('load', () => {
        restore();
        setTimeout(restore, 120);
      }, { once: true });
    }
  }
})();

const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.main-nav');

if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
    }
  });
}

document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
});

/* Cookie consent
   Optional analytics scripts must use:
   <script type="text/plain" data-cookiecategory="analytics" data-src="..."></script>
   or an inline script with type="text/plain" data-cookiecategory="analytics".
   They are activated only after the user accepts analytics.
*/
(() => {
  const COOKIE_NAME = 'j22_cookie_consent';
  const COOKIE_DAYS = 180;

  const readCookie = name => {
    const prefix = name + '=';
    return document.cookie
      .split(';')
      .map(v => v.trim())
      .find(v => v.startsWith(prefix))
      ?.slice(prefix.length) || '';
  };

  const writeCookie = value => {
    const maxAge = COOKIE_DAYS * 24 * 60 * 60;
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  };

  const activateAnalytics = () => {
    document.querySelectorAll('script[type="text/plain"][data-cookiecategory="analytics"]:not([data-activated])').forEach(source => {
      const script = document.createElement('script');
      for (const attr of source.attributes) {
        if (!['type', 'data-cookiecategory', 'data-src', 'data-activated'].includes(attr.name)) {
          script.setAttribute(attr.name, attr.value);
        }
      }
      if (source.dataset.src) script.src = source.dataset.src;
      if (source.textContent.trim()) script.textContent = source.textContent;
      source.dataset.activated = 'true';
      source.parentNode.insertBefore(script, source.nextSibling);
    });

    window.dispatchEvent(new CustomEvent('cookieconsent:analytics', { detail: { granted: true } }));
  };

  const buildBanner = () => {
    let banner = document.getElementById('cookie-banner');
    if (banner) return banner;

    banner = document.createElement('section');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie choices');
    banner.innerHTML = `
      <div class="cookie-banner-inner">
        <div class="cookie-banner-copy">
          <h2>Cookies on this website</h2>
          <p>We use essential cookies to make the site work and remember your choice. Optional analytics will only load if you accept them. <a href="/cookies">Read our cookie information</a>.</p>
        </div>
        <div class="cookie-banner-actions">
          <button type="button" class="cookie-choice cookie-reject" data-cookie-reject>Reject analytics</button>
          <button type="button" class="cookie-choice cookie-accept" data-cookie-accept>Accept analytics</button>
        </div>
      </div>`;

    document.body.appendChild(banner);

    banner.querySelector('[data-cookie-accept]').addEventListener('click', () => {
      writeCookie('accepted');
      activateAnalytics();
      banner.hidden = true;
    });

    banner.querySelector('[data-cookie-reject]').addEventListener('click', () => {
      writeCookie('rejected');
      banner.hidden = true;
      window.dispatchEvent(new CustomEvent('cookieconsent:analytics', { detail: { granted: false } }));
    });

    return banner;
  };

  const showBanner = () => {
    const banner = buildBanner();
    banner.hidden = false;
  };

  window.openCookieSettings = showBanner;

  document.querySelectorAll('[data-cookie-settings]').forEach(button => {
    button.addEventListener('click', showBanner);
  });

  const choice = decodeURIComponent(readCookie(COOKIE_NAME));
  if (choice === 'accepted') {
    activateAnalytics();
  } else if (choice !== 'rejected') {
    showBanner();
  }
})();