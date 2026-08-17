(function () {
  'use strict';

  const CHALLENGES = [
    'Faça a tartaruga desenhar um quadrado. Cada lado deve ter 100 passos. A tartaruga deve terminar no ponto onde começou.',
    'Faça a tartaruga desenhar uma escada com 3 degraus. Cada degrau deve ter: 50 passos de comprimento e 30 passos de altura.',
    'Faça um desenho utilizando três formas geométricas simples. Um quadrado no lado esquerdo da tela. Um triângulo no lado direito da tela. Um hexagono no centro, entre o quadrado e o triângulo. As três formas devem ficar separadas e formar uma composição organizada.',
    'Faça a tartaruga desenhar a primeira letra do seu nome. Desafio extra: a letra deve ser formada apenas por linhas retas. Tente fazer a letra com o menor número possível de movimentos.',
    'Faça um desenho ou forma da sua escolha. Esse é o desafio final, use sua imaginação e utilizando o que você aprendeu, utilize a tartaruga para fazer algo da sua escolha.'
  ];

  const state = {
    index: 0,
    phase: 'idle',
    startTs: null,
    times: Array(CHALLENGES.length).fill(null),
    timerId: null,
  };

  function formatarTempo(ms) {
    if (!Number.isFinite(ms) || ms < 0) {
      return '00:00.0';
    }

    const totalCentisegundos = Math.floor(ms / 10);
    const minutos = Math.floor(totalCentisegundos / 6000);
    const segundos = Math.floor((totalCentisegundos % 6000) / 100);
    const centesimos = totalCentisegundos % 100;

    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}.${centesimos}`;
  }

  function getChallengeFields() {
    return {
      telaEntrada: document.getElementById('telaEntrada'),
      indiceDesafio: document.getElementById('indiceDesafio'),
      desafioAtual: document.getElementById('desafioAtual'),
      desafioTexto: document.getElementById('desafioTexto'),
      checkbox: document.getElementById('checkboxDesafio'),
      painelUltimoTempo: document.getElementById('painelUltimoTempo'),
      ultimoTempo: document.getElementById('ultimoTempoTexto'),
      cronometro: document.getElementById('cronometro'),
      btnProximo: document.getElementById('btnProximo'),
      btnPlay: document.getElementById('btnPlay'),
      telaFinal: document.getElementById('telaFinal'),
      resumoFinal: document.getElementById('resumoFinal'),
    };
  }

  function persistChallengeTimes() {
    if (!window.rankingSystem || typeof window.rankingSystem.setChallengeTimes !== 'function') {
      return;
    }

    const serializedTimes = state.times.map((time) => {
      if (typeof time !== 'number' || !Number.isFinite(time)) {
        return null;
      }
      return time;
    });

    window.rankingSystem.setChallengeTimes(serializedTimes);
  }

  function syncStateFromRanking() {
    if (!window.rankingSystem || typeof window.rankingSystem.getRankingData !== 'function') {
      return;
    }

    const ranking = window.rankingSystem.getRankingData();
    if (!Array.isArray(ranking.challengeTimes)) {
      state.times = Array(CHALLENGES.length).fill(null);
      return;
    }

    state.times = ranking.challengeTimes.map((value) => Number.isFinite(value) ? Number(value) : null);
    if (state.times.length < CHALLENGES.length) {
      while (state.times.length < CHALLENGES.length) {
        state.times.push(null);
      }
    }
  }

  function atualizarCronometro() {
    const fields = getChallengeFields();
    if (!fields.cronometro || state.phase !== 'running') {
      return;
    }

    const elapsed = state.startTs ? Date.now() - state.startTs : 0;
    fields.cronometro.textContent = formatarTempo(elapsed);
  }

  function iniciarCronometro() {
    if (state.timerId) {
      clearInterval(state.timerId);
    }

    state.startTs = Date.now();
    atualizarCronometro();

    state.timerId = setInterval(() => {
      if (state.phase === 'running') {
        atualizarCronometro();
      }
    }, 100);
  }

  function renderDesafioAtual() {
    const fields = getChallengeFields();
    if (!fields.desafioTexto || !fields.indiceDesafio || !fields.checkbox) {
      return;
    }

    const challengeIndex = state.index;
    const challengeText = CHALLENGES[challengeIndex];

    fields.indiceDesafio.textContent = `Desafio ${challengeIndex + 1} de ${CHALLENGES.length}`;
    fields.desafioTexto.textContent = challengeText;

    const isCompleted = typeof state.times[challengeIndex] === 'number';
    fields.checkbox.checked = isCompleted;
    fields.checkbox.disabled = isCompleted;
    fields.btnProximo.classList.toggle('hidden', !isCompleted || state.phase !== 'running');
    fields.desafioAtual.classList.toggle('hidden', state.phase !== 'running');
    fields.telaEntrada.classList.toggle('hidden', state.phase === 'running' || state.phase === 'done');
    fields.telaFinal.classList.toggle('hidden', state.phase !== 'done');
    fields.cronometro.classList.add('hidden');
    fields.painelUltimoTempo.classList.toggle('hidden', !isCompleted || state.phase !== 'running');

    if (isCompleted) {
      fields.ultimoTempo.textContent = formatarTempo(state.times[challengeIndex]);
    }

    if (fields.btnPlay) {
      fields.btnPlay.classList.toggle('hidden', state.phase === 'running' || state.phase === 'done');
    }
  }

  function renderFinal() {
    const fields = getChallengeFields();
    if (!fields.telaFinal || !fields.resumoFinal || !fields.desafioAtual) {
      return;
    }

    const total = state.times.filter((time) => typeof time === 'number').length;
    const tempoTotal = state.times
      .filter((time) => typeof time === 'number')
      .reduce((acc, time) => acc + time, 0);

    fields.resumoFinal.innerHTML = `
      <h2>Parabéns!</h2>
      <p>Você concluiu ${total} de ${CHALLENGES.length} desafios.</p>
      <p>Tempo total: ${formatarTempo(tempoTotal)}</p>
    `;

    fields.telaFinal.classList.remove('hidden');
    fields.desafioAtual.classList.add('hidden');
    fields.cronometro.classList.add('hidden');
    fields.telaEntrada.classList.add('hidden');
    fields.painelUltimoTempo.classList.add('hidden');
    fields.btnProximo.classList.add('hidden');
    if (fields.btnPlay) {
      fields.btnPlay.classList.add('hidden');
    }
  }

  function concluirDesafio() {
    if (state.phase !== 'running') {
      return;
    }

    const fields = getChallengeFields();
    if (!fields.checkbox || !fields.ultimoTempo) {
      return;
    }

    if (fields.checkbox.checked === false && typeof state.times[state.index] === 'number') {
      fields.checkbox.checked = true;
      return;
    }

    const elapsed = Date.now() - (state.startTs || Date.now());
    state.times[state.index] = elapsed;
    fields.checkbox.checked = true;
    fields.checkbox.disabled = true;

    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }

    state.startTs = Date.now();
    fields.ultimoTempo.textContent = formatarTempo(elapsed);
    fields.painelUltimoTempo.classList.remove('hidden');
    fields.btnProximo.classList.remove('hidden');
    persistChallengeTimes();
  }

  function proximoDesafio() {
    const fields = getChallengeFields();
    if (!fields.checkbox) {
      return;
    }

    if (typeof state.times[state.index] !== 'number') {
      fields.checkbox.checked = true;
      concluirDesafio();
      return;
    }

    if (state.index >= CHALLENGES.length - 1) {
      state.phase = 'done';
      renderFinal();
      return;
    }

    state.index += 1;
    state.phase = 'running';
    fields.checkbox.checked = false;
    fields.checkbox.disabled = false;
    fields.btnProximo.classList.add('hidden');
    iniciarCronometro();
    renderDesafioAtual();
  }

  function iniciarPartida() {
    state.index = 0;
    state.phase = 'running';
    state.times = Array(CHALLENGES.length).fill(null);
    state.startTs = Date.now();

    if (state.timerId) {
      clearInterval(state.timerId);
    }

    persistChallengeTimes();
    renderDesafioAtual();
    iniciarCronometro();
  }

  function resetChallengeMode() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }

    state.index = 0;
    state.phase = 'idle';
    state.startTs = null;
    state.times = Array(CHALLENGES.length).fill(null);

    const fields = getChallengeFields();
    if (!fields) {
      return;
    }

    if (fields.checkbox) {
      fields.checkbox.checked = false;
      fields.checkbox.disabled = false;
    }

    if (fields.cronometro) {
      fields.cronometro.textContent = '00:00.0';
    }

    if (fields.ultimoTempo) {
      fields.ultimoTempo.textContent = '00:00.0';
    }

    if (fields.painelUltimoTempo) {
      fields.painelUltimoTempo.classList.add('hidden');
    }

    if (fields.desafioAtual) {
      fields.desafioAtual.classList.add('hidden');
    }

    if (fields.telaEntrada) {
      fields.telaEntrada.classList.remove('hidden');
    }

    if (fields.telaFinal) {
      fields.telaFinal.classList.add('hidden');
    }

    if (fields.btnProximo) {
      fields.btnProximo.classList.add('hidden');
    }

    if (fields.btnPlay) {
      fields.btnPlay.classList.remove('hidden');
    }

    if (fields.indiceDesafio) {
      fields.indiceDesafio.textContent = 'Desafio 1 de 5';
    }

    if (fields.desafioTexto) {
      fields.desafioTexto.textContent = CHALLENGES[0];
    }

    persistChallengeTimes();
  }

  function bindEvents() {
    const fields = getChallengeFields();
    if (!fields.checkbox || !fields.btnProximo || !fields.btnPlay) {
      return;
    }

    fields.btnPlay.addEventListener('click', iniciarPartida);
    fields.btnProximo.addEventListener('click', proximoDesafio);

    fields.checkbox.addEventListener('change', function handleCheckboxChange() {
      if (state.phase !== 'running') {
        return;
      }

      if (this.checked) {
        concluirDesafio();
      } else if (typeof state.times[state.index] === 'number') {
        this.checked = true;
      }
    });
  }

  function initChallengeMode() {
    bindEvents();
    syncStateFromRanking();
    resetChallengeMode();

    const fields = getChallengeFields();
    if (fields && fields.btnPlay) {
      fields.btnPlay.textContent = '▶ Play';
    }

    const originalClearProgress = window.clearProgress;
    window.clearProgress = function clearProgressWrapper() {
      if (typeof originalClearProgress === 'function') {
        originalClearProgress();
      }
      resetChallengeMode();
    };
  }

  document.addEventListener('DOMContentLoaded', initChallengeMode);

  window.challengeMode = {
    CHALLENGES,
    state,
    formatarTempo,
    iniciarPartida,
    concluirDesafio,
    proximoDesafio,
    resetChallengeMode,
    iniciarCronometro,
  };
})();
