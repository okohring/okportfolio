  function updatePlayer(dt) {
    const keyboardSpeed = player.speed * dt;
    let kx = 0, ky = 0;
    if (keys.has('w') || keys.has('arrowup')) ky -= 1;
    if (keys.has('s') || keys.has('arrowdown')) ky += 1;
    if (keys.has('a') || keys.has('arrowleft')) kx -= 1;
    if (keys.has('d') || keys.has('arrowright')) kx += 1;
    if (kx || ky) {
      const len = Math.hypot(kx, ky) || 1;
      player.x = clamp(player.x + (kx / len) * keyboardSpeed, 90, world.width - 90);
      player.y = clamp(player.y + (ky / len) * keyboardSpeed, 90, world.height - 90);
      player.destX = player.x;
      player.destY = player.y;
      player.moving = true;
      checkConversationDistance();
      maybeStartPendingConversation();
      return;
    }
    moveToward(player, dt);
    checkConversationDistance();
    maybeStartPendingConversation();
  }

  function updateBots(dt) {
    for (const bot of bots) {
      if (bot.holdTimer > 0) bot.holdTimer = Math.max(0, bot.holdTimer - dt);
      if (bot.followingPlayer && conversation.botId === bot.id) {
        const offset = followOffsetFor(bot);
        bot.destX = clamp(player.x + offset.x, 70, world.width - 70);
        bot.destY = clamp(player.y + offset.y, 70, world.height - 70);
        moveToward(bot, dt);
        bot.zoneId = zoneAt(bot.x, bot.y)?.id || null;
        continue;
      }
      if (bot.lockedBy === player.id || bot.holdTimer > 0) {
        bot.destX = bot.x;
        bot.destY = bot.y;
        bot.moving = false;
        bot.zoneId = zoneAt(bot.x, bot.y)?.id || null;
        continue;
      }
      bot.nextDecision -= dt;
      if (bot.nextDecision <= 0 && distance(bot.x, bot.y, bot.destX, bot.destY) < 20) {
        decideBotMove(bot);
      }
      moveToward(bot, dt);
      bot.zoneId = zoneAt(bot.x, bot.y)?.id || null;
    }
  }

  function decideBotMove(bot) {
    if (bot.lockedBy || bot.holdTimer > 0) return;
    bot.nextDecision = 5 + Math.random() * 10;
    if (Math.random() < 0.38) {
      const available = bots.filter(b => b !== bot && !b.pairingWith);
      const partner = randomChoice(available);
      const privateZones = zones.filter(z => ['Private', 'Private-ish'].includes(z.privacy));
      if (partner) {
        sendPairToZone(bot, partner, randomChoice(privateZones));
        return;
      }
    }
    bot.pairingWith = null;
    const likely = weightedZoneChoice();
    const p = randomPointNear(likely.x, likely.y, likely.r * 0.65);
    bot.destX = p.x; bot.destY = p.y;
    maybeNarrateSoloMove(bot, likely);
  }

  function sendPairToZone(a, b, zone) {
    a.pairingWith = b.id;
    b.pairingWith = a.id;
    a.followingPlayer = false; b.followingPlayer = false;
    a.lockedBy = null; b.lockedBy = null;
    const p1 = randomPointNear(zone.x - 28, zone.y, zone.r * 0.38);
    const p2 = { x: p1.x + 48 + Math.random() * 28, y: p1.y + (Math.random() - 0.5) * 38 };
    a.destX = p1.x; a.destY = p1.y;
    b.destX = p2.x; b.destY = p2.y;
    a.nextDecision = 10 + Math.random() * 10;
    b.nextDecision = 10 + Math.random() * 10;
    storyStats.privateSplits++;
    addFeed(zone.privacy === 'Private' ? 'warning' : 'private', `${a.name} and ${b.name} drifted toward ${zone.name}.`);
  }

  function maybeNarrateSoloMove(bot, zone) {
    if (Math.random() > 0.55) return;
    const snippets = {
      fire: `${bot.name} is hovering near the fire, watching the group.`,
      shelter: `${bot.name} headed to the shelter with a useful excuse.`,
      workshop: `${bot.name} is making themself look busy at the workstation.`,
      forest: `${bot.name} slipped onto the forest trail alone.`,
      grove: `${bot.name} disappeared into the hidden grove.`,
      cove: `${bot.name} walked down toward the beach cove.`,
      dock: `${bot.name} is killing time near the dock.`,
      lookout: `${bot.name} climbed to the lookout cliff.`,
      well: `${bot.name} is chatting near the water well.`,
      tribeMat: `${bot.name} is waiting by the tribe mat.`
    };
    addFeed(zone.privacy === 'Private' ? 'warning' : 'system', snippets[zone.id] || `${bot.name} moved to ${zone.name}.`);
  }

  function weightedZoneChoice() {
    const pool = [
      getZone('fire'), getZone('fire'), getZone('shelter'), getZone('well'),
      getZone('workshop'), getZone('dock'), getZone('forest'), getZone('cove'),
      getZone('lookout'), getZone('grove')
    ];
    return randomChoice(pool);
  }

  function moveToward(actor, dt) {
    const dx = actor.destX - actor.x;
    const dy = actor.destY - actor.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 3) {
      actor.x = actor.destX; actor.y = actor.destY; actor.moving = false;
      return;
    }
    const step = Math.min(dist, actor.speed * dt);
    actor.x += (dx / dist) * step;
    actor.y += (dy / dist) * step;
    actor.moving = true;
  }

  function updateCamera(dt) {
    const targetX = player.x - window.innerWidth / 2;
    const targetY = player.y - window.innerHeight / 2;
    camera.x += (targetX - camera.x) * Math.min(1, 6 * dt);
    camera.y += (targetY - camera.y) * Math.min(1, 6 * dt);
    camera.x = clamp(camera.x, 0, Math.max(0, world.width - window.innerWidth));
    camera.y = clamp(camera.y, 0, Math.max(0, world.height - window.innerHeight));
  }

  function updateZoneUI() {
    const z = zoneAt(player.x, player.y);
    const prev = player.zoneId;
    player.zoneId = z?.id || null;
    if (z && prev !== z.id) {
      addFeed('system', `You entered ${z.name}. ${z.privacy} zone.`);
    }
    if (!z) {
      zoneName.textContent = 'Between Zones';
      zoneRead.textContent = 'You are on the paths. Good for watching movement, not great for private talk.';
      renderActions(withTalkActions(['Walk', 'Look Around', 'Open Map']));
    } else {
      zoneName.textContent = `${z.name} · ${z.privacy}`;
      const nearby = nearbyActors(z).filter(a => a.id !== 'you').map(a => a.name);
      const nearbyText = nearby.length ? ` Nearby: ${nearby.slice(0, 3).join(', ')}${nearby.length > 3 ? '…' : ''}` : ' Nobody is close enough to talk.';
      zoneRead.textContent = z.read + nearbyText;
      renderActions(withTalkActions(z.actions));
    }
  }

  function renderActions(actions) {
    const current = actionBar.dataset.actions;
    const next = actions.join('|');
    if (current === next) return;
    actionBar.dataset.actions = next;
    actionBar.innerHTML = actions.map((label, idx) => `<button class="${idx === 0 ? 'primary' : ''}" data-action="${escapeHtml(label)}">${iconFor(label)} ${escapeHtml(label)}</button>`).join('');
  }

  function iconFor(label) {
    const lower = label.toLowerCase();
    if (lower.startsWith('talk:') || lower.includes('conversation')) return '🗣️';
    if (lower.includes('vote')) return '🗳️';
    if (lower.includes('trust')) return '🤝';
    if (lower.includes('press')) return '⚡';
    if (lower.includes('whisper') || lower.includes('chat') || lower.includes('speak') || lower.includes('huddle')) return '💬';
    if (lower.includes('food') || lower.includes('fish')) return '🥥';
    if (lower.includes('gather') || lower.includes('wood')) return '🪓';
    if (lower.includes('water')) return '🪣';
    if (lower.includes('shore')) return '🎣';
    if (lower.includes('scout') || lower.includes('observe') || lower.includes('look')) return '🔭';
    if (lower.includes('search') || lower.includes('clue')) return '🔎';
    if (lower.includes('craft') || lower.includes('repair')) return '🔨';
    if (lower.includes('pact')) return '🤝';
    if (lower.includes('rest')) return '⛺';
    return '•';
  }

  function doAction(label) {
    const z = zoneAt(player.x, player.y);
    const type = label.toLowerCase();
    if (type === 'end conversation') { endConversation(true); return; }
    if (type === 'ask vote') { submitConversation('What are you hearing about the vote?'); return; }
    if (type === 'build trust') { submitConversation('I want to work together, but quietly.'); return; }
    if (type === 'ask to walk') { submitConversation('Come with me somewhere private.'); return; }
    if (type === 'press for name') { submitConversation('Tell me a name. Who is in trouble?'); return; }
    if (type.startsWith('talk:')) {
      const name = label.split(':').slice(1).join(':').trim();
      const bot = bots.find(b => b.name.toLowerCase() === name.toLowerCase());
      if (bot) beginConversation(bot, 'button');
      return;
    }
    if (type.includes('whisper') || type.includes('pact')) {
      const nearby = nearbyActors(z || player).filter(a => a.id !== 'you');
      if (nearby.length) addFeed('private', `You pulled ${nearby[0].name} into a quiet side conversation near ${z?.name || 'the path'}.`);
      else addFeed('warning', 'You tried to whisper, but nobody is close enough. That looked awkward.');
      storyStats.privateSplits++;
    } else if (type.includes('speak') || type.includes('huddle') || type.includes('chat')) {
      addFeed('system', `You spoke openly at ${z?.name || 'camp'}. Everyone nearby can react to that.`);
      storyStats.publicChats++;
    } else if (type.includes('fire')) {
      bumpMeter('fire', 8); addFeed('system', 'You tended the fire. Useful, visible, socially safe.'); storyStats.taskActions++;
    } else if (type.includes('water')) {
      bumpMeter('water', 8); addFeed('system', 'You collected water. People notice you helping without overplaying.'); storyStats.taskActions++;
    } else if (type.includes('food') || type.includes('fish')) {
      bumpMeter('food', 8); addFeed('system', 'You gathered food for camp. Useful work gives you a natural reason to move around.'); storyStats.taskActions++;
    } else if (type.includes('shelter') || type.includes('repair')) {
      bumpMeter('shelter', 8); addFeed('system', 'You worked on the shelter. A boring action, which is sometimes good strategy.'); storyStats.taskActions++;
    } else if (type.includes('search') || type.includes('scout') || type.includes('observe') || type.includes('listen')) {
      const suspicious = findSuspiciousPair();
      if (suspicious) addFeed('warning', `You noticed ${suspicious.a.name} and ${suspicious.b.name} spending a long time near ${suspicious.zone.name}.`);
      else addFeed('system', 'You watched the camp routes. No obvious pair looked locked in yet.');
    } else {
      addFeed('system', `You chose: ${label}.`);
    }
  }


  function withTalkActions(actions) {
    if (conversation.active) return ['End Conversation', ...conversationChipsForActions()];
    const nearby = nearbyBotsToPlayer(155).slice(0, 3);
    const talkActions = nearby.map(bot => `Talk: ${bot.name}`);
    return [...talkActions, ...actions];
  }

  function conversationChipsForActions() {
    return ['Ask Vote', 'Build Trust', 'Ask to Walk', 'Press for Name'];
  }

  function nearestBotToPoint(x, y, maxDist = 58) {
    let best = null;
    let bestDist = maxDist;
    for (const bot of bots) {
      const d = distance(x, y, bot.x, bot.y);
      if (d < bestDist) { best = bot; bestDist = d; }
    }
    return best;
  }

  function nearbyBotsToPlayer(maxDist = 160) {
    return bots
      .map(bot => ({ bot, d: distance(player.x, player.y, bot.x, bot.y) }))
      .filter(item => item.d <= maxDist)
      .sort((a, b) => a.d - b.d)
      .map(item => item.bot);
  }

