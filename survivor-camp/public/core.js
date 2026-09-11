  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const actionBar = document.getElementById('actionBar');
  const feedLines = document.getElementById('feedLines');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const timerText = document.getElementById('timerText');
  const worldTime = document.getElementById('worldTime');
  const zoneName = document.getElementById('zoneName');
  const zoneRead = document.getElementById('zoneRead');
  const startModal = document.getElementById('startModal');
  const startButton = document.getElementById('startButton');
  const phaseEnd = document.getElementById('phaseEnd');
  const phaseSummary = document.getElementById('phaseSummary');
  const phaseIcon = document.getElementById('phaseIcon');
  const phaseTitle = document.getElementById('phaseTitle');
  const challengeStartButton = document.getElementById('challengeStartButton');
  const challengeModal = document.getElementById('challengeModal');
  const challengeHeading = document.getElementById('challengeHeading');
  const challengeRead = document.getElementById('challengeRead');
  const challengeTimer = document.getElementById('challengeTimer');
  const challengeStatus = document.getElementById('challengeStatus');
  const tugKnot = document.getElementById('tugKnot');
  const pullButton = document.getElementById('pullButton');
  const challengeContinueButton = document.getElementById('challengeContinueButton');
  const tribalModal = document.getElementById('tribalModal');
  const tribalHeading = document.getElementById('tribalHeading');
  const tribalRead = document.getElementById('tribalRead');
  const tribalTimer = document.getElementById('tribalTimer');
  const tribalCandidates = document.getElementById('tribalCandidates');
  const tribalVoteStatus = document.getElementById('tribalVoteStatus');
  const tribalCastButton = document.getElementById('tribalCastButton');
  const tribalTally = document.getElementById('tribalTally');
  const tribalRestartButton = document.getElementById('tribalRestartButton');
  const conversationPanel = document.getElementById('conversationPanel');
  const conversationName = document.getElementById('conversationName');
  const conversationRead = document.getElementById('conversationRead');
  const conversationLog = document.getElementById('conversationLog');
  const conversationChips = document.getElementById('conversationChips');
  const endConversationButton = document.getElementById('endConversation');
  const meters = {
    fire: document.getElementById('fireMeter'),
    water: document.getElementById('waterMeter'),
    food: document.getElementById('foodMeter'),
    shelter: document.getElementById('shelterMeter')
  };

  const world = { width: 2300, height: 1560 };
  const camera = { x: 0, y: 0 };
  const keys = new Set();

  const zones = [
    {
      id: 'fire', name: 'Fire Pit', x: 1120, y: 760, r: 220, privacy: 'Public', color: 'rgba(255, 188, 93, 0.18)',
      read: 'Everyone can see and hear most things here. Good for group talk, bad for secrecy.',
      actions: ['Speak Publicly', 'Tend Fire', 'Observe Group', 'Call a Huddle']
    },
    {
      id: 'shelter', name: 'Shelter', x: 780, y: 555, r: 210, privacy: 'Semi-private', color: 'rgba(255, 233, 188, 0.18)',
      read: 'Close enough to camp to be noticed, private enough for side deals.',
      actions: ['Repair Shelter', 'Whisper Nearby', 'Rest', 'Check Alliances']
    },
    {
      id: 'workshop', name: 'Workstation', x: 1160, y: 430, r: 165, privacy: 'Semi-private', color: 'rgba(181, 149, 104, 0.18)',
      read: 'A productive excuse to talk while looking busy.',
      actions: ['Craft Tool', 'Sort Supplies', 'Whisper Nearby', 'Listen In']
    },
    {
      id: 'forest', name: 'Forest Trail', x: 430, y: 420, r: 235, privacy: 'Private-ish', color: 'rgba(123, 178, 122, 0.18)',
      read: 'People can see you leave camp, but they cannot hear the details.',
      actions: ['Gather Wood', 'Whisper Privately', 'Search Path', 'Head Back']
    },
    {
      id: 'grove', name: 'Hidden Grove', x: 520, y: 215, r: 170, privacy: 'Private', color: 'rgba(169, 130, 199, 0.18)',
      read: 'Very private. Very suspicious. Good place for a real plan or a fake one.',
      actions: ['Whisper Privately', 'Search for Clue', 'Make a Pact', 'Leave Quietly']
    },
    {
      id: 'cove', name: 'Beach Cove', x: 375, y: 1080, r: 230, privacy: 'Private-ish', color: 'rgba(255, 218, 158, 0.2)',
      read: 'A soft-looking escape route. If two people come here, everyone wonders why.',
      actions: ['Gather Food', 'Whisper Privately', 'Cool Off', 'Look for Footprints']
    },
    {
      id: 'dock', name: 'Dock', x: 1785, y: 1080, r: 245, privacy: 'Semi-private', color: 'rgba(117, 198, 214, 0.18)',
      read: 'Open sightlines, but far from the fire. People can see pairs forming from across camp.',
      actions: ['Collect Water', 'Fish', 'Whisper Nearby', 'Watch Shore']
    },
    {
      id: 'lookout', name: 'Lookout Cliff', x: 1870, y: 330, r: 190, privacy: 'Private', color: 'rgba(177, 188, 206, 0.18)',
      read: 'Great visibility. Terrible optics. Anyone up here is probably watching the tribe.',
      actions: ['Scout Camp', 'Whisper Privately', 'Signal Someone', 'Observe Routes']
    },
    {
      id: 'well', name: 'Water Well', x: 1420, y: 645, r: 150, privacy: 'Public-ish', color: 'rgba(150, 207, 216, 0.16)',
      read: 'A harmless-looking task spot where casual information travels fast.',
      actions: ['Draw Water', 'Chat Casually', 'Listen In', 'Wash Up']
    },
    {
      id: 'tribeMat', name: 'Tribe Mat', x: 1260, y: 1140, r: 170, privacy: 'Public', color: 'rgba(197, 155, 92, 0.16)',
      read: 'Announcements happen here. People gather when the phase is about to change.',
      actions: ['Wait for Host', 'Count Players', 'Read the Room']
    }
  ];

  const paths = [
    ['grove','forest'], ['forest','shelter'], ['forest','cove'], ['shelter','fire'],
    ['workshop','fire'], ['workshop','well'], ['fire','well'], ['fire','tribeMat'],
    ['well','dock'], ['dock','tribeMat'], ['well','lookout'], ['lookout','workshop'],
    ['cove','tribeMat'], ['cove','fire']
  ];

  const botPalette = ['#b994f0', '#f8c36a', '#91d1f2', '#f49ab5', '#9ad68f', '#f0a47a', '#cdbda1'];
  const botNames = ['Milo', 'Luna', 'Kai', 'Sloane', 'Dex', 'June', 'Theo'];
  let bots = [];
  let feed = [];
  let lastTimestamp = 0;
  const fallbackConfig = {
    campPhaseSeconds: 30,
    tugOfWar: { durationSeconds: 12, playerPullPerInput: 6.2, opponentPullPerSecond: 17, opponentWaveAmplitude: 2.5, winThreshold: 100 },
    tribalCouncil: { durationSeconds: 30 }
  };
  let config = fallbackConfig;
  let phase = 'INTRO';
  let running = false;
  let phaseRemaining = fallbackConfig.campPhaseSeconds;
  let challengeRemaining = fallbackConfig.tugOfWar.durationSeconds;
  let tugPosition = 0;
  let lastChallengeWon = null;
  let tribalRemaining = fallbackConfig.tribalCouncil.durationSeconds;
  let tribalSpectator = false;
  let tribalRoster = [];
  let selectedVote = null;
  let voteCast = false;
  let npcVotes = [];
  const opponentNames = ['Aria', 'Beck', 'Nico', 'Mae', 'Jett', 'Rina', 'Owen', 'Vale'];
  let worldMinute = 12;
  let storyStats = { privateSplits: 0, publicChats: 0, taskActions: 0, conversations: 0 };
  let conversation = { active: false, botId: null, log: [] };
  let pendingConversationId = null;

  const player = {
    id: 'you', name: 'You', x: 1120, y: 880, destX: 1120, destY: 880,
    color: '#ffd37a', accent: '#fff2d4', speed: 185, moving: false, zoneId: null
  };

  async function loadConfig() {
    try {
      const response = await fetch('/api/config');
      if (!response.ok) throw new Error(String(response.status));
      const remote = await response.json();
      config = { ...fallbackConfig, ...remote, tugOfWar: { ...fallbackConfig.tugOfWar, ...(remote.tugOfWar || {}) }, tribalCouncil: { ...fallbackConfig.tribalCouncil, ...(remote.tribalCouncil || {}) } };
    } catch (error) {
      console.warn('Using local prototype config.', error);
    }
    if (phase === 'INTRO') timerText.textContent = formatClock(config.campPhaseSeconds);
  }

  function formatClock(seconds) {
    const whole = Math.max(0, Math.ceil(seconds));
    return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
  }

  function resize() {
    canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
    canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function restart() {
    phase = 'CAMP';
    phaseRemaining = config.campPhaseSeconds;
    challengeRemaining = config.tugOfWar.durationSeconds;
    tribalRemaining = config.tribalCouncil.durationSeconds;
    lastChallengeWon = null;
    tugPosition = 0;
    selectedVote = null;
    voteCast = false;
    worldMinute = 12;
    player.x = 1120; player.y = 880; player.destX = player.x; player.destY = player.y;
    storyStats = { privateSplits: 0, publicChats: 0, taskActions: 0, conversations: 0 };
    endConversation(false);
    meters.fire.value = 58;
    meters.water.value = 45;
    meters.food.value = 42;
    meters.shelter.value = 50;
    initBots();
    feed = [];
    addFeed('system', 'Camp opened. The timer is running. People are already drifting into pairs.');
    addFeed('private', 'Sloane and Dex are standing just far enough from the fire to be annoying.');
    addFeed('system', 'Tip: click the forest, cove, dock, or lookout to test “going off” together.');
    running = true;
    phaseEnd.classList.add('hidden');
    challengeModal.classList.add('hidden');
    tribalModal.classList.add('hidden');
    phaseIcon.textContent = '🔥';
    phaseTitle.textContent = 'CAMP PHASE';
    document.getElementById('phaseSubtitle').textContent = 'Move, gather, whisper, and keep camp alive.';
    timerText.textContent = formatClock(phaseRemaining);
  }

  function initBots() {
    bots = botNames.map((name, i) => {
      const zone = randomChoice(zones);
      const point = randomPointNear(zone.x, zone.y, zone.r * 0.55);
      return {
        id: name.toLowerCase(), name,
        x: point.x, y: point.y, destX: point.x, destY: point.y,
        color: botPalette[i], accent: i % 2 ? '#704f38' : '#3f3550',
        speed: 92 + Math.random() * 60,
        zoneId: zone.id,
        nextDecision: 1 + Math.random() * 4,
        pairingWith: null,
        mood: randomChoice(['busy', 'nervous', 'scheming', 'social', 'watching']),
        lockedBy: null,
        holdTimer: 0,
        followingPlayer: false
      };
    });
    // Start with one suspicious pair so the map immediately communicates the idea.
    sendPairToZone(bots[3], bots[4], getZone('forest'));
  }

  function addFeed(type, text) {
    feed.unshift({ type, text, t: Date.now() });
    feed = feed.slice(0, 6);
    renderFeed();
  }

  function renderFeed() {
    feedLines.innerHTML = feed.slice(0, 3).map(item => `<div class="feed-line ${item.type}">${escapeHtml(item.text)}</div>`).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }

  function updateTimer(dt) {
    if (!running) return;
    phaseRemaining = Math.max(0, phaseRemaining - dt);
    const m = Math.floor(phaseRemaining / 60);
    const s = Math.floor(phaseRemaining % 60);
    timerText.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (phaseRemaining < 45) timerText.parentElement.style.borderColor = 'rgba(255, 150, 104, .75)';
    else timerText.parentElement.style.borderColor = '';

    worldMinute += dt * 3.2;
    const hr = 18 + Math.floor(worldMinute / 60);
    const min = Math.floor(worldMinute % 60);
    worldTime.textContent = `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

    if (phaseRemaining === 0) endPhase();
  }

  function endPhase() {
    if (!running) return;
    running = false;
    phase = 'CAMP_RESULT';
    const zone = zoneAt(player.x, player.y);
    phaseSummary.textContent = `You ended near ${zone ? zone.name : 'the paths between camp'} after ${storyStats.privateSplits} suspicious split-off moments, ${storyStats.publicChats} public/social moments, ${storyStats.taskActions} camp task actions, and ${storyStats.conversations} direct conversations.`;
    phaseEnd.classList.remove('hidden');
  }

