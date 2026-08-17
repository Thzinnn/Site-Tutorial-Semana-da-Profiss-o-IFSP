(function () {
  'use strict';

  const RANKING_STORAGE_KEY = 'desafios-ranking-v1';
  const POINTS_PER_CHALLENGE = 100;
  const TOTAL_CHALLENGES = 5;
  const MAX_POINTS = POINTS_PER_CHALLENGE * TOTAL_CHALLENGES;

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
    const saved = localStorage.getItem(RANKING_STORAGE_KEY);
    if (!saved) {
      const newRanking = {
        version: 1,
        points: 0,
        totalChallengesCompleted: 0,
        badges: [],
        startTime: Date.now(),
        lastUpdate: Date.now(),
        challengeTimes: []
      };
      localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(newRanking));
      return newRanking;
    }
    return JSON.parse(saved);
  }

  function saveRanking(data) {
    localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(data));
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
    notification.innerHTML = `
      <div class="badge-notification-content">
        <span class="badge-icon">${badge.icon}</span>
        <div class="badge-text">
          <strong>Nova Badge!</strong>
          <p>${badge.name}: ${badge.description}</p>
          <span class="badge-reward">+${badge.reward} pontos!</span>
        </div>
      </div>
    `;
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
    localStorage.removeItem(RANKING_STORAGE_KEY);
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
      const earnedBadges = getEarnedBadges();
      badgesContainer.innerHTML = earnedBadges
        .map(badge => `
          <div class="badge-item-earned" title="${badge.description}">
            <span class="badge-icon">${badge.icon}</span>
            <span class="badge-name">${badge.name}</span>
          </div>
        `)
        .join('');
      
      if (earnedBadges.length === 0) {
        badgesContainer.innerHTML = '<p class="no-badges">Ganhe badges completando desafios!</p>';
      }
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
