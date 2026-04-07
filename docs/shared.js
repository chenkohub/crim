/**
 * LawGames - Shared JavaScript Utilities
 * Vanilla JS utilities for NYT Games-style law study site
 * No frameworks, no modules - include via <script> tag
 */

window.LawGames = window.LawGames || {};

(function(LawGames) {
  'use strict';

  // ============================================================================
  // THEME MANAGEMENT
  // ============================================================================

  /**
   * Initialize theme from localStorage, default to clean
   * Applies data-theme attribute to html element
   */
  LawGames.initTheme = function() {
    var saved = localStorage.getItem('lawgames-theme') || 'clean';
    var migration = { 'light': 'clean', 'dark': 'midnight', 'forest': 'minimalist', 'ocean': 'neon', 'sunset': 'vivid' };
    if (migration[saved]) {
      saved = migration[saved];
      localStorage.setItem('lawgames-theme', saved);
    }
    document.documentElement.setAttribute('data-theme', saved);
  };

  /**
   * Available themes in cycle order
   */
  LawGames.THEMES = ['clean', 'midnight', 'neon', 'minimalist', 'vivid', 'high-contrast'];

  /**
   * Cycle to the next theme
   * Saves preference to localStorage
   */
  LawGames.toggleTheme = function() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const idx = LawGames.THEMES.indexOf(current);
    const next = LawGames.THEMES[(idx + 1) % LawGames.THEMES.length];
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('lawgames-theme', next);
  };

  /**
   * Get current theme
   * @returns {string} current theme name
   */
  LawGames.getCurrentTheme = function() {
    return document.documentElement.getAttribute('data-theme') || 'clean';
  };

  // ============================================================================
  // STATS SYSTEM (localStorage-based)
  // ============================================================================

  // Stats object structure:
  // {
  //   played: number,
  //   won: number,
  //   streak: number,           // current streak
  //   maxStreak: number,         // longest streak
  //   distribution: [0,0,0,0,0], // attempts distribution (e.g., 5 attempts = index 4)
  //   lastPlayDate: string,      // ISO date of last play
  //   totalScore: number,        // cumulative score
  //   topicErrors: {}            // map of topic -> error count
  // }

  /**
   * Get stats for a specific game
   * @param {string} gameId - game identifier
   * @returns {object} stats object
   */
  LawGames.getStats = function(gameId) {
    const key = 'lawgames-stats-' + gameId;
    const defaults = {
      played: 0,
      won: 0,
      streak: 0,
      maxStreak: 0,
      distribution: [0, 0, 0, 0, 0],
      lastPlayDate: null,
      totalScore: 0,
      topicErrors: {}
    };

    const saved = localStorage.getItem(key);
    if (!saved) return defaults;

    try {
      return Object.assign({}, defaults, JSON.parse(saved));
    } catch (e) {
      console.warn('Failed to parse stats for ' + gameId, e);
      return defaults;
    }
  };

  /**
   * Save stats for a specific game
   * @param {string} gameId - game identifier
   * @param {object} stats - stats object
   */
  LawGames.saveStats = function(gameId, stats) {
    const key = 'lawgames-stats-' + gameId;
    try {
      localStorage.setItem(key, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats for ' + gameId, e);
    }
  };

  /**
   * Record a game result and update stats
   * @param {string} gameId - game identifier
   * @param {object} result - game result object
   *   - won: boolean
   *   - attempts: number (1-5 or similar)
   *   - score: number
   *   - topics: array of topic strings (for weak-topic tracking)
   */
  LawGames.recordGame = function(gameId, result) {
    const stats = LawGames.getStats(gameId);

    // Update basic stats
    stats.played += 1;
    stats.totalScore += (result.score || 0);
    stats.lastPlayDate = new Date().toISOString().split('T')[0];

    if (result.won) {
      stats.won += 1;
      stats.streak += 1;
      if (stats.streak > stats.maxStreak) {
        stats.maxStreak = stats.streak;
      }
    } else {
      stats.streak = 0;
    }

    // Update attempts distribution
    const attemptIndex = Math.min((result.attempts || 1) - 1, 4);
    stats.distribution[attemptIndex] += 1;

    // Track topic errors (incorrect topics)
    if (result.topics && Array.isArray(result.topics)) {
      result.topics.forEach(function(topic) {
        stats.topicErrors[topic] = (stats.topicErrors[topic] || 0) + 1;
      });
    }

    LawGames.saveStats(gameId, stats);
    return stats;
  };

  /**
   * Get weak topics (topics with most errors across all games)
   * Sorted by error count descending
   * @returns {array} array of {topic: string, errors: number}
   */
  LawGames.getWeakTopics = function() {
    const allGameStats = LawGames.getAllStats();
    const topicMap = {};

    // Aggregate errors across all games
    Object.keys(allGameStats).forEach(function(gameId) {
      const stats = allGameStats[gameId];
      if (stats.topicErrors) {
        Object.keys(stats.topicErrors).forEach(function(topic) {
          topicMap[topic] = (topicMap[topic] || 0) + stats.topicErrors[topic];
        });
      }
    });

    // Convert to array and sort
    return Object.keys(topicMap)
      .map(function(topic) {
        return { topic: topic, errors: topicMap[topic] };
      })
      .sort(function(a, b) {
        return b.errors - a.errors;
      });
  };

  /**
   * Get stats for all games
   * @returns {object} map of gameId -> stats
   */
  LawGames.getAllStats = function() {
    const result = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('lawgames-stats-')) {
        const gameId = key.replace('lawgames-stats-', '');
        result[gameId] = LawGames.getStats(gameId);
      }
    }
    return result;
  };

  // ============================================================================
  // PUZZLE SELECTION (on-demand, not daily)
  // ============================================================================

  /**
   * Get a random puzzle, trying to avoid recently-played ones
   * @param {array} puzzles - array of puzzle objects with id property
   * @param {string} gameId - game identifier
   * @returns {object} puzzle object
   */
  LawGames.getRandomPuzzle = function(puzzles, gameId) {
    if (!puzzles || puzzles.length === 0) return null;

    const key = 'lawgames-played-' + gameId;
    const played = JSON.parse(localStorage.getItem(key) || '[]');

    // Try to find unplayed puzzle
    const unplayed = puzzles.filter(function(p) {
      return played.indexOf(p.id) === -1;
    });

    if (unplayed.length > 0) {
      return unplayed[Math.floor(Math.random() * unplayed.length)];
    }

    // All played, pick random (and reset played list)
    localStorage.setItem(key, JSON.stringify([]));
    return puzzles[Math.floor(Math.random() * puzzles.length)];
  };

  /**
   * Mark a puzzle as played for a given game
   * @param {string} gameId - game identifier
   * @param {string} puzzleId - puzzle identifier
   */
  LawGames.markPuzzlePlayed = function(gameId, puzzleId) {
    const key = 'lawgames-played-' + gameId;
    const played = JSON.parse(localStorage.getItem(key) || '[]');

    if (played.indexOf(puzzleId) === -1) {
      played.push(puzzleId);
    }

    // Keep only recent 50 puzzles (avoid unbounded storage growth)
    if (played.length > 50) {
      played.shift();
    }

    localStorage.setItem(key, JSON.stringify(played));
  };

  // ============================================================================
  // SUBJECT MANAGEMENT
  // ============================================================================

  /**
   * Available subjects configuration
   * Can be extended with more subjects as needed
   */
  LawGames.SUBJECTS = [
    { id: 'crim', name: 'Criminal Law', icon: '⚖️', color: '#C4302B' },
    { id: 'tort', name: 'Tort Law', icon: '⚔️', color: '#FF6B35' },
    { id: 'contract', name: 'Contract Law', icon: '📜', color: '#004E89' },
    { id: 'prop', name: 'Property Law', icon: '🏠', color: '#F77F00' },
    { id: 'civil', name: 'Civil Procedure', icon: '📋', color: '#06A77D' },
    { id: 'evidence', name: 'Evidence', icon: '🔎', color: '#7209B7' }
  ];

  /**
   * Get current subject selection
   * @returns {string} subject ID
   */
  LawGames.getCurrentSubject = function() {
    return localStorage.getItem('lawgames-subject') || 'crim';
  };

  /**
   * Set current subject
   * @param {string} subjectId - subject identifier
   */
  LawGames.setCurrentSubject = function(subjectId) {
    // Validate subject exists
    if (LawGames.SUBJECTS.find(function(s) { return s.id === subjectId; })) {
      localStorage.setItem('lawgames-subject', subjectId);
    }
  };

  /**
   * Get all available subjects
   * @returns {array} array of subject objects
   */
  LawGames.getSubjects = function() {
    return LawGames.SUBJECTS;
  };

  /**
   * Get a specific subject by ID
   * @param {string} subjectId - subject identifier
   * @returns {object} subject object or null
   */
  LawGames.getSubject = function(subjectId) {
    return LawGames.SUBJECTS.find(function(s) { return s.id === subjectId; }) || null;
  };

  // ============================================================================
  // SHARE & NOTIFICATIONS
  // ============================================================================

  /**
   * Copy text to clipboard and show toast
   * @param {string} text - text to copy
   * @param {string} message - optional custom toast message
   */
  LawGames.copyShareText = function(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        LawGames.createToast(message || 'Copied to clipboard!');
      }).catch(function() {
        // Fallback for older browsers
        LawGames._copyToClipboardFallback(text);
        LawGames.createToast(message || 'Copied to clipboard!');
      });
    } else {
      // Fallback for browsers without clipboard API
      LawGames._copyToClipboardFallback(text);
      LawGames.createToast(message || 'Copied to clipboard!');
    }
  };

  /**
   * Fallback for copying to clipboard (older browsers)
   * @private
   */
  LawGames._copyToClipboardFallback = function(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      console.error('Copy failed:', e);
    }
    document.body.removeChild(textarea);
  };

  /**
   * Show a toast notification
   * @param {string} message - message to display
   * @param {number} duration - duration in ms (default 2000)
   */
  LawGames.createToast = function(message, duration) {
    duration = duration || 2000;

    const toast = document.createElement('div');
    toast.className = 'lawgames-toast';
    toast.textContent = message;
    toast.style.cssText = [
      'position: fixed',
      'bottom: 20px',
      'left: 50%',
      'transform: translateX(-50%)',
      'background-color: rgba(0, 0, 0, 0.8)',
      'color: white',
      'padding: 12px 24px',
      'border-radius: 4px',
      'font-size: 14px',
      'z-index: 10000',
      'animation: lawgames-toast-fade 0.3s ease-in-out',
      'pointer-events: none'
    ].join(';');

    // Add animation if not already present
    if (!document.getElementById('lawgames-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'lawgames-toast-styles';
      style.textContent = `
        @keyframes lawgames-toast-fade {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes lawgames-toast-out {
          from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          to {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(function() {
      toast.style.animation = 'lawgames-toast-out 0.3s ease-in-out forwards';
      setTimeout(function() {
        document.body.removeChild(toast);
      }, 300);
    }, duration);
  };

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Fisher-Yates shuffle
   * @param {array} arr - array to shuffle
   * @returns {array} new shuffled array
   */
  LawGames.shuffleArray = function(arr) {
    const result = arr.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  };

  /**
   * Load and parse a JSON file
   * @param {string} path - path to JSON file
   * @returns {Promise} promise that resolves to parsed JSON
   */
  LawGames.loadJSON = function(path) {
    return fetch(LawGames.getBasePath() + path)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to load ' + path + ': ' + response.statusText);
        }
        return response.json();
      });
  };

  /**
   * Get the correct base path for the site
   * Handles GitHub Pages, local dev, and Tauri webview
   * @returns {string} base path (ends with /)
   */
  LawGames.getBasePath = function() {
    // Find the <script> tag that loaded shared.js — its src attribute
    // already contains the correct relative path to the docs root.
    // e.g. from tools/  → "../shared.js"  → base = "../"
    //      from games/x/ → "../../shared.js" → base = "../../"
    //      from root      → "shared.js"      → base = ""
    var scripts = document.querySelectorAll('script[src*="shared.js"]');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src');
      if (src && src.indexOf('shared.js') !== -1) {
        return src.replace('shared.js', '');
      }
    }
    // Fallback: assume root
    return '';
  };

  /**
   * Get the URL for a resource (handles base path automatically)
   * @param {string} path - resource path
   * @returns {string} full URL
   */
  LawGames.getResourceUrl = function(path) {
    return LawGames.getBasePath() + path.replace(/^\//, '');
  };

  // ============================================================================
  // HEADER COMPONENT
  // ============================================================================

  /**
   * Create a sticky header element
   * @param {string} title - page title
   * @param {boolean} showBack - whether to show back button
   * @returns {HTMLElement} header DOM element
   */
  LawGames.createHeader = function(title, showBack) {
    // Back button and theme toggle are now handled by navbar.js
    // This function just creates a simple title bar for the game
    const header = document.createElement('header');
    header.className = 'lawgames-header';
    header.style.cssText = [
      'background-color: var(--bg-primary, var(--color-bg-primary, #ffffff))',
      'border-bottom: 1px solid var(--border-color, var(--color-border, #e0e0e0))',
      'padding: 10px 16px',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'z-index: 90',
      'gap: 12px'
    ].join(';');

    const titleEl = document.createElement('h1');
    titleEl.textContent = title;
    titleEl.style.cssText = [
      'margin: 0',
      'font-size: 20px',
      'font-weight: 600',
      'color: var(--text-primary, var(--color-text-primary, #000000))'
    ].join(';');

    header.appendChild(titleEl);
    return header;
  };

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the theme when the library loads
   * This runs automatically on page load
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', LawGames.initTheme);
  } else {
    LawGames.initTheme();
  }

})(window.LawGames);
