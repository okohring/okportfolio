  canvas.addEventListener('click', (e) => {
    if (!running) return;
    const rect = canvas.getBoundingClientRect();
    const wx = clamp(e.clientX - rect.left + camera.x, 70, world.width - 70);
    const wy = clamp(e.clientY - rect.top + camera.y, 70, world.height - 70);
    const clickedBot = nearestBotToPoint(wx, wy, 54);
    if (clickedBot) {
      beginConversation(clickedBot, 'click');
      return;
    }
    const activeBot = conversation.botId ? bots.find(b => b.id === conversation.botId) : null;
    if (conversation.active && !(activeBot && activeBot.followingPlayer)) endConversation(true);
    player.destX = wx;
    player.destY = wy;
  });

  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') {
      if (e.key === 'Escape') chatInput.blur();
      return;
    }
    if (e.key === 'Escape' && conversation.active) {
      e.preventDefault(); endConversation(true); return;
    }
    if (phase === 'TUG' && e.code === 'Space') {
      e.preventDefault(); pull(); return;
    }
    if (e.key.toLowerCase() === 't') {
      e.preventDefault(); chatInput.focus(); return;
    }
    keys.add(e.key.toLowerCase());
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

  actionBar.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn || !running) return;
    doAction(btn.dataset.action);
  });

  conversationChips.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-say]');
    if (!btn || !running || !conversation.active) return;
    submitConversation(btn.dataset.say);
  });

  endConversationButton.addEventListener('click', () => endConversation(true));

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text || !running) return;
    if (conversation.active) {
      submitConversation(text);
      chatInput.value = '';
      return;
    }
    const z = zoneAt(player.x, player.y);
    const scope = z ? z.privacy : 'Path';
    addFeed(scope.includes('Private') ? 'private' : 'system', `You at ${z?.name || 'the path'}: ${text}`);
    chatInput.value = '';
    storyStats.publicChats += scope.includes('Public') ? 1 : 0;
    storyStats.privateSplits += scope.includes('Private') ? 1 : 0;
  });

  startButton.addEventListener('click', () => {
    startModal.classList.add('hidden');
    restart();
  });
  challengeStartButton.addEventListener('click', startChallenge);
  pullButton.addEventListener('click', pull);
  challengeContinueButton.addEventListener('click', startTribalCouncil);
  tribalCandidates.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-vote]');
    if (btn) chooseTribalVote(btn.dataset.vote);
  });
  tribalCastButton.addEventListener('click', castTribalVote);
  tribalRestartButton.addEventListener('click', restart);
  window.addEventListener('resize', resize);

  resize();
  initBots();
  updateZoneUI();
  renderFeed();
  loadConfig();
  requestAnimationFrame(tick);
