(() => {
  'use strict';

  const castaways = ['Milo', 'Luna', 'Kai', 'Sloane', 'Dex', 'June', 'Theo'];
  const $ = (id) => document.getElementById(id);

  const ui = {
    challengeModal: $('challengeModal'),
    challengeHeading: $('challengeHeading'),
    challengeRead: $('challengeRead'),
    challengeStatus: $('challengeStatus'),
    continueButton: $('challengeRestartButton'),
    tribalModal: $('tribalModal'),
    tribalHeading: $('tribalHeading'),
    tribalRead: $('tribalRead'),
    tribalTimer: $('tribalTimer'),
    tribalCandidates: $('tribalCandidates'),
    tribalVoteStatus: $('tribalVoteStatus'),
    tribalCastButton: $('tribalCastButton'),
    tribalTally: $('tribalTally'),
    tribalRestartButton: $('tribalRestartButton'),
    timerText: $('timerText'),
    phaseIcon: $('phaseIcon'),
    phaseTitle: $('phaseTitle'),
    phaseSubtitle: $('phaseSubtitle'),
    startButton: $('startButton')
  };

  let durationSeconds = 30;
  let spectatorOnly = false;
  let selectedVote = null;
  let voteCast = false;
  let npcVotes = [];
  let intervalId = null;
  let endsAt = 0;

  async function loadConfig() {
    try {
      const response = await fetch('/api/config');
      if (!response.ok) return;
      const config = await response.json();
      durationSeconds = config.tribalCouncil?.durationSeconds ?? 30;
    } catch (_) {
      // Keep the 30-second fallback for standalone UI testing.
    }
  }

  function choose(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function currentChallengeWasWon() {
    return /wins/i.test(ui.challengeHeading?.textContent || '');
  }

  function updateChallengeResultCopy() {
    const won = currentChallengeWasWon();
    if (!ui.continueButton || ui.continueButton.classList.contains('hidden')) return;

    ui.continueButton.textContent = 'Continue to Tribal Council';
    if (won) {
      ui.challengeRead.textContent = 'You won the challenge. At Tribal Council you will have active voting controls.';
      ui.challengeStatus.textContent = '🏆 IMMUNITY! Continue to Tribal Council.';
    } else {
      ui.challengeRead.textContent = 'You lost the challenge. You may watch Tribal Council, but you cannot vote or participate.';
      ui.challengeStatus.textContent = '👁 Tribal Council will be spectator-only.';
    }
  }

  function renderCandidates() {
    ui.tribalCandidates.innerHTML = castaways.map((name) => {
      const selected = selectedVote === name ? ' selected' : '';
      const disabled = spectatorOnly || voteCast ? ' disabled' : '';
      return `<button type="button" class="tribal-candidate${selected}" data-vote="${name}"${disabled}>${name}</button>`;
    }).join('');
  }

  function startCouncil() {
    spectatorOnly = !currentChallengeWasWon();
    selectedVote = null;
    voteCast = false;
    npcVotes = castaways.map(() => choose(castaways));
    endsAt = Date.now() + durationSeconds * 1000;

    ui.challengeModal.classList.add('hidden');
    ui.tribalModal.classList.remove('hidden');
    ui.tribalTally.classList.add('hidden');
    ui.tribalTally.innerHTML = '';
    ui.tribalRestartButton.classList.add('hidden');
    ui.tribalCastButton.classList.toggle('hidden', spectatorOnly);
    ui.tribalCastButton.disabled = true;
    ui.tribalCastButton.textContent = 'Cast Vote';

    ui.tribalHeading.textContent = spectatorOnly ? 'Tribal Council — Spectating' : 'Tribal Council — Vote';
    ui.tribalRead.textContent = spectatorOnly
      ? 'You lost the challenge, so you can watch this 30-second Tribal Council but cannot vote or participate.'
      : 'You have 30 seconds to choose a castaway and cast one secret vote.';
    ui.tribalVoteStatus.textContent = spectatorOnly
      ? 'Spectator mode: voting and participation controls are disabled.'
      : 'Choose a castaway to vote for.';
    ui.tribalVoteStatus.classList.toggle('spectator', spectatorOnly);

    ui.phaseIcon.textContent = '🗳️';
    ui.phaseTitle.textContent = 'TRIBAL COUNCIL';
    ui.phaseSubtitle.textContent = spectatorOnly ? 'Spectating only — no participation.' : 'Choose carefully. One vote.';

    renderCandidates();
    tick();
    clearInterval(intervalId);
    intervalId = setInterval(tick, 100);
  }

  function tick() {
    const remaining = Math.max(0, (endsAt - Date.now()) / 1000);
    const whole = Math.ceil(remaining);
    ui.tribalTimer.textContent = String(whole);
    ui.timerText.textContent = `00:${String(whole).padStart(2, '0')}`;
    if (remaining <= 0) resolveCouncil();
  }

  function resolveCouncil() {
    clearInterval(intervalId);
    intervalId = null;

    const votes = [...npcVotes];
    if (!spectatorOnly && voteCast && selectedVote) votes.push(selectedVote);

    const tally = Object.fromEntries(castaways.map((name) => [name, 0]));
    votes.forEach((name) => { tally[name] += 1; });
    const maxVotes = Math.max(...Object.values(tally));
    const tied = castaways.filter((name) => tally[name] === maxVotes);
    const votedOut = choose(tied);
    const ordered = Object.entries(tally)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    ui.tribalTimer.textContent = '0';
    ui.timerText.textContent = '00:00';
    ui.tribalCastButton.classList.add('hidden');
    ui.tribalCandidates.querySelectorAll('button').forEach((button) => { button.disabled = true; });
    ui.tribalTally.classList.remove('hidden');
    ui.tribalTally.innerHTML = `<h2>Votes Revealed</h2><div class="vote-chips">${ordered.map(([name, count]) => `<span class="vote-chip">${name}: ${count}</span>`).join('')}</div><div class="voted-out">${votedOut} is voted out.</div>`;
    ui.tribalVoteStatus.textContent = spectatorOnly
      ? 'You watched the result as a spectator. No vote was cast on your behalf.'
      : voteCast ? `Your vote for ${selectedVote} was included.` : 'You did not cast a vote before time expired.';
    ui.tribalRestartButton.classList.remove('hidden');
    ui.phaseSubtitle.textContent = 'Votes revealed.';
  }

  ui.continueButton?.addEventListener('click', (event) => {
    if (ui.continueButton.classList.contains('hidden')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    startCouncil();
  }, true);

  ui.tribalCandidates?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-vote]');
    if (!button || spectatorOnly || voteCast) return;
    selectedVote = button.dataset.vote;
    ui.tribalCastButton.disabled = false;
    ui.tribalVoteStatus.textContent = `Your vote: ${selectedVote}. Cast it when ready.`;
    renderCandidates();
  });

  ui.tribalCastButton?.addEventListener('click', () => {
    if (spectatorOnly || voteCast || !selectedVote) return;
    voteCast = true;
    ui.tribalCastButton.disabled = true;
    ui.tribalCastButton.textContent = 'Vote Cast';
    ui.tribalVoteStatus.textContent = `Your vote for ${selectedVote} is locked in.`;
    renderCandidates();
  });

  ui.tribalRestartButton?.addEventListener('click', () => {
    clearInterval(intervalId);
    intervalId = null;
    ui.tribalModal.classList.add('hidden');
    ui.startButton.click();
  });

  const observer = new MutationObserver(updateChallengeResultCopy);
  if (ui.challengeHeading) observer.observe(ui.challengeHeading, { childList: true, subtree: true, characterData: true });
  if (ui.continueButton) observer.observe(ui.continueButton, { attributes: true, attributeFilter: ['class'] });

  loadConfig();
})();