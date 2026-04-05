/**
 * LawGames - Shared Navigation Bar
 * Injects a persistent top navigation bar into every page.
 * Include via <script src="navbar.js"></script> (after shared.js)
 *
 * Requires: LawGames.getBasePath() from shared.js
 */
(function() {
  'use strict';

  // ── Data ──────────────────────────────────────────────────────────────
  var TOOLS = [
    { name: 'Spaced Repetition', path: 'tools/spaced-repetition.html', icon: '🔄' },
    { name: 'Interactive Flowcharts', path: 'tools/flowcharts.html', icon: '🌊' },
    { name: 'Practice Exams', path: 'tools/practice-exams.html', icon: '📝' },
    { name: 'Issue Spotter', path: 'tools/issue-spotter.html', icon: '🔀' },
    { name: 'Rule Drills', path: 'tools/rule-drills.html', icon: '✍️' },
    { name: 'Why Guides', path: 'tools/why-guides.html', icon: '💡' },
    { name: 'Feynman Technique', path: 'tools/feynman.html', icon: '🎓' },
    { name: 'Pre-Test Quizzes', path: 'tools/pre-test.html', icon: '🧪' },
    { name: 'Case Briefs', path: 'tools/case-briefs.html', icon: '⚖️' },
    { name: 'Lecture Notes', path: 'tools/lecture-notes.html', icon: '📖' }
  ];

  var GAMES = [
    { name: 'Connections', path: 'games/connections/', icon: '🔲' },
    { name: "Who's on Trial?", path: 'games/whos-on-trial/', icon: '⚒️' },
    { name: 'Sort It Out', path: 'games/sort-it-out/', icon: '⇄' },
    { name: 'Case Match', path: 'games/case-match/', icon: '🃏' },
    { name: 'Mini Crossword', path: 'games/crossword/', icon: '⊞' },
    { name: 'Build the Argument', path: 'games/build-the-argument/', icon: '🧩' }
  ];

  // ── Helpers ────────────────────────────────────────────────────────────
  function basePath() {
    return (window.LawGames && LawGames.getBasePath) ? LawGames.getBasePath() : '/';
  }

  function currentPage() {
    return window.location.pathname;
  }

  function isActive(itemPath) {
    var cur = currentPage();
    var full = basePath() + itemPath;
    // Normalize trailing slashes
    cur = cur.replace(/\/index\.html$/, '/').replace(/\/$/, '');
    full = full.replace(/\/index\.html$/, '/').replace(/\/$/, '');
    return cur === full;
  }

  function isHome() {
    var cur = currentPage().replace(/\/index\.html$/, '/').replace(/\/$/, '');
    var home = basePath().replace(/\/$/, '');
    return cur === home;
  }

  // ── Theme definitions ──────────────────────────────────────────────────
  var THEMES = ['clean', 'midnight', 'neon', 'minimalist', 'vivid', 'high-contrast'];
  var THEME_ICONS = { clean: '☀️', midnight: '🌙', neon: '⚡', minimalist: '◻️', vivid: '🎨', 'high-contrast': '👁️' };
  var THEME_LABELS = { clean: 'Clean', midnight: 'Midnight', neon: 'Neon', minimalist: 'Minimal', vivid: 'Vivid', 'high-contrast': 'Hi-Con' };

  // ── Ensure viewport-fit=cover for safe area insets ──────────────────
  var vpMeta = document.querySelector('meta[name="viewport"]');
  if (vpMeta) {
    var content = vpMeta.getAttribute('content') || '';
    if (content.indexOf('viewport-fit') === -1) {
      vpMeta.setAttribute('content', content + ', viewport-fit=cover');
    }
  }

  // ── Migrate old theme names to new ──────────────────────────────
  var savedTheme = localStorage.getItem('lawgames-theme');
  var THEME_MIGRATION = { 'light': 'clean', 'dark': 'midnight', 'forest': 'minimalist', 'ocean': 'neon', 'sunset': 'vivid' };
  if (savedTheme && THEME_MIGRATION[savedTheme]) {
    localStorage.setItem('lawgames-theme', THEME_MIGRATION[savedTheme]);
    document.documentElement.setAttribute('data-theme', THEME_MIGRATION[savedTheme]);
  }

  // ── Inject styles ─────────────────────────────────────────────────────
  var css = document.createElement('style');
  css.textContent = [
    /* Safe area: push body content below status bar and above nav bar */
    'html { padding-top: env(safe-area-inset-top, 0px); padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px); padding-left: env(safe-area-inset-left, 0px); padding-right: env(safe-area-inset-right, 0px); background: var(--color-bg-secondary, #f8f8f8); }',
    /* Bar — uses CSS variables so all themes work automatically */
    '.lg-navbar { position: sticky; top: 0; z-index: 500; display: flex; align-items: center; gap: 4px; padding: 0 12px; height: 46px; font-family: var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif); font-size: 13px; border-bottom: 1px solid var(--color-border, #e0e0e0); background: var(--color-bg-secondary, #f8f8f8); color: var(--color-text-primary, #1a1a1a); }',
    /* Home button */
    '.lg-navbar .lg-home { display: flex; align-items: center; gap: 6px; text-decoration: none; font-weight: 700; font-size: 14px; color: inherit; padding: 4px 10px; border-radius: 6px; white-space: nowrap; transition: background .15s; }',
    '.lg-navbar .lg-home:hover { background: var(--color-bg-tertiary, #f0f0f0); }',
    '.lg-navbar .lg-home.lg-active { color: var(--color-subject-crim, #ef4444); }',
    /* Separator */
    '.lg-navbar .lg-sep { width: 1px; height: 22px; background: var(--color-border, #e0e0e0); margin: 0 4px; flex-shrink: 0; }',
    /* Dropdown wrapper */
    '.lg-navbar .lg-dd { position: relative; }',
    /* Dropdown trigger */
    '.lg-navbar .lg-dd-btn { display: flex; align-items: center; gap: 4px; padding: 5px 10px; border: none; background: none; font: inherit; color: inherit; cursor: pointer; border-radius: 6px; transition: background .15s; white-space: nowrap; }',
    '.lg-navbar .lg-dd-btn:hover, .lg-navbar .lg-dd-btn.lg-open { background: var(--color-bg-tertiary, #f0f0f0); }',
    '.lg-navbar .lg-dd-btn .lg-caret { font-size: 9px; opacity: .6; transition: transform .15s; }',
    '.lg-navbar .lg-dd-btn.lg-open .lg-caret { transform: rotate(180deg); }',
    '.lg-navbar .lg-dd-btn.lg-section-active { font-weight: 600; color: var(--color-subject-crim, #ef4444); }',
    /* Dropdown menu */
    '.lg-navbar .lg-dd-menu { display: none; position: absolute; top: calc(100% + 4px); left: 0; min-width: 220px; background: var(--color-bg-primary, #fff); border: 1px solid var(--color-border, #e0e0e0); border-radius: 8px; box-shadow: var(--shadow-lg, 0 8px 24px rgba(0,0,0,.12)); padding: 4px; z-index: 501; }',
    '.lg-navbar .lg-dd-menu.lg-show { display: block; }',
    /* Menu item */
    '.lg-navbar .lg-dd-menu a { display: flex; align-items: center; gap: 8px; padding: 8px 10px; text-decoration: none; color: inherit; border-radius: 6px; transition: background .12s; font-size: 13px; }',
    '.lg-navbar .lg-dd-menu a:hover { background: var(--color-bg-tertiary, #f0f0f0); }',
    '.lg-navbar .lg-dd-menu a.lg-item-active { font-weight: 600; color: var(--color-subject-crim, #ef4444); }',
    '.lg-navbar .lg-dd-menu a .lg-item-icon { flex-shrink: 0; width: 22px; text-align: center; }',
    /* Right side spacer */
    '.lg-navbar .lg-spacer { flex: 1; }',
    /* Theme toggle in navbar */
    '.lg-navbar .lg-theme-btn { background: none; border: 1px solid var(--color-border, #e0e0e0); padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; line-height: 1; transition: background .15s; display: flex; align-items: center; gap: 4px; color: var(--color-text-secondary, #555); }',
    '.lg-navbar .lg-theme-btn:hover { background: var(--color-bg-tertiary, #f0f0f0); }',
    '.lg-navbar .lg-theme-btn .lg-theme-icon { font-size: 14px; }',
    /* Bottom bar — fixed space at bottom for safe area */
    '.lg-bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; height: calc(env(safe-area-inset-bottom, 0px) + 12px); background: var(--color-bg-secondary, #f8f8f8); border-top: 1px solid var(--color-border, #e0e0e0); z-index: 500; }',
    /* Mobile: collapse labels */
    '@media (max-width: 600px) { .lg-navbar .lg-dd-btn .lg-label { display: none; } .lg-navbar .lg-home .lg-home-label { display: none; } .lg-navbar .lg-theme-label { display: none; } .lg-navbar { gap: 2px; padding: 0 6px; } }'
  ].join('\n');
  document.head.appendChild(css);

  // ── Build DOM ─────────────────────────────────────────────────────────
  var nav = document.createElement('nav');
  nav.className = 'lg-navbar';

  // Home link
  var home = document.createElement('a');
  home.className = 'lg-home' + (isHome() ? ' lg-active' : '');
  home.href = basePath() + 'index.html';
  home.innerHTML = '<span>⚖️</span><span class="lg-home-label">Study Hub</span>';
  nav.appendChild(home);

  nav.appendChild(makeSep());

  // Tools dropdown
  nav.appendChild(makeDropdown('🧠', 'Study Tools', TOOLS));

  nav.appendChild(makeSep());

  // Games dropdown
  nav.appendChild(makeDropdown('🎮', 'Games', GAMES));

  // Spacer
  var spacer = document.createElement('div');
  spacer.className = 'lg-spacer';
  nav.appendChild(spacer);

  // Theme toggle — cycles through light → dark → midnight → forest → ocean → sunset
  var themeBtn = document.createElement('button');
  themeBtn.className = 'lg-theme-btn';
  themeBtn.setAttribute('aria-label', 'Switch theme');
  updateThemeBtn();
  themeBtn.addEventListener('click', function() {
    var cur = document.documentElement.getAttribute('data-theme') || 'light';
    var idx = THEMES.indexOf(cur);
    var next = THEMES[(idx + 1) % THEMES.length];
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('lawgames-theme', next);
    updateThemeBtn();
    // Also update any old theme toggles on the page
    var others = document.querySelectorAll('.lawgames-theme-toggle, #theme-toggle');
    others.forEach(function(el) {
      el.textContent = getThemeIcon();
    });
  });
  nav.appendChild(themeBtn);

  // ── Insert into page ──────────────────────────────────────────────────
  // Insert as first child of body
  if (document.body.firstChild) {
    document.body.insertBefore(nav, document.body.firstChild);
  } else {
    document.body.appendChild(nav);
  }

  // If body has padding/margin, compensate so navbar spans full width
  var bodyStyle = window.getComputedStyle(document.body);
  var bodyPadLeft = parseFloat(bodyStyle.paddingLeft) || 0;
  var bodyPadRight = parseFloat(bodyStyle.paddingRight) || 0;
  var bodyPadTop = parseFloat(bodyStyle.paddingTop) || 0;
  if (bodyPadLeft > 0 || bodyPadRight > 0 || bodyPadTop > 0) {
    nav.style.marginLeft = (-bodyPadLeft) + 'px';
    nav.style.marginRight = (-bodyPadRight) + 'px';
    nav.style.marginTop = (-bodyPadTop) + 'px';
    nav.style.paddingLeft = (bodyPadLeft) + 'px';
    nav.style.paddingRight = (bodyPadRight) + 'px';
    nav.style.width = 'calc(100% + ' + (bodyPadLeft + bodyPadRight) + 'px)';
  }

  // ── Bottom Bar ──────────────────────────────────────────────────
  var bottomBar = document.createElement('div');
  bottomBar.className = 'lg-bottom-bar';
  document.body.appendChild(bottomBar);

  // ── Close dropdowns on outside click ──────────────────────────────────
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.lg-dd')) {
      closeAllDropdowns();
    }
  });

  // ── Helper functions ──────────────────────────────────────────────────
  function makeSep() {
    var s = document.createElement('div');
    s.className = 'lg-sep';
    return s;
  }

  function makeDropdown(emoji, label, items) {
    var wrap = document.createElement('div');
    wrap.className = 'lg-dd';

    var sectionActive = items.some(function(it) { return isActive(it.path); });

    var btn = document.createElement('button');
    btn.className = 'lg-dd-btn' + (sectionActive ? ' lg-section-active' : '');
    btn.innerHTML = '<span>' + emoji + '</span><span class="lg-label">' + label + '</span><span class="lg-caret">▾</span>';
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var wasOpen = menu.classList.contains('lg-show');
      closeAllDropdowns();
      if (!wasOpen) {
        menu.classList.add('lg-show');
        btn.classList.add('lg-open');
      }
    });

    var menu = document.createElement('div');
    menu.className = 'lg-dd-menu';

    items.forEach(function(item) {
      var a = document.createElement('a');
      a.href = basePath() + item.path;
      a.className = isActive(item.path) ? 'lg-item-active' : '';
      a.innerHTML = '<span class="lg-item-icon">' + item.icon + '</span><span>' + item.name + '</span>';
      menu.appendChild(a);
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    return wrap;
  }

  function closeAllDropdowns() {
    var menus = document.querySelectorAll('.lg-dd-menu.lg-show');
    menus.forEach(function(m) { m.classList.remove('lg-show'); });
    var btns = document.querySelectorAll('.lg-dd-btn.lg-open');
    btns.forEach(function(b) { b.classList.remove('lg-open'); });
  }

  function getThemeIcon() {
    var theme = document.documentElement.getAttribute('data-theme') || 'light';
    return THEME_ICONS[theme] || '🌙';
  }

  function updateThemeBtn() {
    var theme = document.documentElement.getAttribute('data-theme') || 'light';
    var nextIdx = (THEMES.indexOf(theme) + 1) % THEMES.length;
    var nextTheme = THEMES[nextIdx];
    themeBtn.innerHTML = '<span class="lg-theme-icon">' + THEME_ICONS[nextTheme] + '</span><span class="lg-theme-label">' + THEME_LABELS[nextTheme] + '</span>';
    themeBtn.title = 'Switch to ' + THEME_LABELS[nextTheme] + ' theme';
  }
})();
