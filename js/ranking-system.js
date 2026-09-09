(function () {
  'use strict';

  const RANKING_STORAGE_KEY = 'desafios-ranking-v1';
  const POINTS_PER_CHALLENGE = 100;
  const TOTAL_CHALLENGES = 5;
  const MAX_POINTS = POINTS_PER_CHALLENGE * TOTAL_CHALLENGES;

  function safeJSONParse(raw) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function createDefaultRanking() {
    return {
      version: 1,
      points: 0,
      totalChallengesCompleted: 0,
      badges: [],
      startTime: Date.now(),
      lastUpdate: Date.now(),
      challengeTimes: []
    };
  }

  function normalizeChallengeTimes(times) {
    if (!Array.isArray(times)) {
      return [];
    }

    return times.slice(0, TOTAL_CHALLENGES).map((time) => Number.isFinite(time) ? Number(time) : null);
  }

  const BADGES = {
    iniciante: {
      id: 'iniciante',
      name: 'Iniciante',
      description: 'Complete o primeiro desafio',
      icon: '🌱',
      condition: (completedCount) => completedCount >= 1,
      reward: 100
      
    },
    intermediario: {
      id: 'intermediario',
      name: 'Intermediário',
      description: 'Complete 3 desafios',
      icon: '⚡',
      condition: (completedCount) => completedCount >= 3,
      reward: 100
    },
    expert: {
      id: 'expert',
      name: 'Expert',
      description: 'Complete todos os 5 desafios',
      icon: '🏆',
      condition: (completedCount) => completedCount >= 5,
      reward: 100
    },
    speedRunner: {
      id: 'speedRunner',
      name: 'Speed Runner',
      description: 'Complete todos os desafios em menos de 8 minutos no total',
      icon: '⚡🏃',
      condition: (completedCount, timeMs, daysSaved, challengeTimes = []) => {
        const hasAllChallenges = completedCount >= TOTAL_CHALLENGES;
        const totalTime = Array.isArray(challengeTimes)
          ? challengeTimes
              .filter((challengeTime) => typeof challengeTime === 'number')
              .reduce((sum, challengeTime) => sum + challengeTime, 0)
          : 0;
        return hasAllChallenges && totalTime > 0 && totalTime < 8 * 60 * 1000;
      },
      reward: 150
    },
  };

  function initRanking() {
    try {
      const saved = localStorage.getItem(RANKING_STORAGE_KEY);

      if (!saved) {
        const newRanking = createDefaultRanking();
        localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(newRanking));
        return newRanking;
      }

      const parsed = safeJSONParse(saved);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Ranking inválido no localStorage');
      }

      const normalizedRanking = {
        version: 1,
        points: Number.isFinite(parsed.points) ? Number(parsed.points) : 0,
        totalChallengesCompleted: Number.isFinite(parsed.totalChallengesCompleted) ? Number(parsed.totalChallengesCompleted) : 0,
        badges: Array.isArray(parsed.badges) ? parsed.badges.filter(Boolean) : [],
        startTime: Number.isFinite(parsed.startTime) ? Number(parsed.startTime) : Date.now(),
        lastUpdate: Number.isFinite(parsed.lastUpdate) ? Number(parsed.lastUpdate) : Date.now(),
        challengeTimes: normalizeChallengeTimes(parsed.challengeTimes)
      };

      localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(normalizedRanking));
      return normalizedRanking;
    } catch (error) {
      console.warn('ranking-system: falha ao carregar ranking, resetando dados.', error);
      const fallbackRanking = createDefaultRanking();
      try {
        localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(fallbackRanking));
      } catch (storageError) {
        console.warn('ranking-system: não foi possível restaurar ranking no localStorage.', storageError);
      }
      return fallbackRanking;
    }
  }

  function saveRanking(data) {
    if (!data || typeof data !== 'object') {
      return;
    }

    try {
      localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('ranking-system: não foi possível salvar ranking no localStorage.', error);
    }
  }

  function getRankingData() {
    return initRanking();
  }

  function computePoints(ranking) {
    const hasSpeedRunner = ranking.badges.includes(BADGES.speedRunner.id);
    return ranking.totalChallengesCompleted * POINTS_PER_CHALLENGE
      + (hasSpeedRunner ? BADGES.speedRunner.reward : 0);
  }

  function setChallengeTimes(times) {
    const ranking = initRanking();
    ranking.challengeTimes = Array.isArray(times)
      ? times.slice(0, TOTAL_CHALLENGES).map((time) => Number.isFinite(time) ? Number(time) : null)
      : [];
    ranking.totalChallengesCompleted = ranking.challengeTimes.filter((time) => typeof time === 'number').length;
    ranking.lastUpdate = Date.now();
    checkBadges(ranking);
    return ranking;
  }

  function updatePoints(challengesCompleted) {
    const ranking = initRanking();
    const completedCount = Number.isFinite(challengesCompleted)
      ? Math.max(challengesCompleted, ranking.challengeTimes.filter((time) => typeof time === 'number').length)
      : ranking.challengeTimes.filter((time) => typeof time === 'number').length;

    ranking.challengeTimes = normalizeChallengeTimes(ranking.challengeTimes);
    ranking.totalChallengesCompleted = completedCount;
    ranking.lastUpdate = Date.now();
    checkBadges(ranking);
    return ranking;
  }

  function checkBadges(ranking) {
    const daysSaved = Math.floor((Date.now() - ranking.startTime) / (24 * 60 * 60 * 1000));
    const timeMs = Date.now() - ranking.startTime;
    const completedCount = ranking.totalChallengesCompleted;

    Object.values(BADGES).forEach(badge => {
      const hasBadge = ranking.badges.includes(badge.id);
      const earnedBadge = badge.condition(completedCount, timeMs, daysSaved, ranking.challengeTimes || []);

      if (earnedBadge && !hasBadge) {
        ranking.badges.push(badge.id);
        showBadgeNotification(badge);
      }
    });

    ranking.points = computePoints(ranking);
    saveRanking(ranking);
  }

  function showBadgeNotification(badge) {
    const notification = document.createElement('div');
    notification.className = 'badge-notification';

    const content = document.createElement('div');
    content.className = 'badge-notification-content';

    const icon = document.createElement('span');
    icon.className = 'badge-icon';
    icon.textContent = badge.icon;

    const text = document.createElement('div');
    text.className = 'badge-text';

    const title = document.createElement('strong');
    title.textContent = 'Nova Badge!';

    const description = document.createElement('p');
    description.textContent = `${badge.name}: ${badge.description}`;

    const reward = document.createElement('span');
    reward.className = 'badge-reward';
    reward.textContent = `+${badge.reward} pontos!`;

    text.append(title, description, reward);
    content.append(icon, text);
    notification.appendChild(content);
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  function getBadgeInfo(badgeId) {
    return BADGES[badgeId];
  }

  function getAllBadges() {
    return Object.values(BADGES);
  }

  function getEarnedBadges() {
    const ranking = initRanking();
    return ranking.badges.map(id => BADGES[id]);
  }

  function resetRanking() {
    const defaultRanking = createDefaultRanking();
    localStorage.removeItem(RANKING_STORAGE_KEY);
    localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(defaultRanking));
    updateRankingDisplay();
  }

  function updateRankingDisplay() {
    const ranking = initRanking();
    const pointsValue = document.getElementById('points-value');
    const badgesContainer = document.getElementById('earned-badges');

    if (pointsValue) {
      pointsValue.textContent = ranking.points;
    }

    if (badgesContainer) {
      badgesContainer.replaceChildren();

      const earnedBadges = getEarnedBadges();

      if (earnedBadges.length === 0) {
        const emptyState = document.createElement('p');
        emptyState.className = 'no-badges';
        emptyState.textContent = 'Ganhe conquistas completando desafios!';
        badgesContainer.appendChild(emptyState);
        return;
      }

      earnedBadges.forEach((badge) => {
        const badgeItem = document.createElement('div');
        badgeItem.className = 'badge-item-earned';
        badgeItem.title = badge.description;

        const icon = document.createElement('span');
        icon.className = 'badge-icon';
        icon.textContent = badge.icon;

        const name = document.createElement('span');
        name.className = 'badge-name';
        name.textContent = badge.name;

        badgeItem.append(icon, name);
        badgesContainer.appendChild(badgeItem);
      });
    }
  }

  window.rankingSystem = {
    getRankingData,
    updatePoints,
    setChallengeTimes,
    checkBadges,
    getEarnedBadges,
    getAllBadges,
    resetRanking,
    getBadgeInfo,
    updateRankingDisplay,
    TOTAL_CHALLENGES,
    MAX_POINTS
  };
})();
