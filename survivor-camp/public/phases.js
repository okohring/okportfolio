  function startChallenge() {
    phase = 'TUG';
    challengeRemaining = config.tugOfWar.durationSeconds;
    tugPosition = 0;
    lastChallengeWon = null;
    phaseEnd.classList.add('hidden');
    challengeModal.classList.remove('hidden');
    pullButton.classList.remove('hidden');
    challengeContinueButton.classList.add('hidden');
    challengeHeading.textContent = 'Tug of War';
    challengeRead.innerHTML = 'Mash <strong>PULL!</strong> or press <strong>Space</strong>. Get the knot onto your side before time runs out.';
    challengeStatus.textContent = 'Dead even — pull!';
    phaseIcon.textContent = '🪢';
    phaseTitle.textContent = 'TUG OF WAR';
    document.getElementById('phaseSubtitle').textContent = 'Win immunity or face Tribal Council.';
    updateTugUI();
  }

  function pull() {
    if (phase !== 'TUG') return;
    const t = config.tugOfWar;
    tugPosition = clamp(tugPosition + t.playerPullPerInput, -t.winThreshold, t.winThreshold);
    if (tugPosition >= t.winThreshold) finishChallenge(true);
    updateTugUI();
  }

  function updateTug(dt) {
    if (phase !== 'TUG') return;
    challengeRemaining = Math.max(0, challengeRemaining - dt);
    const t = config.tugOfWar;
    const enemy = t.opponentPullPerSecond + Math.sin(performance.now() / 260) * t.opponentWaveAmplitude;
    tugPosition = clamp(tugPosition - enemy * dt, -t.winThreshold, t.winThreshold);
    if (tugPosition <= -t.winThreshold) finishChallenge(false);
    else if (challengeRemaining <= 0) finishChallenge(tugPosition > 0);
    updateTugUI();
  }

  function updateTugUI() {
    const t = config.tugOfWar;
    tugKnot.style.left = `${50 + (tugPosition / t.winThreshold) * 46}%`;
    challengeTimer.textContent = challengeRemaining.toFixed(1);
    timerText.textContent = formatClock(challengeRemaining);
    challengeStatus.textContent = tugPosition > 45 ? 'Your tribe is taking control!' : tugPosition > 8 ? 'You have the edge — keep pulling!' : tugPosition < -45 ? 'They are dragging you hard — mash!' : tugPosition < -8 ? 'The other tribe has the edge!' : 'Dead even — pull!';
  }

  function finishChallenge(won) {
    if (phase !== 'TUG') return;
    phase = 'CHALLENGE_RESULT';
    lastChallengeWon = won;
    pullButton.classList.add('hidden');
    challengeContinueButton.classList.remove('hidden');
    timerText.textContent = '00:00';
    challengeHeading.textContent = won ? 'Your Tribe Wins Immunity!' : 'Your Tribe Loses Immunity';
    challengeRead.textContent = won
      ? 'You are safe. You can view the losing tribe’s Tribal Council, but you will not participate or vote.'
      : 'Your tribe is going to Tribal Council. You will participate and cast a vote.';
    challengeStatus.textContent = won ? '🏆 SAFE — SPECTATOR AT TRIBAL' : '🗳️ GOING TO TRIBAL — YOU WILL VOTE';
  }

  function startTribalCouncil() {
    if (lastChallengeWon === null) return;
    phase = 'TRIBAL';
    tribalRemaining = config.tribalCouncil.durationSeconds;
    // Winning immunity means spectator-only. Losing means active participation.
    tribalSpectator = lastChallengeWon === true;
    tribalRoster = tribalSpectator ? [...opponentNames] : [...botNames];
    selectedVote = null;
    voteCast = false;
    npcVotes = tribalRoster.map(voter => {
      const choices = tribalRoster.filter(name => name !== voter);
      return randomChoice(choices);
    });
    challengeModal.classList.add('hidden');
    tribalModal.classList.remove('hidden');
    tribalTally.classList.add('hidden');
    tribalTally.innerHTML = '';
    tribalRestartButton.classList.add('hidden');
    tribalCastButton.classList.toggle('hidden', tribalSpectator);
    tribalCastButton.disabled = true;
    tribalCastButton.textContent = 'Cast Vote';
    tribalHeading.textContent = tribalSpectator ? 'Tribal Council — Spectating' : 'Tribal Council — Your Tribe';
    tribalRead.textContent = tribalSpectator
      ? 'Your tribe won immunity. You are only viewing the losing tribe’s 30-second Tribal Council; you cannot vote or participate.'
      : 'Your tribe lost immunity. You have 30 seconds to choose a castaway and cast one secret vote.';
    tribalVoteStatus.textContent = tribalSpectator ? 'Spectator mode: no participation controls.' : 'Choose a castaway to vote for.';
    tribalVoteStatus.classList.toggle('spectator', tribalSpectator);
    phaseIcon.textContent = '🗳️';
    phaseTitle.textContent = 'TRIBAL COUNCIL';
    document.getElementById('phaseSubtitle').textContent = tribalSpectator ? 'Viewing the losing tribe only.' : 'Your tribe must vote someone out.';
    renderTribalCandidates();
    updateTribalUI();
  }

  function renderTribalCandidates() {
    tribalCandidates.innerHTML = tribalRoster.map(name => {
      const selected = selectedVote === name ? ' selected' : '';
      const disabled = tribalSpectator || voteCast ? ' disabled' : '';
      return `<button type="button" class="tribal-candidate${selected}" data-vote="${escapeHtml(name)}"${disabled}>${escapeHtml(name)}</button>`;
    }).join('');
  }

  function chooseTribalVote(name) {
    if (phase !== 'TRIBAL' || tribalSpectator || voteCast || !tribalRoster.includes(name)) return;
    selectedVote = name;
    tribalCastButton.disabled = false;
    tribalVoteStatus.textContent = `Your vote: ${name}. Cast it when ready.`;
    renderTribalCandidates();
  }

  function castTribalVote() {
    if (phase !== 'TRIBAL' || tribalSpectator || voteCast || !selectedVote) return;
    voteCast = true;
    tribalCastButton.disabled = true;
    tribalCastButton.textContent = 'Vote Cast';
    tribalVoteStatus.textContent = `Your vote for ${selectedVote} is locked in.`;
    renderTribalCandidates();
  }

  function updateTribal(dt) {
    tribalRemaining = Math.max(0, tribalRemaining - dt);
    updateTribalUI();
    if (tribalRemaining <= 0) resolveTribalCouncil();
  }

  function updateTribalUI() {
    tribalTimer.textContent = String(Math.max(0, Math.ceil(tribalRemaining)));
    timerText.textContent = formatClock(tribalRemaining);
  }

  function resolveTribalCouncil() {
    if (phase !== 'TRIBAL') return;
    phase = 'TRIBAL_RESULT';
    const votes = [...npcVotes];
    if (!tribalSpectator && voteCast && selectedVote) votes.push(selectedVote);
    const counts = new Map();
    votes.forEach(name => counts.set(name, (counts.get(name) || 0) + 1));
    const ordered = [...counts.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const top = ordered[0]?.[1] || 0;
    const tied = ordered.filter(([,count]) => count === top).map(([name]) => name);
    const votedOut = randomChoice(tied);
    tribalTimer.textContent = '0';
    timerText.textContent = '00:00';
    tribalCastButton.classList.add('hidden');
    tribalCandidates.querySelectorAll('button').forEach(button => { button.disabled = true; });
    tribalTally.classList.remove('hidden');
    tribalTally.innerHTML = `<h2>Votes Revealed</h2><div class="vote-chips">${ordered.map(([name,count]) => `<span class="vote-chip">${escapeHtml(name)}: ${count}</span>`).join('')}</div><div class="voted-out">${escapeHtml(votedOut)} is voted out.</div>`;
    tribalVoteStatus.textContent = tribalSpectator ? 'You watched the losing tribe’s vote from the sidelines.' : (voteCast ? 'Your vote was included.' : 'Time expired before you cast a vote.');
    tribalRestartButton.classList.remove('hidden');
  }

  function tick(ts) {
    if (!lastTimestamp) lastTimestamp = ts;
    const dt = Math.min(0.033, (ts - lastTimestamp) / 1000);
    lastTimestamp = ts;

    if (running) {
      updatePlayer(dt);
      updateBots(dt);
      updateTimer(dt);
      updateZoneUI();
    }
    if (phase === 'TUG') updateTug(dt);
    if (phase === 'TRIBAL') updateTribal(dt);
    updateCamera(dt);
    draw();
    requestAnimationFrame(tick);
  }

