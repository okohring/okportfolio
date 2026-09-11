  function drawTree(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#6f5136';
    roundRect(-size * 0.13, size * 0.32, size * 0.26, size * 0.42, size * 0.07); ctx.fill();
    ctx.fillStyle = '#4f7d4f';
    ctx.beginPath(); ctx.arc(0, -size * 0.18, size * 0.62, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#66965e';
    ctx.beginPath(); ctx.arc(-size * 0.25, -size * 0.05, size * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(size * 0.28, size * 0.02, size * 0.48, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawTents(x, y) {
    drawTent(x - 70, y + 20, 1.0);
    drawTent(x + 75, y - 20, 1.0);
    drawLanternString(x - 160, y + 120, x + 190, y + 80);
  }

  function drawTent(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(72,48,32,.22)'; blob(0, 62, 105, 28, 0);
    ctx.fillStyle = '#f6e8ca';
    ctx.beginPath(); ctx.moveTo(-72, 48); ctx.lineTo(0, -76); ctx.lineTo(78, 50); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#dfc8a7';
    ctx.beginPath(); ctx.moveTo(0, -76); ctx.lineTo(78, 50); ctx.lineTo(42, 50); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(109,78,48,.45)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#7a583b'; roundRect(-23, 10, 46, 40, 8); ctx.fill();
    ctx.restore();
  }

  function drawCampfire(x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(68,45,31,.3)'; ctx.beginPath(); ctx.ellipse(0, 20, 170, 92, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 13; i++) {
      const a = (i / 13) * Math.PI * 2;
      drawRock(Math.cos(a) * 72, Math.sin(a) * 43, 12);
    }
    ctx.fillStyle = '#754c2f'; roundRect(-46, 16, 92, 12, 6); ctx.fill();
    ctx.save(); ctx.rotate(0.6); roundRect(-46, 16, 92, 12, 6); ctx.fill(); ctx.restore();
    const flicker = Math.sin(performance.now() * 0.012) * 6;
    ctx.fillStyle = 'rgba(255,183,76,.28)'; ctx.beginPath(); ctx.arc(0, 0, 76 + flicker, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.moveTo(-22, 35); ctx.quadraticCurveTo(-18, -35, 0, -68 - flicker); ctx.quadraticCurveTo(26, -30, 20, 36); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff09a'; ctx.beginPath(); ctx.moveTo(-9, 31); ctx.quadraticCurveTo(-5, -14, 9, -38); ctx.quadraticCurveTo(21, -4, 8, 35); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawWorkshop(x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(72,48,32,.24)'; blob(0, 60, 175, 52, 0);
    ctx.fillStyle = '#996b42'; roundRect(-145, -35, 290, 118, 16); ctx.fill();
    ctx.fillStyle = '#d1a25f'; roundRect(-160, -100, 320, 80, 28); ctx.fill();
    ctx.strokeStyle = '#6b482e'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-130, -25); ctx.lineTo(-130, 80); ctx.moveTo(130, -25); ctx.lineTo(130, 80); ctx.stroke();
    ctx.fillStyle = '#6f5136'; roundRect(-90, 12, 180, 32, 10); ctx.fill();
    drawLantern(-120, 15); drawLantern(120, 15);
    ctx.restore();
  }

  function drawWell(x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#9d8a72'; ctx.beginPath(); ctx.ellipse(0, 25, 62, 34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5e4a3d'; ctx.beginPath(); ctx.ellipse(0, 20, 42, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7a583b'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(-56, 12); ctx.lineTo(-56, -70); ctx.moveTo(56, 12); ctx.lineTo(56, -70); ctx.moveTo(-68, -70); ctx.lineTo(68, -70); ctx.stroke();
    ctx.strokeStyle = '#dfc8a7'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(0, 18); ctx.stroke();
    ctx.restore();
  }

  function drawDock(x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#8b603d';
    roundRect(-100, 0, 300, 55, 8); ctx.fill();
    roundRect(60, 40, 65, 180, 8); ctx.fill();
    for (let i = 0; i < 7; i++) { ctx.fillStyle = 'rgba(67,43,27,.22)'; roundRect(-92 + i * 43, 4, 6, 47, 3); ctx.fill(); }
    ctx.fillStyle = '#9d7048'; roundRect(155, 120, 180, 70, 30); ctx.fill();
    ctx.fillStyle = '#6d4b35'; roundRect(180, 138, 130, 35, 18); ctx.fill();
    drawLantern(-95, -8); drawLantern(125, -10);
    ctx.restore();
  }

  function drawLookout(x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#7e7e7c'; blob(0, 44, 175, 126, 0.4);
    ctx.fillStyle = '#9b744e'; roundRect(-56, -84, 112, 92, 14); ctx.fill();
    ctx.strokeStyle = '#60412b'; ctx.lineWidth = 5;
    ctx.strokeRect(-65, -91, 130, 20);
    ctx.fillStyle = '#2f4251'; roundRect(-8, -135, 60, 14, 7); ctx.fill();
    ctx.strokeStyle = '#2f4251'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-6, -118); ctx.lineTo(35, -95); ctx.stroke();
    ctx.restore();
  }

  function drawGrove(x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(92, 67, 58, .24)'; blob(0, 20, 170, 95, 0);
    ctx.strokeStyle = '#7da063'; ctx.lineWidth = 20;
    ctx.beginPath(); ctx.arc(0, 0, 80, Math.PI * 0.1, Math.PI * 1.85); ctx.stroke();
    drawLantern(-70, 8); drawLantern(70, 8);
    ctx.fillStyle = '#a998bf'; roundRect(-22, -42, 44, 64, 16); ctx.fill();
    ctx.fillStyle = 'rgba(255,211,122,.35)'; ctx.beginPath(); ctx.arc(0, -10, 38, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawTribeMat(x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#8f6c43'; roundRect(-90, -34, 180, 68, 16); ctx.fill();
    ctx.fillStyle = '#d4b276'; roundRect(-72, -20, 144, 40, 12); ctx.fill();
    ctx.fillStyle = '#63422b'; ctx.font = '700 18px system-ui'; ctx.textAlign = 'center'; ctx.fillText('TRIBE', 0, 6);
    ctx.restore();
  }

  function drawCove(x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#7a583b'; roundRect(-15, -20, 30, 85, 12); ctx.fill();
    ctx.strokeStyle = '#7a583b'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-55, 20); ctx.lineTo(55, 20); ctx.stroke();
    ctx.fillStyle = '#ffbfb2'; drawStar(-80, 70, 11, 5);
    ctx.fillStyle = '#f9d78a'; drawStar(92, 54, 10, 5);
    ctx.restore();
  }

  function drawActors() {
    const all = [player, ...bots].sort((a, b) => a.y - b.y);
    for (const a of all) {
      drawAvatar(a, a.id === 'you');
    }
    drawPairIndicators();
  }

  function drawPairIndicators() {
    const used = new Set();
    for (const a of bots) {
      if (used.has(a.id) || !a.pairingWith) continue;
      const b = bots.find(x => x.id === a.pairingWith);
      if (!b) continue;
      if (distance(a.x, a.y, b.x, b.y) < 140) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,.28)';
        ctx.setLineDash([5, 7]);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(a.x, a.y - 42); ctx.lineTo(b.x, b.y - 42); ctx.stroke();
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 75;
        ctx.fillStyle = 'rgba(255,255,255,.88)'; roundRect(mx - 20, my - 14, 40, 28, 14); ctx.fill();
        ctx.fillStyle = '#574431'; ctx.font = '800 18px system-ui'; ctx.textAlign = 'center'; ctx.fillText('…', mx, my + 3);
        ctx.restore();
      }
      used.add(a.id); used.add(b.id);
    }
  }

  function drawAvatar(a, isPlayer) {
    ctx.save(); ctx.translate(a.x, a.y);
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0, 31, 30, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = a.color; ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = a.accent || '#5b3f30'; ctx.beginPath(); ctx.arc(0, -22, 19, Math.PI, 0); ctx.fill();
    ctx.fillStyle = isPlayer ? '#fff2d4' : '#f6d0aa'; ctx.beginPath(); ctx.arc(0, -7, 17, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a3628'; ctx.beginPath(); ctx.arc(-6, -8, 2.2, 0, Math.PI * 2); ctx.arc(7, -8, 2.2, 0, Math.PI * 2); ctx.fill();
    if (isPlayer) {
      ctx.strokeStyle = '#fff2d4'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.stroke();
    } else if (conversation.botId === a.id) {
      ctx.strokeStyle = '#ffd37a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.9)'; roundRect(-18, -78, 36, 26, 13); ctx.fill();
      ctx.fillStyle = '#574431'; ctx.font = '900 16px system-ui'; ctx.textAlign = 'center'; ctx.fillText('💬', 0, -60);
    } else if (a.holdTimer > 0) {
      ctx.strokeStyle = 'rgba(255, 211, 122, .7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(45,34,25,.8)'; roundRect(-38, 33, 76, 24, 12); ctx.fill();
    ctx.fillStyle = '#fff2d4'; ctx.font = '700 12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(a.name, 0, 45);
    ctx.restore();
  }

  function drawLanternString(x1, y1, x2, y2) {
    ctx.save(); ctx.strokeStyle = 'rgba(94,64,38,.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1+x2)/2, Math.max(y1,y2)+22, x2, y2); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      drawLantern(lerp(x1, x2, t), lerp(y1, y2, t) + Math.sin(t * Math.PI) * 16);
    }
    ctx.restore();
  }

  function drawLantern(x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(255,198,98,.25)'; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffc66a'; roundRect(-6, -9, 12, 18, 5); ctx.fill();
    ctx.strokeStyle = '#5f432d'; ctx.lineWidth = 2; ctx.strokeRect(-8, -11, 16, 22);
    ctx.restore();
  }

  function drawFlower(x, y, i) {
    const colors = ['#f8d3dd', '#f7eea4', '#cab5f4', '#ffffff'];
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = colors[i % colors.length];
    for (let p = 0; p < 4; p++) { ctx.beginPath(); ctx.arc(Math.cos(p * Math.PI/2) * 4, Math.sin(p * Math.PI/2) * 4, 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#f6c761'; ctx.beginPath(); ctx.arc(0,0,2.5,0,Math.PI*2); ctx.fill(); ctx.restore();
  }

  function drawRock(x, y, r) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#9d9a88';
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.25, r, 0.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }

  function drawStar(x, y, r, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const rr = i % 2 ? r * 0.45 : r;
      const a = -Math.PI / 2 + i * Math.PI / points;
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
  }

  function drawVignette(w, h) {
    const g = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.2, w/2, h/2, Math.max(w,h)*0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(13,22,32,.28)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  function blob(x, y, rx, ry, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
  }

  function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function getZone(id) { return zones.find(z => z.id === id); }
  function distance(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function randomPointNear(x, y, r) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.sqrt(Math.random()) * r;
    return { x: clamp(x + Math.cos(a) * d, 80, world.width - 80), y: clamp(y + Math.sin(a) * d, 80, world.height - 80) };
  }
  function randSeed(n) { return (Math.sin(n * 999.341) * 43758.5453) % 1 - Math.floor((Math.sin(n * 999.341) * 43758.5453) % 1); }
  function zoneAt(x, y) {
    const sorted = [...zones].sort((a,b) => distance(x,y,a.x,a.y) - distance(x,y,b.x,b.y));
    return sorted.find(z => distance(x, y, z.x, z.y) <= z.r) || null;
  }

