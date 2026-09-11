  function beginConversation(bot, source = 'direct') {
    if (!bot || !running) return;
    const d = distance(player.x, player.y, bot.x, bot.y);
    if (d > 170 && source !== 'approach') {
      pendingConversationId = bot.id;
      bot.holdTimer = 8;
      bot.destX = bot.x; bot.destY = bot.y;
      const p = pointBeside(bot, 78);
      player.destX = p.x; player.destY = p.y;
      addFeed('system', `You motioned to ${bot.name}. They pause while you walk over.`);
      return;
    }
    const prev = conversation.botId ? bots.find(b => b.id === conversation.botId) : null;
    if (prev && prev !== bot) releaseBot(prev);

    pendingConversationId = null;
    player.destX = player.x; player.destY = player.y;
    bot.destX = bot.x; bot.destY = bot.y;
    bot.lockedBy = player.id;
    bot.holdTimer = 0;
    bot.pairingWith = null;
    bot.nextDecision = 999;
    conversation = {
      active: true,
      botId: bot.id,
      log: [
        { who: 'system', text: `${bot.name} stops moving and gives you their attention.` },
        { who: 'npc', text: openerFor(bot) }
      ]
    };
    storyStats.conversations++;
    renderConversation();
    renderActions(withTalkActions(zoneAt(player.x, player.y)?.actions || ['Walk', 'Look Around', 'Open Map']));
    chatInput.placeholder = `Talk to ${bot.name}… try “who are you with?” or “come with me”`;
    addFeed('private', `You are talking with ${bot.name} near ${zoneAt(player.x, player.y)?.name || 'the path'}.`);
  }

  function releaseBot(bot) {
    if (!bot) return;
    bot.lockedBy = null;
    bot.holdTimer = 0;
    bot.followingPlayer = false;
    bot.nextDecision = 2 + Math.random() * 4;
  }

  function endConversation(announce = true) {
    const bot = conversation.botId ? bots.find(b => b.id === conversation.botId) : null;
    if (bot) releaseBot(bot);
    if (announce && conversation.active && bot) addFeed('system', `You ended the conversation with ${bot.name}.`);
    conversation = { active: false, botId: null, log: [] };
    pendingConversationId = null;
    conversationPanel.classList.add('hidden');
    chatInput.placeholder = 'Press T or click to say something at your current location…';
  }

  function renderConversation() {
    const bot = bots.find(b => b.id === conversation.botId);
    if (!conversation.active || !bot) {
      conversationPanel.classList.add('hidden');
      return;
    }
    conversationPanel.classList.remove('hidden');
    conversationName.textContent = bot.name;
    const zone = zoneAt(player.x, player.y);
    conversationRead.textContent = `${bot.name} is ${bot.mood}. ${zone ? zone.name + ' is a ' + zone.privacy.toLowerCase() + ' spot.' : 'You are between zones.'} They will stay put while this panel is open.`;
    conversationLog.innerHTML = conversation.log.slice(-5).map(line => `<div class="conversation-line ${line.who === 'you' ? 'you' : line.who === 'npc' ? 'npc' : 'system'}"><strong>${line.who === 'you' ? 'You' : line.who === 'npc' ? bot.name : 'Read'}:</strong> ${escapeHtml(line.text)}</div>`).join('');
    conversationLog.scrollTop = conversationLog.scrollHeight;
    const chips = ['What are you hearing?', 'Who are you with?', 'Come with me.', 'I want to work together.', 'Tell me a name.'];
    conversationChips.innerHTML = chips.map(text => `<button type="button" data-say="${escapeHtml(text)}">${escapeHtml(text)}</button>`).join('');
  }

  function addConversationLine(who, text) {
    conversation.log.push({ who, text });
    conversation.log = conversation.log.slice(-12);
    renderConversation();
  }

  function submitConversation(text) {
    const bot = bots.find(b => b.id === conversation.botId);
    if (!bot || !text.trim()) return;
    addConversationLine('you', text.trim());
    const reply = npcReply(bot, text.trim());
    addConversationLine('npc', reply);
    addFeed('private', `You and ${bot.name} are locked in conversation.`);
  }

  function npcReply(bot, text) {
    const lower = text.toLowerCase();
    const z = zoneAt(player.x, player.y);
    if (lower.includes('come') || lower.includes('walk') || lower.includes('private') || lower.includes('woods') || lower.includes('cove')) {
      bot.followingPlayer = true;
      bot.lockedBy = null;
      bot.nextDecision = 999;
      storyStats.privateSplits++;
      return randomChoice([
        'Okay. Move first, I’ll follow. But if everyone sees this, that’s on you.',
        'Fine, but make it look casual.',
        'I’ll walk with you. Don’t drag me somewhere too obvious.'
      ]);
    }
    if (lower.includes('vote') || lower.includes('name') || lower.includes('hearing') || lower.includes('target')) {
      const suspicious = findSuspiciousPair();
      if (suspicious && suspicious.a.id !== bot.id && suspicious.b.id !== bot.id) {
        return `I don’t know the vote yet, but ${suspicious.a.name} and ${suspicious.b.name} being off at ${suspicious.zone.name} is not nothing.`;
      }
      return randomChoice([
        'I’ve heard two names, but nobody is saying the same thing twice.',
        'People are pretending it’s simple. It is not simple.',
        'I’ll give you a name if you give me one first.'
      ]);
    }
    if (lower.includes('trust') || lower.includes('work') || lower.includes('together') || lower.includes('alliance')) {
      return randomChoice([
        'Maybe. I like that you came to me directly.',
        'I’m open, but I need to see where you go after this.',
        'We can talk, but I don’t want to look like a pair yet.'
      ]);
    }
    if (lower.includes('lie') || lower.includes('truth') || lower.includes('honest')) {
      return randomChoice([
        'The truth is everyone is acting calmer than they are.',
        'Honestly? I think someone is collecting options.',
        'I’ll be honest if you are. Don’t sell me a story.'
      ]);
    }
    if (lower.includes('calm') || lower.includes('safe') || lower.includes('okay')) {
      return randomChoice([
        'I want to believe that, but this camp is moving fast.',
        'Okay. Stay close then. Don’t vanish for five minutes.',
        'That helps, a little. But I’m watching the paths.'
      ]);
    }
    return randomChoice([
      `${bot.mood === 'nervous' ? 'I hear you, but I’m jumpy right now.' : 'I hear you.'} Keep talking.`,
      'That could mean something. Or it could get both of us in trouble.',
      `Say that again, but tell me what you actually want from ${z?.name || 'this conversation'}.`,
      'Okay. I’m listening, but I’m not committing in public.'
    ]);
  }

  function openerFor(bot) {
    const zone = zoneAt(bot.x, bot.y);
    const byMood = {
      busy: `I’m trying to look useful. Say something useful back.`,
      nervous: `Please tell me this is not about my name.`,
      scheming: `You picked an interesting time to talk. What are you offering?`,
      social: `Okay, good. I wanted to check in with you too.`,
      watching: `I was wondering when you’d come over.`
    };
    return `${byMood[bot.mood] || 'What’s up?'} ${zone ? 'We are close to ' + zone.name + '.' : ''}`;
  }

  function pointBeside(actor, dist) {
    const dx = player.x - actor.x;
    const dy = player.y - actor.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: clamp(actor.x + (dx / len) * dist, 70, world.width - 70), y: clamp(actor.y + (dy / len) * dist, 70, world.height - 70) };
  }

  function maybeStartPendingConversation() {
    if (!pendingConversationId || conversation.active) return;
    const bot = bots.find(b => b.id === pendingConversationId);
    if (!bot) { pendingConversationId = null; return; }
    if (distance(player.x, player.y, bot.x, bot.y) <= 135) beginConversation(bot, 'approach');
    else if (bot.holdTimer <= 0) {
      addFeed('warning', `${bot.name} stopped waiting and drifted back into camp.`);
      pendingConversationId = null;
    }
  }

  function checkConversationDistance() {
    if (!conversation.active) return;
    const bot = bots.find(b => b.id === conversation.botId);
    if (!bot) { endConversation(false); return; }
    if (distance(player.x, player.y, bot.x, bot.y) > 230 && !bot.followingPlayer) {
      addConversationLine('system', `${bot.name} lets the conversation drop as you move away.`);
      endConversation(true);
    }
  }

  function followOffsetFor(bot) {
    const n = botNames.indexOf(bot.name);
    const angle = (n * 1.9) % (Math.PI * 2);
    return { x: Math.cos(angle) * 72, y: Math.sin(angle) * 48 };
  }

  function bumpMeter(id, amount) {
    meters[id].value = Math.min(100, Number(meters[id].value) + amount);
  }

  function findSuspiciousPair() {
    const used = new Set();
    for (const a of bots) {
      if (used.has(a.id) || !a.pairingWith) continue;
      const b = bots.find(x => x.id === a.pairingWith);
      if (!b) continue;
      const zone = zoneAt((a.x + b.x) / 2, (a.y + b.y) / 2);
      if (zone && ['Private', 'Private-ish'].includes(zone.privacy)) {
        used.add(a.id); used.add(b.id);
        return { a, b, zone };
      }
    }
    return null;
  }

  function nearbyActors(zoneOrPoint) {
    if (!zoneOrPoint) return [];
    const z = zoneOrPoint.r ? zoneOrPoint : { x: zoneOrPoint.x, y: zoneOrPoint.y, r: 130 };
    return [player, ...bots].filter(a => distance(a.x, a.y, z.x, z.y) <= z.r);
  }

