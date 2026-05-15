/* ─────────────────────────────────────────────────────────────
   nav.js — Encore Portal shared navigation
   Drop one tag into any page just before </body>:
     <script src="/nav.js" defer></script>
   The script injects:
     - A hamburger button into the existing topbar (top-right)
     - A slide-in nav panel + backdrop
   To update the menu site-wide, edit the MENU array below.
   ───────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // ═══ MENU STRUCTURE ═══════════════════════════════════════════
  // Edit this to change the menu on every page at once.
  const MENU = [
    {
      label: 'Main',
      items: [
        { label: 'Home',          href: '/home.html',      size: 'large' },
        { label: 'Team Roster',   href: '/dashboard.html', size: 'large' },
      ],
    },
    {
      label: 'In Production',
      items: [
        { label: 'The Lion King', href: '/show.html?slug=lion-king-fall-2026', meta: 'Fall 2026' },
      ],
    },
    {
      label: 'Resources',
      items: [
        { label: 'Director Handbook',       href: '#' },
        { label: 'Child Safety Training',   href: '/child-safety-training.html' },
        { label: 'S.T.A.G.E. Curriculum',   href: '#' },
      ],
    },
    {
      label: 'External',
      items: [
        { label: 'Production Calendar (BAND)', href: '#',                    external: true },
        { label: 'Encore Drive',               href: '#',                    external: true },
        { label: 'encorepa.org',               href: 'https://encorepa.org', external: true },
        { label: 'hello@encorepa.org',         href: 'mailto:hello@encorepa.org' },
      ],
    },
  ];

  // ═══ CSS ══════════════════════════════════════════════════════
  const CSS = `
    /* Hamburger button */
    .enc-hamburger {
      background: transparent;
      border: 1px solid rgba(251,248,240,0.18);
      color: #FBF8F0;
      width: 38px;
      height: 38px;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      padding: 0;
      transition: background 0.15s, border-color 0.15s;
      margin-left: 16px;
      flex-shrink: 0;
    }
    .enc-hamburger:hover {
      background: rgba(251,248,240,0.08);
      border-color: rgba(251,248,240,0.32);
    }
    .enc-hamburger span {
      display: block;
      width: 16px;
      height: 1.5px;
      background: currentColor;
      border-radius: 1px;
      transition: transform 0.25s, opacity 0.2s;
    }
    .enc-hamburger.open span:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
    .enc-hamburger.open span:nth-child(2) { opacity: 0; }
    .enc-hamburger.open span:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }
    .enc-hamburger.floating {
      position: fixed;
      top: 14px;
      right: 18px;
      z-index: 9997;
    }

    /* Backdrop */
    .enc-nav-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(31,53,64,0.55);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s;
      z-index: 9998;
    }
    .enc-nav-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* Panel */
    .enc-nav-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: min(380px, 90vw);
      height: 100vh;
      background: #1F3540;
      color: #FBF8F0;
      transform: translateX(100%);
      transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      font-family: 'Outfit', system-ui, -apple-system, sans-serif;
      font-weight: 400;
      box-shadow: -20px 0 60px rgba(0,0,0,0.35);
      overflow-y: auto;
      -webkit-font-smoothing: antialiased;
    }
    .enc-nav-panel.open { transform: translateX(0); }

    /* Header */
    .enc-nav-header {
      padding: 22px 28px;
      border-bottom: 1px solid rgba(251,248,240,0.10);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    .enc-nav-header-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.22em;
      color: #F7B73D;
    }
    .enc-nav-close {
      background: transparent;
      border: none;
      color: #FBF8F0;
      font-size: 26px;
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.15s;
      padding: 0;
      line-height: 1;
    }
    .enc-nav-close:hover { background: rgba(251,248,240,0.10); }

    /* Sections */
    .enc-nav-section {
      padding: 22px 28px 18px;
      border-bottom: 1px solid rgba(251,248,240,0.08);
    }
    .enc-nav-section:last-of-type { border-bottom: none; }
    .enc-nav-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.22em;
      color: rgba(251,248,240,0.45);
      margin-bottom: 12px;
    }
    .enc-nav-items {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .enc-nav-item { margin: 0; }
    .enc-nav-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 11px 0;
      color: #FBF8F0;
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.005em;
      transition: color 0.15s, padding-left 0.15s;
      position: relative;
    }
    .enc-nav-link:hover {
      color: #F7B73D;
      padding-left: 4px;
    }
    .enc-nav-link.large {
      font-size: 19px;
      font-weight: 700;
      padding: 13px 0;
      letter-spacing: -0.01em;
    }
    .enc-nav-link.current {
      color: #F7B73D;
    }
    .enc-nav-link.current::before {
      content: '';
      position: absolute;
      left: -14px;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 16px;
      background: #F7B73D;
      border-radius: 1.5px;
    }
    .enc-nav-link-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .enc-nav-link-meta {
      font-size: 11px;
      font-weight: 500;
      color: rgba(251,248,240,0.5);
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .enc-nav-link.current .enc-nav-link-meta {
      color: rgba(247,183,61,0.7);
    }
    .enc-nav-arrow {
      color: rgba(251,248,240,0.35);
      font-size: 14px;
      font-weight: 500;
      transition: transform 0.15s, color 0.15s;
      flex-shrink: 0;
    }
    .enc-nav-link:hover .enc-nav-arrow {
      color: #F7B73D;
      transform: translateX(3px);
    }

    /* Footer */
    .enc-nav-footer {
      margin-top: auto;
      padding: 22px 28px 28px;
      border-top: 1px solid rgba(251,248,240,0.08);
      font-size: 12px;
      color: rgba(251,248,240,0.5);
      flex-shrink: 0;
    }
    .enc-nav-tagline {
      color: #F7B73D;
      font-style: italic;
      margin-bottom: 4px;
      display: block;
      font-size: 13px;
    }
    .enc-nav-fineprint {
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 10px;
      color: rgba(251,248,240,0.35);
    }

    /* Prevent body scroll while open */
    body.enc-nav-locked { overflow: hidden; }

    @media (max-width: 480px) {
      .enc-nav-panel { width: 100vw; }
    }
  `;

  // ═══ HELPERS ══════════════════════════════════════════════════
  function isCurrentPage(href) {
    if (!href || href === '#' || href.startsWith('mailto:') || /^https?:\/\//.test(href)) return false;
    const itemPath = href.split(/[?#]/)[0].toLowerCase();
    const currentPath = window.location.pathname.toLowerCase();
    if (currentPath === itemPath) return true;
    // Site root maps to home.html
    if (currentPath === '/' && itemPath === '/home.html') return true;
    return false;
  }

  function arrowFor(item) {
    if (item.external) return '↗';
    if (item.href && item.href.startsWith('mailto:')) return '✉';
    return '→';
  }

  function buildPanelHTML() {
    let html = `
      <div class="enc-nav-header">
        <span class="enc-nav-header-title">Encore · Internal Portal</span>
        <button class="enc-nav-close" type="button" aria-label="Close menu">×</button>
      </div>
    `;

    MENU.forEach(section => {
      html += `<div class="enc-nav-section">`;
      html += `<div class="enc-nav-label">${section.label}</div>`;
      html += `<ul class="enc-nav-items">`;
      section.items.forEach(item => {
        const current = isCurrentPage(item.href);
        const sizeClass = item.size === 'large' ? ' large' : '';
        const currentClass = current ? ' current' : '';
        const target = item.external ? ' target="_blank" rel="noopener"' : '';
        const meta = item.meta ? `<span class="enc-nav-link-meta">${item.meta}</span>` : '';
        html += `
          <li class="enc-nav-item">
            <a href="${item.href}" class="enc-nav-link${sizeClass}${currentClass}"${target}>
              <span class="enc-nav-link-text"><span>${item.label}</span>${meta}</span>
              <span class="enc-nav-arrow">${arrowFor(item)}</span>
            </a>
          </li>
        `;
      });
      html += `</ul></div>`;
    });

    html += `
      <div class="enc-nav-footer">
        <span class="enc-nav-tagline">We teach life skills through stage skills.</span>
        <span class="enc-nav-fineprint">Encore Performing Arts</span>
      </div>
    `;

    return html;
  }

  // ═══ INIT ═════════════════════════════════════════════════════
  function init() {
    // Don't double-inject if script loads twice
    if (document.querySelector('.enc-hamburger')) return;

    // Inject CSS
    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    // Build button
    const btn = document.createElement('button');
    btn.className = 'enc-hamburger';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open navigation menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';

    // Build backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'enc-nav-backdrop';

    // Build panel
    const panel = document.createElement('aside');
    panel.className = 'enc-nav-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('role', 'navigation');
    panel.setAttribute('aria-label', 'Site navigation');
    panel.innerHTML = buildPanelHTML();

    // Find insertion point for button (in order of preference)
    const topbarInner = document.querySelector('.topbar-inner');
    const topbar      = document.querySelector('.topbar');

    if (topbarInner) {
      topbarInner.appendChild(btn);
    } else if (topbar) {
      // Training page pattern — flex container, append to end
      topbar.appendChild(btn);
    } else {
      // Fallback: float top right of viewport
      btn.classList.add('floating');
      document.body.appendChild(btn);
    }

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    // Event handlers
    function openMenu() {
      btn.classList.add('open');
      backdrop.classList.add('open');
      panel.classList.add('open');
      document.body.classList.add('enc-nav-locked');
      btn.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
    }
    function closeMenu() {
      btn.classList.remove('open');
      backdrop.classList.remove('open');
      panel.classList.remove('open');
      document.body.classList.remove('enc-nav-locked');
      btn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
    }
    function toggleMenu() {
      if (panel.classList.contains('open')) closeMenu();
      else openMenu();
    }

    btn.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', closeMenu);
    panel.querySelector('.enc-nav-close').addEventListener('click', closeMenu);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
