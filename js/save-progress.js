(function () {
  'use strict';

  const STORAGE_KEY = 'desafios-progresso-v1';
  const DEBOUNCE_MS = 300;
  const BADGE_SHOW_MS = 1000;
  const BADGE_SHOW_MS_RESET = 2000;
  const SCOPE_SELECTOR = '#gapDesafio';

  function debounce(fn, wait) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function safeJSONParse(raw) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  let badgeTimer = null;
  let resetBadgeTimer = null;
  let isResetting = false;

  function ensureBadgeStyle() {
    if (document.getElementById('saved-progress-badge-style')) return;

    const style = document.createElement('style');
    style.id = 'saved-progress-badge-style';
    style.textContent = `
      #saved-progress-badge {
        transition: opacity 200ms ease, transform 200ms ease;
        opacity: 0;
        transform: translateY(8px);
      }
    `;
    document.head.appendChild(style);
  }

  function showSavedBadge() {
    ensureBadgeStyle();

    let badge = document.getElementById('saved-progress-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'saved-progress-badge';
      badge.setAttribute('role', 'status');
      badge.setAttribute('aria-live', 'polite');
      badge.textContent = 'Progresso salvo';
      Object.assign(badge.style, {
        position: 'fixed',
        right: '18px',
        bottom: '18px',
        background: 'rgba(16,185,129,0.95)',
        color: '#032',
        padding: '8px 12px',
        borderRadius: '10px',
        boxShadow: '0 6px 18px rgba(2,6,23,0.35)',
        fontWeight: '700',
        zIndex: 99999,
        fontFamily: 'inherit',
        fontSize: '0.95rem',
        pointerEvents: 'none',
      });
      document.body.appendChild(badge);
    }

    badge.style.opacity = '1';
    badge.style.transform = 'translateY(0)';

    if (badgeTimer) clearTimeout(badgeTimer);
    badgeTimer = setTimeout(() => {
      badge.style.opacity = '0';
      badge.style.transform = 'translateY(8px)';
    }, BADGE_SHOW_MS);
  }

  function showResetBadge() {
    ensureBadgeStyle();

    let badge = document.getElementById('reset-progress-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'reset-progress-badge';
      badge.setAttribute('role', 'status');
      badge.setAttribute('aria-live', 'polite');
      badge.textContent = 'Progresso Resetado';
      Object.assign(badge.style, {
        position: 'fixed',
        right: '18px',
        bottom: '18px',
        background: 'rgba(16,185,129,0.95)',
        color: '#032',
        padding: '8px 12px',
        borderRadius: '10px',
        boxShadow: '0 6px 18px rgba(2,6,23,0.35)',
        fontWeight: '700',
        zIndex: 99999,
        fontFamily: 'inherit',
        fontSize: '0.95rem',
        pointerEvents: 'none',
      });
      document.body.appendChild(badge);
    }

    badge.style.opacity = '1';
    badge.style.transform = 'translateY(0)';

    if (resetBadgeTimer) clearTimeout(resetBadgeTimer);
    resetBadgeTimer = setTimeout(() => {
      badge.style.opacity = '0';
      badge.style.transform = 'translateY(8px)';
    }, BADGE_SHOW_MS_RESET);
  }

  function getCheckboxes() {
    const scope = document.querySelector(SCOPE_SELECTOR) || document;
    return Array.from(scope.querySelectorAll('input[type="checkbox"]'));
  }

  function readStatesFromDOM() {
    return getCheckboxes().map((input) => !!input.checked);
  }

  function applyStatesToDOM(states) {
    const inputs = getCheckboxes();
    if (inputs.length === 0) return;

    const limit = Math.min(states.length, inputs.length);
    for (let index = 0; index < limit; index += 1) {
      inputs[index].checked = !!states[index];
      inputs[index].dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function saveProgress() {
    const payload = {
      version: 1,
      savedAt: Date.now(),
      states: readStatesFromDOM(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      showSavedBadge();

      // Atualizar ranking
      const completedCount = payload.states.filter(state => state).length;
      if (window.rankingSystem) {
        window.rankingSystem.updatePoints(completedCount);
        window.rankingSystem.updateRankingDisplay();
      }
    } catch (error) {
      console.warn('save-progress: não foi possível salvar no localStorage', error);
    }
  }

  const debouncedSave = debounce(saveProgress, DEBOUNCE_MS);

  function restoreProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const obj = safeJSONParse(raw);
      if (!obj || !Array.isArray(obj.states)) return;

      applyStatesToDOM(obj.states);
    } catch (error) {
      console.warn('save-progress: erro ao restaurar progresso', error);
    }
  }

  function clearProgress(ask = true) {
    isResetting = true;

    try {
      localStorage.removeItem(STORAGE_KEY);
      showResetBadge();

      // Resetar ranking
      if (window.rankingSystem) {
        window.rankingSystem.resetRanking();
      }
    } catch (error) {
      console.warn('save-progress: erro ao remover progresso', error);
    }

    const inputs = getCheckboxes();
    inputs.forEach((input) => {
      input.checked = false;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    isResetting = false;
  }

  document.addEventListener('DOMContentLoaded', function initSaveProgress() {
    restoreProgress();

    const inputs = getCheckboxes();
    if (inputs.length === 0) {
      return;
    }

    inputs.forEach((input) => {
      input.addEventListener('change', () => {
        if (!isResetting) {
          debouncedSave();
        }
      });
    });


    window.saveProgress = saveProgress;
    window.restoreProgress = restoreProgress;
    window.clearProgress = clearProgress;
  });
})();
