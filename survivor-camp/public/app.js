(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const canvas = $('game');
  const ctx = canvas.getContext('2d');
  const ui = {
    actionBar: $('actionBar'), feedLines: $('feedLines'), chatForm: $('chatForm'), chatInput: $('chatInput'),
    timerText: $('timerText'), phaseIcon: $('phaseIcon'), phaseTitle: $('phaseTitle'), phaseSubtitle: $('phaseSubtitle'),
    worldTime: $('worldTime'), zoneName: $('zoneName'), zoneRead: $('zoneRead'), startModal: $('startModal'),
    startButton: $('startButton'), phaseEnd: $('phaseEnd'), phaseSummary: $('phaseSummary'),
    challengeStartButton: $('challengeStartButton'), challengeModal: $('challengeModal'),
    challengeHeading: $('challengeHeading'), challengeRead: $('challengeRead'), challengeTimer: $('challengeTimer'),
    challengeStatus: $('challengeStatus'), tugKnot: $('tugKnot'), pullButton: $('pullButton'),
    challengeRestartButton: $('challengeRestartButton'), conversationPanel: $('conversationPanel'),
    conversationName: $('conversationName'), conversationRead: $('conversationRead'), conversationLog: $('conversationLog'),
    conversationChips: $('conversationChips'), endConversationButton: $('endConversation'),
    meters: { fire: $('fireMeter'), water: $('waterMeter'), shelter: $('shelterMeter') }
  };

  const fallbackConfig = {
    campPhaseSeconds: 30,
    tugOfWar: { durationSeconds: 12, playerPullPerInput: 6.2, opponentPullPerSecond: 17, opponentWaveAmplitude: 2.5, winThreshold: 100 }
  };
  let config = fallbackConfig;

  const WORLD = { width: 1800, height: 1150 };
  const zones = [
    { id: 'grove', name: 'Hidden Grove', x: 330, y: 225, r: 125, privacy: 'Private', read: 'Very private. Useful for real plans — and suspicious optics.', actions: ['Whisper Privately', 'Search for Clue', 'Make a Pact'] },
    { id: 'forest', name: 'Forest Trail', x: 470, y: 430, r: 145, privacy: 'Private-ish', read: 'People can see you leave camp, but not hear the details.', actions: ['Gather Wood', 'Whisper Privately', 'Search Path'] },
    { id: 'shelter', name: 'Shelter', x: 760, y: 420, r: 135, privacy: 'Semi-private', read: 'A useful excuse for a side conversation.', actions: ['Repair Shelter', 'Whisper Nearby', 'Rest'] },
    { id: 'fire', name: 'Fire Pit', x: 970, y: 620, r: 160, privacy: 'Public', read: 'Everyone can see and hear most things here.', actions: ['Speak Publicly', 'Tend Fire', 'Observe Group'] },
    { id: 'well', name: 'Water Well', x: 1210, y: 500, r: 120, privacy: 'Public-ish', read: 'A harmless task spot where information travels fast.', actions: ['Draw Water', 'Chat Casually', 'Listen In'] },
    { id: 'lookout', name: 'Lookout Cliff', x: 1510, y: 260, r: 135, privacy: 'Private', read: 'Great visibility. Terrible optics.', actions: ['Scout Camp', 'Whisper Privately', 'Observe Routes'] },
    { id: 'cove', name: 'Beach Cove', x: 430, y: 860, r: 150, privacy: 'Private-ish', read: 'Quiet enough for a deal. Everyone notices who goes.', actions: ['Gather Food', 'Whisper Privately', 'Cool Off'] },
    { id: 'dock', name: 'Dock', x: 1450, y: 850, r: 155, privacy: 'Semi-private', read: 'Open sightlines, but far from the fire.', actions: ['Collect Water', 'Fish', 'Whisper Nearby'] },
    { id: 'tribeMat', name: 'Tribe Mat', x: 1050, y: 900, r: 120, privacy: 'Public', read: 'The tribe gathers here when the phase changes.', actions: ['Wait for Host', 'Read the Room'] }
  ];
  const links = [['grove','forest'],['forest','shelter'],['forest','cove'],['shelter','fire'],['fire','well'],['fire','tribeMat'],['well','lookout'],['well','dock'],['dock','tribeMat'],['cove','tribeMat']];
  const botNames = ['Milo', 'Luna', 'Kai', 'Sloane', 'Dex', 'June', 'Theo'];
  const botColors = ['#b994f0','#f8c36a','#91d1f2','#f49ab5','#9ad68f','#f0a47a','#cdbda1'];

  const keys = new Set();
  const camera = { x: 0, y: 0 };
  const player = { id: 'you', name: 'You', x: 970, y: 740, destX: 970, destY: 740, speed: 235, color: '#ffd37a' };
  let bots = [];
  let feed = [];
  let phase = 'INTRO';
  let phaseRemaining = config.campPhaseSeconds;
  let challengeRemaining = config.tugOfWar.durationSeconds;
  let tugPosition = 0;
  let lastFrame = 0;
  let worldMinutes = 12;
  let conversationBotId = null;
  let stats = freshStats();

  function freshStats() { return { privateSplits: 0, publicChats: 0, taskActions: 0, conversations: 0 }; }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function zoneById(id) { return zones.find((z) => z.id === id); }
  function zoneAt(x, y) { return [...zones].sort((a,b) => Math.hypot(x-a.x,y-a.y)-Math.hypot(x-b.x,y-b.y)).find((z) => Math.hypot(x-z.x,y-z.y) <= z.r) || null; }
  function randomPoint(zone) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random()) * zone.r * 0.55;
    return { x: zone.x + Math.cos(angle) * radius, y: zone.y + Math.sin(angle) * radius };
  }
  function formatClock(seconds) {
    const whole = Math.max(0, Math.ceil(seconds));
    return `${String(Math.floor(whole / 60)).padStart(2,'0')}:${String(whole % 60).padStart(2,'0')}`;
  }

  async function loadConfig() {
    try {
      const response = await fetch('/api/config');
      if (!response.ok) throw new Error(String(response.status));
      config = await response.json();
    } catch (error) {
      console.warn('Using frontend config fallback.', error);
    }
    phaseRemaining = config.campPhaseSeconds;
    challengeRemaining = config.tugOfWar.durationSeconds;
    ui.timerText.textContent = formatClock(phaseRemaining);
    ui.challengeTimer.textContent = challengeRemaining.toFixed(1);
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initBots() {
    bots = botNames.map((name, index) => {
      const zone = choice(zones);
      const p = randomPoint(zone);
      return { id: name.toLowerCase(), name, x: p.x, y: p.y, destX: p.x, destY: p.y, speed: 105 + Math.random()*55, color: botColors[index], thinkIn: 1 + Math.random()*4, zoneId: zone.id };
    });
  }

  function startCamp() {
    phase = 'CAMP';
    phaseRemaining = config.campPhaseSeconds;
    challengeRemaining = config.tugOfWar.durationSeconds;
    tugPosition = 0;
    worldMinutes = 12;
    stats = freshStats();
    player.x = player.destX = 970; player.y = player.destY = 740;
    conversationBotId = null;
    initBots();
    feed = [];
    addFeed('system', 'Camp opened. The timer is running.');
    addFeed('private', 'Sloane and Dex are already drifting away from the fire.');
    ui.startModal.classList.add('hidden');
    ui.phaseEnd.classList.add('hidden');
    ui.challengeModal.classList.add('hidden');
    ui.conversationPanel.classList.add('hidden');
    ui.phaseIcon.textContent = '🔥';
    ui.phaseTitle.textContent = 'CAMP PHASE';
    ui.phaseSubtitle.textContent = 'Move, gather, whisper, and watch who leaves.';
    ui.timerText.textContent = formatClock(phaseRemaining);
    renderZoneUI();
  }

  function endCamp() {
    if (phase !== 'CAMP') return;
    phase = 'CAMP_RESULT';
    endConversation();
    const zone = zoneAt(player.x, player.y);
    ui.phaseSummary.textContent = `You ended near ${zone?.name || 'the paths'} after ${stats.privateSplits} private/suspicious moments, ${stats.publicChats} public chats, ${stats.taskActions} camp tasks, and ${stats.conversations} direct conversations.`;
    ui.phaseEnd.classList.remove('hidden');
  }

  function startChallenge() {
    phase = 'TUG';
    challengeRemaining = config.tugOfWar.durationSeconds;
    tugPosition = 0;
    ui.phaseEnd.classList.add('hidden');
    ui.challengeModal.classList.remove('hidden');
    ui.pullButton.classList.remove('hidden');
    ui.challengeRestartButton.classList.add('hidden');
    ui.phaseIcon.textContent = '🪢';
    ui.phaseTitle.textContent = 'TUG OF WAR';
    ui.phaseSubtitle.textContent = 'Mash PULL! or press Space.';
    ui.challengeHeading.textContent = 'Tug of War';
    ui.challengeRead.innerHTML = 'Mash <strong>PULL!</strong> or press <strong>Space</strong>. Get the knot onto your side before time runs out.';
    updateTugUI();
  }

  function pull() {
    if (phase !== 'TUG') return;
    const limit = config.tugOfWar.winThreshold;
    tugPosition = clamp(tugPosition + config.tugOfWar.playerPullPerInput, -limit, limit);
    if (tugPosition >= limit) finishChallenge(true);
    updateTugUI();
  }

  function finishChallenge(won) {
    if (phase !== 'TUG') return;
    phase = 'RESULT';
    ui.pullButton.classList.add('hidden');
    ui.challengeRestartButton.classList.remove('hidden');
    ui.timerText.textContent = '00:00';
    ui.challengeHeading.textContent = won ? 'Your Tribe Wins!' : 'Your Tribe Loses';
    ui.challengeRead.textContent = won ? 'You pulled the knot across your line and won immunity.' : 'The other tribe pulled the knot across their line.';
    ui.challengeStatus.textContent = won ? '🏆 IMMUNITY!' : 'The other tribe takes immunity.';
  }

  function updateTug(dt) {
    if (phase !== 'TUG') return;
    challengeRemaining = Math.max(0, challengeRemaining - dt);
    const t = config.tugOfWar;
    const enemy = t.opponentPullPerSecond + Math.sin(performance.now()/260) * t.opponentWaveAmplitude;
    tugPosition = clamp(tugPosition - enemy*dt, -t.winThreshold, t.winThreshold);
    if (tugPosition <= -t.winThreshold) finishChallenge(false);
    else if (challengeRemaining <= 0) finishChallenge(tugPosition > 0);
    updateTugUI();
  }

  function updateTugUI() {
    const limit = config.tugOfWar.winThreshold;
    ui.tugKnot.style.left = `${50 + (tugPosition/limit)*46}%`;
    ui.challengeTimer.textContent = challengeRemaining.toFixed(1);
    ui.timerText.textContent = formatClock(challengeRemaining);
    ui.challengeStatus.textContent = tugPosition > 45 ? 'Your tribe is taking control!' : tugPosition > 8 ? 'You have the edge — keep pulling!' : tugPosition < -45 ? 'They are dragging you hard — mash!' : tugPosition < -8 ? 'The other tribe has the edge!' : 'Dead even — pull!';
  }

  function updateCamp(dt) {
    phaseRemaining = Math.max(0, phaseRemaining - dt);
    ui.timerText.textContent = formatClock(phaseRemaining);
    worldMinutes += dt * 3.2;
    const hour = 18 + Math.floor(worldMinutes/60);
    ui.worldTime.textContent = `${String(hour).padStart(2,'0')}:${String(Math.floor(worldMinutes%60)).padStart(2,'0')}`;
    if (phaseRemaining <= 0) { endCamp(); return; }
    updatePlayer(dt);
    updateBots(dt);
    renderZoneUI();
  }

  function updatePlayer(dt) {
    let dx = 0, dy = 0;
    if (keys.has('w') || keys.has('arrowup')) dy -= 1;
    if (keys.has('s') || keys.has('arrowdown')) dy += 1;
    if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
    if (keys.has('d') || keys.has('arrowright')) dx += 1;
    if (dx || dy) {
      const len = Math.hypot(dx,dy);
      player.x = clamp(player.x + dx/len*player.speed*dt, 50, WORLD.width-50);
      player.y = clamp(player.y + dy/len*player.speed*dt, 50, WORLD.height-50);
      player.destX = player.x; player.destY = player.y;
    } else moveToward(player, dt);
    camera.x = clamp(player.x - innerWidth/2, 0, Math.max(0, WORLD.width-innerWidth));
    camera.y = clamp(player.y - innerHeight/2, 0, Math.max(0, WORLD.height-innerHeight));
  }

  function updateBots(dt) {
    for (const bot of bots) {
      bot.thinkIn -= dt;
      if (bot.thinkIn <= 0 && Math.hypot(bot.destX-bot.x,bot.destY-bot.y) < 25) {
        const zone = choice(zones);
        const p = randomPoint(zone);
        bot.destX = p.x; bot.destY = p.y; bot.zoneId = zone.id; bot.thinkIn = 4 + Math.random()*8;
        if (['Private','Private-ish'].includes(zone.privacy) && Math.random() < .35) {
          stats.privateSplits += 1;
          addFeed('private', `${bot.name} drifted toward ${zone.name}.`);
        }
      }
      moveToward(bot, dt);
    }
  }

  function moveToward(actor, dt) {
    const dx = actor.destX-actor.x, dy = actor.destY-actor.y;
    const len = Math.hypot(dx,dy);
    if (len < 3) return;
    const step = Math.min(len, actor.speed*dt);
    actor.x += dx/len*step; actor.y += dy/len*step;
  }

  function addFeed(type, text) {
    feed.unshift({ type, text }); feed = feed.slice(0,6);
    ui.feedLines.innerHTML = feed.slice(0,3).map((item) => `<div class="feed-line ${item.type}">${escapeHtml(item.text)}</div>`).join('');
  }
  function escapeHtml(text) { return String(text).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function renderZoneUI() {
    const zone = zoneAt(player.x, player.y);
    ui.zoneName.textContent = zone?.name || 'Between Camp Zones';
    ui.zoneRead.textContent = zone?.read || 'Move toward a camp location to reveal social options.';
    ui.actionBar.innerHTML = (zone?.actions || ['Observe Camp']).map((action,index) => `<button data-action="${escapeHtml(action)}" class="${index===0?'primary':''}">${escapeHtml(action)}</button>`).join('');
  }

  function doAction(action) {
    const zone = zoneAt(player.x, player.y);
    stats.taskActions += 1;
    if (action.includes('Speak') || action.includes('Chat')) stats.publicChats += 1;
    if (action.includes('Whisper') || action.includes('Pact')) stats.privateSplits += 1;
    if (action.includes('Fire')) ui.meters.fire.value = Math.min(100, ui.meters.fire.value + 8);
    if (action.includes('Water')) ui.meters.water.value = Math.min(100, ui.meters.water.value + 8);
    if (action.includes('Shelter')) ui.meters.shelter.value = Math.min(100, ui.meters.shelter.value + 8);
    addFeed(zone?.privacy?.includes('Private') ? 'private' : 'system', `You: ${action} at ${zone?.name || 'camp'}.`);
  }

  function beginConversation(bot) {
    if (distance(player, bot) > 100) { player.destX = bot.x; player.destY = bot.y; addFeed('system', `Moving closer to ${bot.name}…`); return; }
    conversationBotId = bot.id; stats.conversations += 1;
    ui.conversationPanel.classList.remove('hidden');
    ui.conversationName.textContent = bot.name;
    ui.conversationRead.textContent = `${bot.name} glances around before answering.`;
    ui.conversationLog.innerHTML = `<div class="conversation-line system">You started a conversation with ${bot.name}.</div>`;
    ui.conversationChips.innerHTML = ['What are you thinking?','Want to work together?','Who do you trust?'].map((text) => `<button data-say="${text}">${text}</button>`).join('');
  }

  function endConversation() { conversationBotId = null; ui.conversationPanel.classList.add('hidden'); }
  function sayToConversation(text) {
    const bot = bots.find((b) => b.id === conversationBotId); if (!bot) return;
    const replies = ['I am still figuring everyone out.','Keep your eyes on who keeps disappearing together.','I can work with that — for now.','The fire is public. The real game is happening around the edges.'];
    ui.conversationLog.insertAdjacentHTML('beforeend', `<div class="conversation-line you">You: ${escapeHtml(text)}</div><div class="conversation-line npc">${bot.name}: ${escapeHtml(choice(replies))}</div>`);
    ui.conversationLog.scrollTop = ui.conversationLog.scrollHeight;
  }

  function draw() {
    const w = innerWidth, h = innerHeight;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = '#18435a'; ctx.fillRect(0,0,w,h);
    ctx.save(); ctx.translate(-camera.x,-camera.y);
    ctx.fillStyle = '#cdbb73'; ctx.beginPath(); ctx.ellipse(WORLD.width/2,WORLD.height/2,WORLD.width*.48,WORLD.height*.46,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#7eaa67'; ctx.beginPath(); ctx.ellipse(WORLD.width/2,WORLD.height/2-25,WORLD.width*.43,WORLD.height*.39,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(88,65,42,.28)'; ctx.lineWidth = 13; ctx.lineCap = 'round';
    for (const [aId,bId] of links) { const a=zoneById(aId), b=zoneById(bId); ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
    for (const zone of zones) {
      ctx.fillStyle = zone.privacy.includes('Private') ? 'rgba(105,67,135,.16)' : 'rgba(255,244,196,.13)';
      ctx.beginPath(); ctx.arc(zone.x,zone.y,zone.r,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(53,42,31,.82)'; ctx.font = '700 16px system-ui'; ctx.textAlign = 'center'; ctx.fillText(zone.name,zone.x,zone.y-zone.r-10);
    }
    drawActor(player,true); bots.forEach((bot) => drawActor(bot,false));
    ctx.restore();
  }

  function drawActor(actor,isPlayer) {
    ctx.save(); ctx.translate(actor.x,actor.y);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0,22,24,8,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = actor.color; ctx.beginPath(); ctx.arc(0,0,22,0,Math.PI*2); ctx.fill();
    if (isPlayer) { ctx.strokeStyle='#fff2d4'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(0,0,29,0,Math.PI*2); ctx.stroke(); }
    ctx.fillStyle='rgba(45,34,25,.78)'; ctx.fillRect(-33,28,66,20); ctx.fillStyle='#fff2d4'; ctx.font='700 11px system-ui'; ctx.textAlign='center'; ctx.fillText(actor.name,0,42);
    ctx.restore();
  }

  function loop(time) {
    const dt = Math.min(.033, lastFrame ? (time-lastFrame)/1000 : 0); lastFrame = time;
    if (phase === 'CAMP') updateCamp(dt);
    if (phase === 'TUG') updateTug(dt);
    draw(); requestAnimationFrame(loop);
  }

  canvas.addEventListener('click', (event) => {
    if (phase !== 'CAMP') return;
    const x = event.clientX + camera.x, y = event.clientY + camera.y;
    const bot = bots.find((b) => Math.hypot(b.x-x,b.y-y) < 38);
    if (bot) { beginConversation(bot); return; }
    endConversation(); player.destX = clamp(x,50,WORLD.width-50); player.destY = clamp(y,50,WORLD.height-50);
  });
  addEventListener('keydown', (event) => {
    if (document.activeElement === ui.chatInput) return;
    if (phase === 'TUG' && event.code === 'Space') { event.preventDefault(); if (!event.repeat) pull(); return; }
    if (event.key.toLowerCase() === 't' && phase === 'CAMP') { event.preventDefault(); ui.chatInput.focus(); return; }
    keys.add(event.key.toLowerCase());
  });
  addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  addEventListener('resize', resize);
  ui.actionBar.addEventListener('click', (event) => { const b=event.target.closest('[data-action]'); if (b && phase==='CAMP') doAction(b.dataset.action); });
  ui.conversationChips.addEventListener('click', (event) => { const b=event.target.closest('[data-say]'); if (b) sayToConversation(b.dataset.say); });
  ui.endConversationButton.addEventListener('click', endConversation);
  ui.chatForm.addEventListener('submit', (event) => {
    event.preventDefault(); const text=ui.chatInput.value.trim(); if (!text || phase!=='CAMP') return;
    if (conversationBotId) sayToConversation(text); else { addFeed('system', `You: ${text}`); stats.publicChats += 1; }
    ui.chatInput.value='';
  });
  ui.startButton.addEventListener('click', startCamp);
  ui.challengeStartButton.addEventListener('click', startChallenge);
  ui.pullButton.addEventListener('click', pull);
  ui.challengeRestartButton.addEventListener('click', startCamp);

  resize(); initBots(); renderZoneUI(); loadConfig(); requestAnimationFrame(loop);
})();
