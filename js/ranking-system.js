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
      description: 'Complete todos os desafios em menos de 5 minutos',
      icon: '⚡🏃',
      condition: (completedCount, timeMs) => completedCount >= 5 && timeMs < 5 * 60 * 1000,
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

  function updatePoints(challengesCompleted) {
    const ranking = initRanking();
    ranking.points = challengesCompleted * POINTS_PER_CHALLENGE;
    ranking.totalChallengesCompleted = challengesCompleted;
    ranking.lastUpdate = Date.now();
    saveRanking(ranking);
    checkBadges(ranking);
    return ranking;
  }

  function checkBadges(ranking) {
    const daysSaved = Math.floor((Date.now() - ranking.startTime) / (24 * 60 * 60 * 1000));
    const timeMs = Date.now() - ranking.startTime;
    const completedCount = ranking.totalChallengesCompleted;

    Object.values(BADGES).forEach(badge => {
      const hasBadge = ranking.badges.includes(badge.id);
      const earnedBadge = badge.condition(completedCount, timeMs, daysSaved);

      if (earnedBadge && !hasBadge) {
        ranking.badges.push(badge.id);
        if (badge.id == "speedRunner") {
            ranking.points += badge.reward;
        };
        showBadgeNotification(badge);
      }
    });

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
